import { Injectable, ForbiddenException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePass } from 'src/utils/hash';
import { ConfigService } from '@nestjs/config';
import { decryptSecret, encryptSecret, generateTotpSecret, verifyTotp } from 'src/utils/totp';
import { SecurityLogsService } from 'src/security-logs/security-logs.service';
import { AuditEvent } from 'src/security-logs/event-types';
import { AuditOutcome } from 'src/security-logs/entities/security-log.entity';
import { SessionsService } from './sessions.service';

export type RequestMetadata = { ipAddress?: string; userAgent?: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityLogsService: SecurityLogsService,
    private sessionsService: SessionsService,
  ) { }

  async login(loginDto: LoginDto, request: RequestMetadata) {
    const { email, password } = loginDto;
    let user;
    try {
      user = await this.usersService.findByName(email);
    } catch {
      await this.log(AuditEvent.LoginFailure, AuditOutcome.Failure, request, { email });
      throw new UnauthorizedException('Invalid login credentials');
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      await this.log(AuditEvent.LoginFailure, AuditOutcome.Denied, request, { reason: 'account_locked' }, user.id);
      throw new ForbiddenException('Account is temporarily locked');
    }

    const isAuthenticated = await comparePass(password, user.password);

    if (!isAuthenticated) {
      const locked = await this.usersService.registerFailedLogin(user.id, this.numberConfig('AUTH_MAX_FAILED_ATTEMPTS', 5), this.numberConfig('AUTH_FAILURE_WINDOW_MINUTES', 15), this.numberConfig('AUTH_LOCKOUT_MINUTES', 30));
      await this.log(AuditEvent.LoginFailure, AuditOutcome.Failure, request, { email }, user.id);
      if (locked) await this.log(AuditEvent.AccountLockout, AuditOutcome.Success, request, undefined, user.id);
      throw new UnauthorizedException('Invalid login credentials');
    }
    await this.usersService.resetLoginFailures(user.id);

    if (user.mfaEnabled) {
      const mfaToken = await this.jwtService.signAsync(
        { sub: user.id, purpose: 'mfa' },
        { expiresIn: '5m' },
      );
      await this.log(AuditEvent.MfaChallenge, AuditOutcome.Success, request, { result: 'issued' }, user.id);
      return { mfaRequired: true, mfaToken };
    }

    return this.completeLogin(user, request);
  }

  async setupMfa(id: number, request: RequestMetadata) {
    const user = await this.usersService.findForMfa(id);
    if (!user) throw new UnauthorizedException();
    const secret = generateTotpSecret();
    await this.usersService.saveMfaEnrollment(id, this.encrypt(secret));
    await this.log(AuditEvent.MfaChallenge, AuditOutcome.Success, request, { result: 'enrollment_started' }, id);
    const issuer = 'VF MIS';
    return {
      secret,
      otpauthUrl: `otpauth://totp/${encodeURIComponent(`${issuer}:${user.email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`,
    };
  }

  async verifyMfaEnrollment(id: number, code: string, request: RequestMetadata) {
    const user = await this.usersService.findForMfa(id);
    if (!user?.mfaPendingSecret || !verifyTotp(this.decrypt(user.mfaPendingSecret), code)) {
      await this.log(AuditEvent.MfaChallenge, AuditOutcome.Failure, request, { result: 'enrollment_failed' }, id);
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.usersService.enableMfa(id, user.mfaPendingSecret);
    await this.log(AuditEvent.MfaChallenge, AuditOutcome.Success, request, { result: 'enabled' }, id);
    return { enabled: true };
  }

  async verifyMfaLogin(mfaToken: string, code: string, request: RequestMetadata) {
    let payload: { sub: number; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(mfaToken);
    } catch {
      await this.log(AuditEvent.MfaChallenge, AuditOutcome.Failure, request, { reason: 'invalid_challenge' });
      throw new UnauthorizedException('Invalid or expired MFA challenge');
    }
    if (payload.purpose !== 'mfa') throw new UnauthorizedException('Invalid MFA challenge');

    const user = await this.usersService.findForMfa(Number(payload.sub));
    if (!user?.mfaEnabled || !user.mfaSecret || !verifyTotp(this.decrypt(user.mfaSecret), code)) {
      await this.log(AuditEvent.MfaChallenge, AuditOutcome.Failure, request, { result: 'failed' }, Number(payload.sub));
      throw new UnauthorizedException('Invalid authenticator code');
    }
    return this.completeLogin(user, request);
  }

  async disableMfa(id: number, code: string, request: RequestMetadata) {
    const user = await this.usersService.findForMfa(id);
    if (!user?.mfaEnabled || !user.mfaSecret || !verifyTotp(this.decrypt(user.mfaSecret), code)) {
      await this.log(AuditEvent.MfaChallenge, AuditOutcome.Failure, request, { result: 'disable_failed' }, id);
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.usersService.disableMfa(id);
    await this.log(AuditEvent.MfaChallenge, AuditOutcome.Success, request, { result: 'disabled' }, id);
    return { enabled: false };
  }

  async logout(id: number, sessionId: string, request: RequestMetadata) {
    await this.sessionsService.end(sessionId, 'logout');
    await this.log(AuditEvent.Logout, AuditOutcome.Success, { ...request, sessionId }, undefined, id);
    await this.log(AuditEvent.SessionEnd, AuditOutcome.Success, { ...request, sessionId }, { reason: 'logout' }, id);
    return { loggedOut: true };
  }

  private async completeLogin(user: { id: number; role: string }, request: RequestMetadata) {
    const { session, concurrent, newDevice } = await this.sessionsService.create(user as any, request);
    const context = { ...request, sessionId: session.id };
    await this.log(AuditEvent.LoginSuccess, AuditOutcome.Success, context, undefined, user.id);
    await this.log(AuditEvent.SessionStart, AuditOutcome.Success, context, undefined, user.id);
    if (newDevice) await this.log(AuditEvent.NewDevice, AuditOutcome.Success, context, undefined, user.id);
    if (concurrent) await this.log(AuditEvent.ConcurrentSession, AuditOutcome.Success, context, undefined, user.id);
    return this.issueAccessToken(user.id, user.role, session.id);
  }

  private async issueAccessToken(id: number, role: string, sessionId: string) {
    const payload = {
      sub: id,
      role,
      sid: sessionId,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  private encrypt(secret: string) {
    const key = this.configService.get<string>('MFA_ENCRYPTION_KEY');
    try {
      return encryptSecret(secret, key ?? '');
    } catch (error) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  private decrypt(secret: string) {
    try {
      return decryptSecret(secret, this.configService.get<string>('MFA_ENCRYPTION_KEY') ?? '');
    } catch {
      throw new UnauthorizedException('MFA configuration error');
    }
  }

  private log(eventType: any, actionOutcome: AuditOutcome, request: RequestMetadata & { sessionId?: string }, metadata?: Record<string, unknown>, userId?: number) {
    return this.securityLogsService.record({ eventType, actionOutcome, actorUserId: userId, metadata, sourceIp: request.ipAddress, userAgent: request.userAgent, sessionId: request.sessionId });
  }

  private numberConfig(name: string, fallback: number) { return Number(this.configService.get(name) ?? fallback); }

  async getProfile(id: number) {
   return await this.usersService.findOne(id);
  }
}

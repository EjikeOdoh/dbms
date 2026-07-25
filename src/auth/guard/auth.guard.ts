import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/decorators';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../sessions.service';
import { SecurityLogsService } from '../../security-logs/security-logs.service';
import { AuditEvent } from '../../security-logs/event-types';
import { AuditOutcome } from '../../security-logs/entities/security-log.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private sessionsService: SessionsService,
    private securityLogs: SecurityLogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }


    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!payload.sid) throw new UnauthorizedException();
      const result = await this.sessionsService.validate(payload.sid, Number(payload.sub));
      const metadata = { sourceIp: request.ip, userAgent: request.get('user-agent'), sessionId: payload.sid, actorUserId: String(payload.sub), actorRoleAtTime: payload.role };
      if (!result.valid) {
        if (result.expired) await this.securityLogs.record({ eventType: AuditEvent.SessionExpiry, actionOutcome: AuditOutcome.Success, ...metadata });
        throw new UnauthorizedException();
      }
      if (result.heartbeat) await this.securityLogs.record({ eventType: AuditEvent.Heartbeat, actionOutcome: AuditOutcome.Success, ...metadata });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

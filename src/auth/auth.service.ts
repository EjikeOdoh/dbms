import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePass } from 'src/utils/hash';
import * as speakeasy from 'speakeasy'
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly sessionService: SessionService
  ) { }

  async login(loginDto: LoginDto, ip: string, userAgent: string | undefined): Promise<{
    token: string;
  }> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findByName(email);
    const isAuthenticated = await comparePass(password, user.password)

    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const session = await this.sessionService.create(user.id, ip, userAgent)

    const payload = {
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(id: number) {
    return await this.usersService.findOne(id);
  }

  async enable2FA(userId: number): Promise<{ secret: string }> {
    const user = await this.usersService.findOne(userId)
    if (user.enable2FA) {
      return { secret: user.twoFASecret }
    }
    const secret = speakeasy.generateSecret().base32
    await this.usersService.updateSecretKey(user.id, secret)
    return { secret }
  }

  async disable2FA(userId: number): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId)
    if (!user.enable2FA) {
      return { message: '2FA is already disabled' }
    }
    await this.usersService.disable2FA(userId)
    return { message: '2FA disabled successfully' }
  }

  async validate2FAToken(
    userId: number,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await this.usersService.findOne(userId)
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        token: token,
        encoding: 'base32',
      })

      if (!verified) {
        return { verified: false }
      }

      await this.usersService.update(user.id, { isLoggedIn: true })

      return { verified: true }
    } catch (error) {
      console.debug(error)
      throw new UnauthorizedException('Error verifying token')
    }
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { isLoggedIn: false })
    return {isLoggedIn: false}
  }
}

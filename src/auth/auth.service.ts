import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePass } from 'src/utils/hash';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<{
    token: string;
  }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByName(email);
    const isAuthenticated = await comparePass(password, user.password)

    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    const payload = {
      sub: user.id,
      role: user.role,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(id: number) {
   return await this.usersService.findOne(id);
  }
}

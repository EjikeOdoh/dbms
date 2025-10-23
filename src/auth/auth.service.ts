import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    token: string;
  }> {
    const { name, password } = loginDto;
    const user = await this.usersService.findByName(name);

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    const payload = {
      sub: user.userId,
      role: user.role,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(id: number) {
    const user = await this.usersService.findOne(id);
    return { role: user.role, name: user.name };
  }
}

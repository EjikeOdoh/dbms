import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { name, password } = loginDto
        const user = await this.usersService.findByName(name)
        if (user.password !== password) {
            throw new UnauthorizedException()
        }
        const payload = {
            sub: user.userId,
            username: user.name
        }
        return { token: await this.jwtService.signAsync(payload) }
    }


    async getProfile(id: number) {
        return await this.usersService.findOne(id)
    }

}

import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService
    ) { }

    async login(loginDto: LoginDto) {
        const { name } = loginDto
        return this.usersService.findByName(name)
    }

}

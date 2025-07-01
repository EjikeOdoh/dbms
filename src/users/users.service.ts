import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      name: "admin",
      password: "password",
      role: 'admin'
    },

    {
      userId: 2,
      name: "editor",
      password: "password1",
      role: 'editor'
    },

    {
      userId: 3,
      name: "viewer",
      password: "password2",
      role: 'viewer'
    }
  ]

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.users;
  }

  async findByName(name: string) {
    const user = this.users.find(user => user.name === name)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async findOne(id: number) {
    return this.users.find(user => user.userId === id)
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

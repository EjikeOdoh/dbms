import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) { }
  // private readonly users = [
  //   {
  //     id: 1,
  //     email: 'admin@email.com',
  //     password: 'password',
  //     role: 'admin',
  //   },

  //   {
  //     id: 2,
  //     email: 'editor',
  //     password: 'password1',
  //     role: 'editor',
  //   },

  //   {
  //     id: 3,
  //     email: 'viewer',
  //     password: 'password2',
  //     role: 'viewer',
  //   },
  // ];

  async create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(createUserDto)
    try {
      return await this.usersRepository.save(createUserDto)
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This user already exists.');
      }
      throw new InternalServerErrorException(
        'An error occurred while creating this user',
      );
    }
  }

  findAll() {
    return this.usersRepository.find({
      select: ([
        'id',
        'email',
        'role'
      ])
    });
  }

  async findByName(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException(`User with email "${email}" not found`);
    return user;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, select:['id','email','role'] });
    if (!user) throw new NotFoundException(`User with email "${id}" not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto)
    return await this.findOne(id)
  }

  async remove(id: number) {
    await this.usersRepository.delete(id)
    return { delele: true }
  }
}

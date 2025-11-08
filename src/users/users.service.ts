import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { passHash } from 'src/utils/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto
    const hashedPass = await passHash(password)
    const newUser = this.usersRepository.create({ ...createUserDto, password: hashedPass })
    try {
      return await this.usersRepository.save(newUser)
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
        'role', 'firstName', 'lastName',
      ])
    });
  }

  async findByName(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException(`User with email "${email}" not found`);
    return user;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id }, select: ['id', 'firstName', 'lastName', 'email', 'role'] });
    if (!user) throw new NotFoundException(`User with email "${id}" not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    if (updateUserDto.password) {
      const hashedPass = await passHash(updateUserDto.password)
      await this.usersRepository.update(id, { ...updateUserDto, password: hashedPass })
    } else {
      await this.usersRepository.update(id, updateUserDto)
    }
    return await this.findOne(id)
  }

  async remove(id: number) {
    await this.usersRepository.delete(id)
    return { delele: true }
  }
}

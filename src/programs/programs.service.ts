import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program) private programsRepository: Repository<Program>
  ) { }

  async create(createProgramDto: CreateProgramDto) {

    const program = this.programsRepository.create(createProgramDto)
    try {
      return await this.programsRepository.save(program)
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This program already exists.');
      }
      throw new InternalServerErrorException('An unexpected error occurred while creating this program.');
    }
  }

  async findAll() {
    return this.programsRepository.find();
  }

  async findOne(id: number) {
    return this.programsRepository.findOne({ where: { id } })
  }

  async update(id: number, updateProgramDto: UpdateProgramDto) {
    this.programsRepository.update(id, updateProgramDto)
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.programsRepository.delete(id)
    return { deleted: true };
  }
}

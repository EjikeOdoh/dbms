import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Target } from './entities/target.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target) private targetRepository: Repository<Target>,
  ) {}

  async create(createTargetDto: CreateTargetDto) {
    const target = this.targetRepository.create(createTargetDto);
    try {
      return await this.targetRepository.save(target);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This target already exists.');
      }
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating this target.',
      );
    }
  }

  async findAll() {
    try {
      return await this.targetRepository.find({
        order: { year: 'DESC' },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while getting targets.',
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.targetRepository.findOne({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while getting this target.',
      );
    }
  }

  async findTargetByYear(year: number): Promise<number> {
    try {
      const targetObj = await this.targetRepository.findOne({
        where: { year },
      });

      return targetObj ? targetObj.target : 0;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while getting this target.',
      );
    }
  }

  async update(id: number, updateTargetDto: UpdateTargetDto) {
    try {
      await this.targetRepository.update(id, updateTargetDto);
      return await this.findOne(id);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This target already exist.');
      }
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating this target.',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.targetRepository.delete(id);
      return { deleted: true };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting this target.',
      );
    }
  }
}

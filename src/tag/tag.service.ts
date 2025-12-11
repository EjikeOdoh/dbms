import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participation } from 'src/participation/entities/participation.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(Student) private studentRepository: Repository<Student>,
  ) {}

  async findAll() {
    try {
      return this.participationRepository
        .createQueryBuilder('participation')
        .select([
          'participation.tag AS tag',
          'COUNT(participation.id) AS count',
          'MAX(participation.createdAt) AS latestDate',
        ])
        .groupBy('participation.tag')
        .orderBy('latestDate', 'DESC')
        .getRawMany();
    } catch (error) {
      Logger.log(error);
    }
  }

  async remove(id: string) {
    Logger.log('Delete tags')
    try {
      await this.studentRepository.delete({ tag: id });
      await this.participationRepository.delete({ tag: id });
      return { deleted: true };
    } catch (error) {
      Logger.log(error);
    }
  }
}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Program } from 'src/programs/entities/program.entity';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation) private participationRepository: Repository<Participation>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Program) private programsRepository: Repository<Program>,
  ) { }

  async create(createParticipationDto: CreateParticipationDto) {
    const { studentId, programId, ...rest } = createParticipationDto;

    const student = await this.studentsRepository.findOne({ where: { id: studentId } })
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const p = await this.programsRepository.findOne({ where: { id: programId } })
    if (!p) {
      throw new NotFoundException(`Program not found`)
    }

    const participation = this.participationRepository.create({
      ...rest,
      student,
      program: p
    })

    try {
      return await this.participationRepository.save(participation)
    } catch (error) {
      throw new InternalServerErrorException('An unexpected error occurred while creating the grade.');
    }
  }
  async findAll() {
    return await this.participationRepository
      .createQueryBuilder('participation')
      .leftJoinAndSelect('participation.student', 'student')
      .leftJoin('participation.program', 'program') 
      .addSelect('program.program', 'program') 
      .getRawMany(); 
  }

  findOne(id: number) {
    return `This action returns a #${id} participation`;
  }

  update(id: number, updateParticipationDto: UpdateParticipationDto) {
    return `This action updates a #${id} participation`;
   }

  remove(id: number) {
    return `This action removes a #${id} participation`;
  }
}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Program } from 'src/programs/entities/program.entity';
import { FilterDto } from './dto/filter.dto';
import { filter } from 'rxjs';

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
      throw new InternalServerErrorException('An unexpected error occurred while creating this record.');
    }
  }

  async getStats(year: number) {

    const queryBuilder = this.participationRepository
    .createQueryBuilder('participation')
    .leftJoin('participation.student', 'student')
    .leftJoin('participation.program', 'program');

    if (year) {
      queryBuilder.andWhere('participation.year = :year', { year });
    }

    // Get count by country
    const countByCountry = await queryBuilder
    .select([
      'student.country AS country',
      'COUNT(participation.id) AS count'
    ])
    .groupBy('student.country')
    .getRawMany();

    // Get count by program
    const countByProgram = await queryBuilder
    .select([
      'program.program AS program',
      'COUNT(participation.id) AS count'
    ])
    .groupBy('program.program')
    .getRawMany();

    // Get total count
    const totalCount = await queryBuilder.getCount();

    return {
      year: year ?? 'All',
      totalCount,
      countByCountry,
      countByProgram
    };
  }


  async findByOptions(filterDto?: FilterDto) {
    const queryBuilder = this.participationRepository
      .createQueryBuilder('participation')
      .leftJoin('participation.student', 'student')
      .leftJoin('participation.program', 'program')
      .select([
        'participation.id AS participationId',
        'participation.year AS year',
        'participation.quarter AS quarter',
        'student.id AS studentId',
        'student.firstName AS firstName',
        'student.lastName AS lastName',
        'student.dob AS dob',
        'student.country AS country',
        'program.program AS program',
      ]);

  
    if (filterDto?.year) {
      queryBuilder.andWhere('participation.year = :year', { year: filterDto.year });
    }

    if (filterDto?.program) {
      queryBuilder.andWhere('program.program = :program', { program: filterDto.program });
    }

    const rawResults = await queryBuilder
      .orderBy('participation.year', 'DESC')
      .getRawMany();

    return rawResults.map((result) => ({
      participationId: result.participationid,
      year: result.year,
      quarter: result.quarter,
      studentId: result.studentid,
      firstName: result.firstname,
      lastName: result.lastname,
      dob: result.dob,
      country: result.country,
      program: result.program,
    }));
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

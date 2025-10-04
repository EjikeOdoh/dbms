import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Participation } from './entities/participation.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Program } from 'src/programs/entities/program.entity';
import { FilterDto } from './dto/filter.dto';
import { TargetService } from 'src/target/target.service';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Program) private programsRepository: Repository<Program>,
    private targetService: TargetService,
  ) {}

  async create(createParticipationDto: CreateParticipationDto) {
    const { studentId, programId, ...rest } = createParticipationDto;

    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const p = await this.programsRepository.findOne({
      where: { id: programId },
    });
    if (!p) {
      throw new NotFoundException(`Program not found`);
    }

    const participation = this.participationRepository.create({
      ...rest,
      student,
      program: p,
    });

    try {
      return await this.participationRepository.save(participation);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating this record.',
      );
    }
  }

  async getStats(year?: number) {
    let target: number;

    // Get unique count
    let uniqueCount = await this.studentsRepository.count();

    const queryBuilder = this.participationRepository
      .createQueryBuilder('participation')
      .leftJoin('participation.student', 'student')
      .leftJoin('participation.program', 'program');

    if (year) {
      queryBuilder.andWhere('participation.year = :year', { year });
      uniqueCount = await this.studentsRepository.count({
        where: { yearJoined: year },
      });
      target = await this.targetService.findTargetByYear(year);
    }

    // Get count by country
    const countByCountryLC = await queryBuilder
      .select([
        'LOWER(student.country) AS country',
        'COUNT(participation.id) AS count',
      ])
      .groupBy('LOWER(student.country)')
      .getRawMany();

    console.log(countByCountryLC);

    const countByCountry = countByCountryLC.map((row) => {
      if (row.country !== null) {
        const c = row.country.toLowerCase();
        const country = c.charAt(0).toUpperCase() + c.slice(1);
        return {
          country: country,
          count: Number(row.count),
        };
      } else {
        return {
          country: null,
          count: Number(row.count),
        };
      }
    });

    // Get count by program
    const countByProgram = await queryBuilder
      .select([
        'program.program AS program',
        'COUNT(participation.id) AS count',
      ])
      .groupBy('program.program')
      .getRawMany();

    // Get total count
    const totalCount = await queryBuilder.getCount();

    // Count by year (fresh builder so it's not affected by previous filters)
    const countByYear = await this.participationRepository
      .createQueryBuilder('participation')
      .select([
        'participation.year AS year',
        'COUNT(participation.id) AS count',
      ])
      .groupBy('participation.year')
      .orderBy('participation.year', 'ASC')
      .getRawMany();

    const highestYearlyCount =
      Math.max(...countByYear.map((obj) => obj.count)) | 0;

    // Get count by country (case-insensitive)
    const totalCountByCountryRaw = await this.studentsRepository
      .createQueryBuilder('student')
      .select([
        'LOWER(student.country) AS country',
        'COUNT(student.id) AS count',
      ])
      .groupBy('LOWER(student.country)')
      .getRawMany();

    // Capitalize country names
    const totalCountByCountry = totalCountByCountryRaw.map((row) => {
      if (row.country != null) {
        const c = row.country.toLowerCase();
        const country = c.charAt(0).toUpperCase() + c.slice(1);
        return {
          country: country,
          count: Number(row.count),
        };
      } else {
        return {
          country: null,
          count: Number(row.count),
        };
      }
    });

    const years = (await this.targetService.findAll()).map((x) => x.year);

    return {
      year: year ?? 'All',
      totalCount,
      countByCountry,
      countByProgram,
      uniqueCount,
      countByYear,
      totalCountByCountry,
      highestYearlyCount,
      target: target ?? 0,
      years,
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
      queryBuilder.andWhere('participation.year = :year', {
        year: filterDto.year,
      });
    }

    if (filterDto?.program) {
      queryBuilder.andWhere('program.program = :program', {
        program: filterDto.program,
      });
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
      // count: result.count,
    }));
  }

  async findOne(id: number) {
    return this.participationRepository.findOne({ where: { id } });
  }

  async update(id: number, updateParticipationDto: UpdateParticipationDto) {
    await this.participationRepository.update(id, updateParticipationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.participationRepository.delete(id);
    return { deleted: true };
  }
}

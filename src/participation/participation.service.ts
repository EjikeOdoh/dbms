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
import { FilterByCountryDto, FilterDto, ParticipationReportDto } from './dto/filter.dto';
import { TargetService } from 'src/target/target.service';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Program) private programsRepository: Repository<Program>,
    private targetService: TargetService,
  ) { }

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

  async findByCountry(filterByCountryDto?: FilterByCountryDto) {
    // safe parsing
    const page = Number(filterByCountryDto?.page ?? 1);
    const limit = Number(filterByCountryDto?.limit ?? 10);
    const skip = (page - 1) * limit;

    // build where clause pieces and parameters
    const whereParts: string[] = [];
    const params: any[] = []; // will be used for id query (then we'll append limit & offset)

    if (filterByCountryDto?.country) {
      params.push(filterByCountryDto.country);
      // we'll use LOWER(...) = LOWER($n)
      whereParts.push(`LOWER(s.country) = LOWER($${params.length})`);
    }

    if (filterByCountryDto?.year != null) {
      params.push(filterByCountryDto.year);
      whereParts.push(`p.year = $${params.length}`);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    // ----------------------------
    // 1) get paginated ids (guaranteed LIMIT/OFFSET)
    // ----------------------------
    // note: adjust column names if your DB uses different naming/casing
    const idSql = `
      SELECT p.id
      FROM participation p
      LEFT JOIN students s ON s.id = p."studentId"
      ${whereSql}
      ORDER BY p.year DESC, p.quarter DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // paramsForIdQuery = [ country?, year?, limit, offset ]
    const paramsForIdQuery = params.concat([limit, skip]);

    const idRows: Array<{ id: string | number }> = await this.participationRepository.query(
      idSql,
      paramsForIdQuery,
    );

    const ids = idRows.map(r => r.id);

    // ----------------------------
    // 2) get total count with same filters (no limit/offset)
    // ----------------------------
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM participation p
      LEFT JOIN students s ON s.id = p."studentId"
      ${whereSql}
    `;

    // paramsForCountQuery is just the original params (no limit/offset)
    const countRows: Array<{ count: number }> = await this.participationRepository.query(
      countSql,
      params,
    );
    const total = countRows[0]?.count ?? 0;

    // if no ids found, return empty early
    if (ids.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      };
    }

    // ----------------------------
    // 3) fetch final data for these ids (joins)
    // ----------------------------
    // Use Postgres ANY($1) to pass array of ids as single param
    const dataSql = `
      SELECT
        s.id AS id,
        s."firstName" AS "firstName",
        s."lastName" AS "lastName",
        s.dob AS dob,
        s.country AS country,
        pr.program AS program,
        p.quarter AS quarter,
        p.year AS year
      FROM participation p
      LEFT JOIN students s ON s.id = p."studentId"
      LEFT JOIN programs pr ON pr.id = p."programId"
      WHERE p.id = ANY($1)
      ORDER BY p.year DESC, p.quarter DESC
    `;

    const data: any[] = await this.participationRepository.query(dataSql, [ids]);

    // ----------------------------
    // 4) return results
    // ----------------------------
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
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

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository, Brackets } from 'typeorm';
import { GradesService } from 'src/grades/grades.service';
import { Participation } from 'src/participation/entities/participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { PaginationDto } from './dto/pagination.dto';
import { ParticipationService } from 'src/participation/participation.service';
import { AcademicProgress } from 'src/grades/entities/grade.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    private gradesService: GradesService,
    @InjectRepository(Program) private programsService: Repository<Program>,
    @InjectRepository(AcademicProgress) private progressRepo: Repository<AcademicProgress>,
    private participationService: ParticipationService,
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    const {
      grades,
      year,
      program,
      quarter,
      firstName,
      lastName,
      term,
      ...rest
    } = createStudentDto;

    // 1. Program must exist (hard stop)
    const currentProgram = await this.programsService.findOne({
      where: { program },
    });

    if (!currentProgram) {
      throw new NotFoundException(`Program with name ${program} not found`);
    }

    // 2. Find or create student (hard stop)
    const studentWhere =
      program !== 'CBC'
        ? {
          firstName,
          lastName,
          dob: rest.dob,
          school: rest.school,
        }
        : {
          firstName,
          lastName,
          dob: rest.dob,
        };

    let student = await this.studentsRepository.findOne({ where: studentWhere });

    if (!student) {
      const newStudent = this.studentsRepository.create({
        ...rest,
        firstName,
        lastName,
        yearJoined: year,
      });

      student = await this.studentsRepository.save(newStudent);
    } else if (student.yearJoined > year) {
      await this.studentsRepository.update(student.id, { yearJoined: year });
      student.yearJoined = year;
    }

    // 3. Prepare soft tasks (grade + participation)
    const tasks: Promise<any>[] = [];

    // Grade task (soft)
    if (grades && program === 'ASCG') {
      tasks.push(
        (async () => {
          const academicYear = Number(createStudentDto.academicYear);

          if (!Number.isInteger(academicYear)) {
            throw new Error(`Invalid academicYear: ${createStudentDto.academicYear}`);
          }

          const currentGrade = await this.gradesService.findGrade(
            student,
            academicYear,
            term,
          );

          if (!currentGrade) {
            await this.gradesService.create({
              ...grades,
              year: academicYear,
              term,
              studentId: student.id,
              class: createStudentDto.currentClass
            });
          } else {
            await this.gradesService.update(currentGrade.id, {
              ...grades,
              term,
            });
          }
        })(),
      );
    }

    // Participation task (soft)
    tasks.push(
      (async () => {
        const existingParticipation =
          await this.participationRepository.findOne({
            where: {
              student: { id: student.id },
              program: { id: currentProgram.id },
              year,
              quarter,
            },
          });

        if (!existingParticipation) {
          await this.participationService.create({
            studentId: student.id,
            programId: currentProgram.id,
            quarter,
            year,
            tag: createStudentDto.tag,
          });
        }
      })(),
    );

    // 4. Execute soft tasks in parallel
    const results = await Promise.allSettled(tasks);

    // 5. Log failures without breaking flow
    results.forEach((result) => {
      if (result.status === 'rejected') {
        Logger.warn(result.reason?.message || result.reason);
      }
    });

    return student;
  }

  async createMany(createStudentDtos: CreateStudentDto[]) {
    const results: {
      index: number;
      student?: Student;
      success: boolean;
      warnings?: string[];
      error?: string;
    }[] = [];

    for (let i = 0; i < createStudentDtos.length; i++) {
      const dto = createStudentDtos[i];

      try {
        const result = await this.create(dto);

        // support both return styles:
        // - student
        // - { student, warnings }
        if ('student' in result) {
          results.push({
            index: i + 1, // CSV row number (1-based)
            student: result,
            success: true,
          });
        } else {
          results.push({
            index: i + 1,
            student: result,
            success: true,
          });
        }
      } catch (error) {
        results.push({
          index: i + 1,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: createStudentDtos.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      results,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip: number = (page - 1) * limit;

    const [students, total] = await this.studentsRepository
      .createQueryBuilder('student')
      .select([
        'student.id',
        'student.firstName',
        'student.lastName',
        'student.dob',
        'student.school',
        'student.country',
        'student.yearJoined',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('student.firstName', 'ASC')
      .getManyAndCount();

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextPage:
          Math.ceil(total / limit) > page
            ? Number(page) + 1
            : Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const grades = await this.gradesService.findOne(id);

    const progress = await this.progressRepo.find({ where: { studentId: student.id } })

    const participations = await this.participationRepository
      .createQueryBuilder('participation')
      .leftJoinAndSelect('participation.program', 'program')
      .select([
        'participation.id',
        'participation.year',
        'participation.quarter',
        'program.program',
      ])
      .where('participation.studentId = :studentId', { studentId: id })
      .orderBy('participation.year', 'DESC')
      .getRawMany();

    return { ...student, grades, participations, progress };
  }

  async findByNames(name: string) {
    const nameParts = name.trim().split(/\s+/);
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');
    if (nameParts.length === 1) {
      // Single name search
      queryBuilder
        .where('LOWER(student.firstName) LIKE LOWER(:name)', {
          name: `%${nameParts[0]}%`,
        })
        .orWhere('LOWER(student.lastName) LIKE LOWER(:name)', {
          name: `%${nameParts[0]}%`,
        });
    } else {
      // Full name search (first + last name)
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where(
            'LOWER(student.firstName) LIKE LOWER(:firstName) AND LOWER(student.lastName) LIKE LOWER(:lastName)',
            {
              firstName: `%${nameParts[0]}%`,
              lastName: `%${nameParts[1]}%`,
            },
          ).orWhere(
            'LOWER(student.firstName) LIKE LOWER(:lastName) AND LOWER(student.lastName) LIKE LOWER(:firstName)',
            {
              firstName: `%${nameParts[0]}%`,
              lastName: `%${nameParts[1]}%`,
            },
          );
        }),
      );
    }

    const [students, total] = await queryBuilder
      .select([
        'student.id',
        'student.firstName',
        'student.lastName',
        'student.dob',
        'student.school',
        'student.country',
        'student.yearJoined',
      ])
      .orderBy('student.firstName', 'ASC')
      .getManyAndCount();


    return {
      count: total,
      students,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    Logger.log(updateStudentDto)
    try {
      await this.studentsRepository.update(id, updateStudentDto);
      return this.studentsRepository.findOne({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while updating this student record',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.studentsRepository.delete(id);
      return { deleted: true };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while deleting this student record',
      );
    }
  }

  async removeAll(): Promise<void> {
    try {
      await this.studentsRepository.query(
        'TRUNCATE TABLE students RESTART IDENTITY CASCADE',
      );
      console.log('Students table truncated successfully');
    } catch (error) {
      console.error('Error truncating students table:', error);
      throw new InternalServerErrorException(
        'An error occurred while truncating the students table.',
      );
    }
  }
}

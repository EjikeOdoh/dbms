import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    private gradesService: GradesService,
    @InjectRepository(Program) private programsService: Repository<Program>,
    private participationService: ParticipationService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const { grades, year, program, quarter, ...rest } = createStudentDto;

    // Validate program exists
    const currentProgram = await this.programsService.findOne({
      where: { program },
    });
    if (!currentProgram) {
      throw new NotFoundException(`Program with name ${program} not found`);
    }

    // Check if student already exists
    const existingStudent = await this.studentsRepository.findOne({
      where: {
        firstName: rest.firstName,
        lastName: rest.lastName,
        dob: rest.dob,
        school: rest.school,
      },
    });

    try {
      let student = existingStudent;

      // If student doesn't exist, create new student
      if (!student) {
        const newStudent = this.studentsRepository.create({
          ...rest,
          yearJoined: year,
        });
        student = await this.studentsRepository.save(newStudent);
      } else {
        // Update yearJoined if provided year is more recent
        if (student.yearJoined < year) {
          await this.update(student.id, { year: year });
          student.yearJoined = year;
        }
      }

      // Check for existing participation
      const existingParticipation = await this.participationRepository.findOne({
        where: {
          student: { id: student.id },
          program: { id: currentProgram.id },
          year,
          quarter,
        },
      });

      // Create participation if it doesn't exist
      if (!existingParticipation) {
        await this.participationService.create({
          studentId: student.id,
          programId: currentProgram.id,
          quarter,
          year,
          tag: createStudentDto.tag,
        });
      }

      // Create grades if provided
      if (grades) {
        await this.gradesService.create({
          ...grades,
          year,
          studentId: student.id,
        });
      }

      return student;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Student with provided details already exists`,
        );
      }
      console.error(error);
      throw new InternalServerErrorException(
        `An unexpected error occurred while processing student: ${rest.firstName} ${rest.lastName}`,
      );
    }
  }

  async createMany(createStudentDtos: CreateStudentDto[]): Promise<Student[]> {
    const results: Student[] = [];
    const errors: any[] = [];

    await Promise.all(
      createStudentDtos.map(async (studentDto) => {
        try {
          const student = await this.create(studentDto);
          results.push(student);
        } catch (error) {
          errors.push({
            error: error.message,
          });
        }
      }),
    );

    if (errors.length > 0) {
      console.error('Some students could not be created:', errors);
    }
    return results;
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

    return { ...student, grades, participations };
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

import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository, Brackets } from 'typeorm';
import { GradesService } from 'src/grades/grades.service';
import { Participation } from 'src/participation/entities/participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(Participation) private participationRepository: Repository<Participation>,
    private gradesService: GradesService,
    @InjectRepository(Program) private programsService: Repository<Program>
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    const { grades, year, program, quarter, ...rest } = createStudentDto;

    const currentProgram = await this.programsService.findOne({ where: { program } });
    if (!currentProgram) {
      throw new NotFoundException(`Program with name ${program} not found`);
    }
    const student = this.studentsRepository.create({ ...rest });

    try {
      const newStudent = await this.studentsRepository.save(student);
      if (grades) {
        await this.gradesService.create({ ...grades, year, studentId: newStudent.id });
      }
      const participation = this.participationRepository.create({
        student: newStudent,
        program: currentProgram,
        year,
        quarter,
      });
      await this.participationRepository.save(participation);

      return newStudent;
    } catch (error) {
      if (error.code === '23505') {
        const existingStudent = await this.studentsRepository.findOne({
          where: { firstName: rest.firstName, lastName: rest.lastName, dob: rest.dob, school: rest.school },
        });

        if (existingStudent) {
          const existingParticipation = await this.participationRepository.findOne({
            where: { student: existingStudent, program: currentProgram, year },
          });

          if (!existingParticipation) {
            const newParticipation = this.participationRepository.create({
              student: existingStudent,
              program: currentProgram,
              year,
              quarter,
            });
            await this.participationRepository.save(newParticipation);

            if (grades) {
              await this.gradesService.create({ ...grades, year, studentId: existingStudent.id });
            }
            return existingStudent;
          } else {
            throw new ConflictException('A participation with the same program and year already exists.');
          }
        }
      }
      console.log(error)
      throw new InternalServerErrorException(`An unexpected error occurred while creating the student. ${createStudentDto.firstName} ${createStudentDto.lastName}`);
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
            error: error.message
          });
        }
      })
    );

    if (errors.length > 0) {
      console.error('Some students could not be created:', errors);
    }
    return results;
  }

  async findAll(paginationDto: PaginationDto) {

    const { page = 1, limit = 20 } = paginationDto;
    const skip: number = (page - 1) * limit;

    const [students, total] = await this.studentsRepository.createQueryBuilder('student').select([
      'student.id',
      'student.firstName',
      'student.lastName',
      'student.dob',
      'student.country'
    ])
      .skip(skip)
      .take(limit)
      .orderBy('student.firstName', 'ASC')
      .getManyAndCount()

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextPage: Math.ceil(total / limit) > page ? Number(page) + 1 :  Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    }
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
        'participation.year',
        'participation.quarter',
        'program.program',
      ])
      .where('participation.studentId = :studentId', { studentId: id })
      .getRawMany();

    return { ...student, grades, participations };
  }

  async findByNames(name: string) {
    const nameParts = name.trim().split(/\s+/);
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');
    if (nameParts.length === 1) {
      // Single name search
      queryBuilder
        .where('LOWER(student.firstName) LIKE LOWER(:name)', { name: `%${nameParts[0]}%` })
        .orWhere('LOWER(student.lastName) LIKE LOWER(:name)', { name: `%${nameParts[0]}%` });
    } else {
      // Full name search (first + last name)
      queryBuilder
        .where(new Brackets(qb => {
          qb.where('LOWER(student.firstName) LIKE LOWER(:firstName) AND LOWER(student.lastName) LIKE LOWER(:lastName)', {
            firstName: `%${nameParts[0]}%`,
            lastName: `%${nameParts[1]}%`
          })
            .orWhere('LOWER(student.firstName) LIKE LOWER(:lastName) AND LOWER(student.lastName) LIKE LOWER(:firstName)', {
              firstName: `%${nameParts[0]}%`,
              lastName: `%${nameParts[1]}%`
            });
        }));
    }

    const [students, total] = await queryBuilder.getManyAndCount();

    return {
      count: total,
      students,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.studentsRepository.update(id, updateStudentDto);
    return this.studentsRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.studentsRepository.delete(id);
    return { deleted: true };
  }

  async removeAll(): Promise<void> {
    try {
      await this.studentsRepository.query('TRUNCATE TABLE students RESTART IDENTITY CASCADE');
      console.log('Students table truncated successfully');
    } catch (error) {
      console.error('Error truncating students table:', error);
      throw new InternalServerErrorException('An error occurred while truncating the students table.');
    }
  }
}

import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { GradesService } from 'src/grades/grades.service';
import { Participation } from 'src/participation/entities/participation.entity';
import { Program } from 'src/programs/entities/program.entity';

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

            if(grades) {
              await this.gradesService.create({ ...grades, year, studentId: existingStudent.id });
            }
            return existingStudent;
          } else {
            throw new ConflictException('A participation with the same program and year already exists.');
          }
        }
      }
      throw new InternalServerErrorException('An unexpected error occurred while creating the student.');
    }
  }

  async createMany(createStudentDtos: CreateStudentDto[]): Promise<Student[]> {
    const results: Student[] = [];
    const errors: any[] = [];
  
    // Use Promise.all with map instead of forEach
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

  async findAll() {
    const count = await this.studentsRepository.count()
    console.log(count)
    return this.studentsRepository.find()
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

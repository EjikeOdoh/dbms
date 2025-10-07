import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade) private gradesRepository: Repository<Grade>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
  ) {}
  async create(createGradeDto: CreateGradeDto) {
    const { studentId, ...rest } = createGradeDto;
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    const grade = this.gradesRepository.create({
      ...rest,
      student,
    });

    try {
      return await this.gradesRepository.save(grade);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new ConflictException(
          'A grade for this student and year already exists.',
        );
      }
      console.log('Grade Error:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the grade.',
      );
    }
  }

  async findAll() {
    return this.gradesRepository
      .createQueryBuilder('grade')
      .select('student.id', 'studentId')
      .addSelect('student.firstName', 'firstName')
      .addSelect('student.lastName', 'lastName')
      .addSelect('student.school', 'school')
      .addSelect('JSON_AGG(grade)', 'grades')
      .leftJoin('grade.student', 'student')
      .groupBy('student.id')
      .addGroupBy('student.firstName')
      .addGroupBy('student.lastName')
      .addGroupBy('student.school')
      .getRawMany();
  }

  async findOne(id: number) {
    return this.gradesRepository
      .createQueryBuilder('grade')
      .leftJoin('grade.student', 'student')
      .where(`student.id=${id}`)
      .orderBy('grade.year', 'DESC')
      .getMany();
  }

  async findGrade(student: Student, year: number) {
    return this.gradesRepository.findOne({
      where: {
        student: student,
        year: year
      }
    })
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    await this.gradesRepository.update(id, updateGradeDto);
    return this.gradesRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.gradesRepository.delete(id);
    return { deleted: true };
  }
}

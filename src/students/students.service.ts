import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { GradesService } from 'src/grades/grades.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    private gradesService: GradesService
  ){}
  async create(createStudentDto: CreateStudentDto) {
    const student = this.studentsRepository.create(createStudentDto);
    try {
      return await this.studentsRepository.save(student); 
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('A student with the same unique details already exists.');
      }
      throw new InternalServerErrorException('An unexpected error occurred while creating the student.');
    }
  }

  async findAll() {
    const count =  await this.studentsRepository.count()
    console.log(count)
    return this.studentsRepository.find()
  }


  async findOne(id: number) {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    const grades = await this.gradesService.findOne(id)

    return {...student, grades};
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.studentsRepository.update(id, updateStudentDto); 
    return this.studentsRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.studentsRepository.delete(id); 
    return { deleted: true };
  }
}

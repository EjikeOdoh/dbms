import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grade, GradeAverage, AcademicProgress } from './entities/grade.entity';
import { DataSource, Repository } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Term } from 'src/enums/term.enum';
import { calculateTermAverage } from 'src/utils/academicProgress';
import { ProgressFilterDto } from 'src/participation/dto/filter.dto';

@Injectable()
export class GradesService {

  constructor(
    @InjectRepository(Grade) private gradesRepository: Repository<Grade>,
    @InjectRepository(Student) private studentsRepository: Repository<Student>,
    @InjectRepository(AcademicProgress) private progressRepository: Repository<AcademicProgress>,
    private dataSource: DataSource
  ) { }

  async create(createGradeDto: CreateGradeDto) {
    const { studentId, ...rest } = createGradeDto;
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const gradeRepo = manager.getRepository(Grade);
        const averageRepo = manager.getRepository(GradeAverage);
        const progressRepo = manager.getRepository(AcademicProgress);

        const grade = gradeRepo.create({ ...rest, student });
        const saved = await gradeRepo.save(grade);

        // Calculate average
        const avg = calculateTermAverage(saved)
        await averageRepo.save({
          studentId,
          grade: saved,
          gradeId: saved.id,
          year: saved.year,
          term: saved.term,
          average: avg,
        });

        // Recompute academic progress
        await this.recomputeAcademicProgress(studentId, saved.year, averageRepo, progressRepo);

        return saved;
      });
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('A grade for this student and year already exists.');
      }
      console.log('Grade creation error:', error);
      throw new InternalServerErrorException('Error creating grade.');
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

  async findGrade(student: Student, year: number, term: Term) {
    return this.gradesRepository.findOne({
      where: {
        student: student,
        year: year,
        term: term
      },
    });
  }

  async getProgress(filter: ProgressFilterDto) {

    const page = Number(filter?.page ?? 1);
    const limit = Number(filter?.limit ?? 10);
    const skip = (page - 1) * limit;

    const query = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('students', 'student', 'student.id = progress.studentId')
      .where('progress.year = :year', { year: filter.year })
      .select([
        'progress.studentId AS "studentId"',
        'progress.year AS year',
        'progress.numberOfTerms AS "numberOfTerms"',
        'progress.firstTermAvg AS "firstTermAvg"',
        'progress.secondTermAvg AS "secondTermAvg"',
        'progress.thirdTermAvg AS "thirdTermAvg"',
        'progress.madeProgress AS "madeProgress"',
        'student.firstName AS "firstName"',
        'student.lastName AS "lastName"',
        'student.school AS "school"',
      ])
      .orderBy('progress.studentId', 'ASC')
      .skip(skip)
      .take(limit)


    const [data, total] = await Promise.all([
      query.getRawMany(),
      query.getCount(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
        nextPage: page * limit < total ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async update(id: number, dto: UpdateGradeDto) {
    return await this.dataSource.transaction(async (manager) => {
      const gradeRepo = manager.getRepository(Grade);
      const averageRepo = manager.getRepository(GradeAverage);
      const progressRepo = manager.getRepository(AcademicProgress);

      const grade = await gradeRepo.findOne({ where: { id }, relations: ['student'] });
      if (!grade) throw new NotFoundException('Grade not found');

      Object.assign(grade, dto);
      const updated = await gradeRepo.save(grade);

      // Update average
      const avg = calculateTermAverage(updated);
      const existingAvg = await averageRepo.findOne({ where: { gradeId: updated.id } });
      if (existingAvg) {
        existingAvg.average = avg;
        await averageRepo.save(existingAvg);
      } else {
        await averageRepo.save({
          studentId: updated.student.id,
          grade: updated,
          gradeId: updated.id,
          year: updated.year,
          term: updated.term,
          average: avg,
        });
      }

      // Recompute academic progress
      await this.recomputeAcademicProgress(updated.student.id, updated.year, averageRepo, progressRepo);

      return updated;
    });
  }

  async remove(id: number) {
    return await this.dataSource.transaction(async (manager) => {
      const gradeRepo = manager.getRepository(Grade);
      const averageRepo = manager.getRepository(GradeAverage);
      const progressRepo = manager.getRepository(AcademicProgress);

      const grade = await gradeRepo.findOne({ where: { id }, relations: ['student'] });
      if (!grade) throw new NotFoundException('Grade not found');

      const { student, year } = grade;

      // Delete derived average
      await averageRepo.delete({ gradeId: id });

      // Delete grade itself
      await gradeRepo.delete({ id });

      // Recompute academic progress
      await this.recomputeAcademicProgress(student.id, year, averageRepo, progressRepo);

      return { deleted: true };
    });
  }

  private async recomputeAcademicProgress(
    studentId: number,
    year: number,
    averageRepo: Repository<GradeAverage>,
    progressRepo: Repository<AcademicProgress>,
  ) {
    const averages = await averageRepo.find({ where: { studentId, year }, order: { term: 'ASC' } });

    if (averages.length <= 1) {
      await progressRepo.delete({ studentId, year });
      return;
    }

    const first = averages.find(a => a.term === Term.First)?.average ?? null;
    const second = averages.find(a => a.term === Term.Second)?.average ?? null;
    const third = averages.find(a => a.term === Term.Third)?.average ?? null;

    const madeProgress = first !== null && averages[averages.length - 1].average >= first;

    const avg = averages.reduce((x,y)=> {
      return x+y.average
    }, 0) / averages.length;

    const currentProgress = await progressRepo.findOne({ where: { studentId, year } });
    if (currentProgress) {
      currentProgress.numberOfTerms = averages.length;
      currentProgress.firstTermAvg = first;
      currentProgress.secondTermAvg = second;
      currentProgress.thirdTermAvg = third;
      currentProgress.madeProgress = madeProgress;
      await progressRepo.save(currentProgress);
    } else {

      await progressRepo.save({
        studentId,
        year,
        numberOfTerms: averages.length,
        firstTermAvg: first,
        secondTermAvg: second,
        thirdTermAvg: third,
        avg,
        madeProgress,
      });
    }
  }
}

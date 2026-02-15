import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Term } from 'src/enums/term.enum';

@Entity('grades')
@Unique(['student', 'year', 'term'])
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  student: Student;

  @Column({ type: 'varchar', length: 1, nullable: true })
  english: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  math: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  chemistry: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  physics: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  government: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  economics: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  biology: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  commerce: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  literature: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  accounting: string;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'enum', enum: Term, nullable: true })
  term: Term;
}


@Entity('grade_averages')
@Unique(['studentId','gradeId', 'year', 'term'])
export class GradeAverage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  studentId: number;

  @ManyToOne(() => Grade, { onDelete: 'CASCADE' })
  grade: Grade;

  @Column({ type: 'int' })
  gradeId: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: Term })
  term: Term;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  average: number;
}


@Entity('academic_progress')
@Unique(['studentId', 'year'])
export class AcademicProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  studentId: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  numberOfTerms: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  firstTermAvg: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  secondTermAvg: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  thirdTermAvg: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avg: number

  @Column({ type: 'boolean', default: false })
  madeProgress: boolean;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('grades')
@Unique(['student', 'year'])
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
}

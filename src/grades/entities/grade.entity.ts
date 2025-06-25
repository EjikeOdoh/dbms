import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.id, { nullable: false })
  student: Student;

  @Column({ type: 'varchar', length: 1, nullable: false })
  english: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  math: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  chemistry: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  physics: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  government: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  economics: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  biology: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  commerce: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  literature: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  accounting: string;

  @Column({ type: 'int', nullable: false })
  year: number;
}
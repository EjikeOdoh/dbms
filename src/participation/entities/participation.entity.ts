import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('participation')
export class Participation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.id, { nullable: false, onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Program, (program) => program.id, { nullable: false, onDelete: 'CASCADE' })
  program: Program;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'int', nullable: false })
  quarter: number;
}
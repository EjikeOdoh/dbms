import { ApiProperty } from '@nestjs/swagger';
import { Program } from 'src/programs/entities/program.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('volunteer_participation')
@Unique(['volunteer', 'program', 'year', 'quarter'])
export class VolunteerParticipation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.id, {
    onDelete: 'CASCADE',
  })
  volunteer: Volunteer;

  @ManyToOne(() => Program, (program) => program.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  program: Program;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'int', nullable: false })
  quarter: number;
}



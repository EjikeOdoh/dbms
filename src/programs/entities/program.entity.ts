import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum ProgramType {
  ASCG = 'ASCG',
  CBC = 'CBC',
  SSC = 'SSC',
  DSC = 'DSC',
}

@Entity('programs')
@Unique(['program'])
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ProgramType,
    nullable: false,
  })
  program: ProgramType;
}
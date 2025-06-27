import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('students')
@Unique(['school', 'firstName', 'lastName', 'dob'])
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false }) 
  school: string;

  @Column({length:5, nullable: true})
  class: string;

  @Column({ length: 20, nullable: false }) 
  firstName: string;

  @Column({ length: 20, nullable: false }) 
  lastName: string;

  @Column({ nullable: false }) 
  dob: Date;

  @Column({length: 100})
  address: string;

  @Column({ length: 13, nullable: true }) 
  phone: string;

  @Column({ length: 30, nullable: true }) 
  email: string;

  @Column({ length: 20, nullable: true }) 
  fatherLastName: string;

  // Come back later
  @Column({length:20, nullable: true})
  country: string;

  @Column({ length: 20, nullable: true }) 
  fatherFirstName: string;

  @Column({ length: 13, nullable: true }) 
  fatherPhone: string;

  @Column({ length: 20, nullable: true }) 
  fatherEducation: string;

  @Column({ length: 20, nullable: true }) 
  fatherJob: string;

  @Column({ length: 20, nullable: true }) 
  motherLastName: string;

  @Column({ length: 20, nullable: true }) 
  motherFirstName: string;

  @Column({ length: 13, nullable: true }) 
  motherPhone: string;

  @Column({ length: 20, nullable: true }) 
  motherEducation: string;

  @Column({ length: 20, nullable: true }) 
  motherJob: string;

  @Column({ nullable: true }) 
  noOfSisters: number;

  @Column({ nullable: true }) 
  noOfBrothers: number;

  @Column({ length: 20, nullable: true }) 
  position: string;

  @Column({ length: 20, nullable: true }) 
  focus: string;

  @Column({ length: 20, nullable: true }) 
  favSubject: string;

  @Column({ length: 20, nullable: true }) 
  difficultSubject: string;

  @Column({ length: 20, nullable: true }) 
  careerChoice1: string;

  @Column({ length: 20, nullable: true }) 
  careerChoice2: string;
}
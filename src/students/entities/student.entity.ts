import { Entity, PrimaryGeneratedColumn, Column, Unique, Index, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity('students')
@Unique(['school', 'combo', 'dob'])
@Index('idx_student_fullname', ['firstName', 'lastName'])
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  currentClass: string;

  //remember to change later
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  dob: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  fatherLastName: string;

  // Come back later
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  fatherFirstName: string;

  @Column({ nullable: true })
  fatherPhone: string;

  @Column({ nullable: true })
  fatherEducation: string;

  @Column({ nullable: true })
  fatherJob: string;

  @Column({ nullable: true })
  motherLastName: string;

  @Column({ nullable: true })
  motherFirstName: string;

  @Column({ nullable: true })
  motherPhone: string;

  @Column({ nullable: true })
  motherEducation: string;

  @Column({ nullable: true })
  motherJob: string;

  @Column({ nullable: true })
  noOfSisters: number;

  @Column({ nullable: true })
  noOfBrothers: number;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  focus: string;

  @Column({ nullable: true })
  favSubject: string;

  @Column({ nullable: true })
  difficultSubject: string;

  @Column({ nullable: true })
  careerChoice1: string;

  @Column({ nullable: true })
  careerChoice2: string;

  @Column({ nullable: false })
  yearJoined: number;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true, unique: false })
  combo: string;

  // Automatically compute combo before save/update
  @BeforeInsert()
  @BeforeUpdate()
  setCombo() {
    if (this.firstName && this.lastName) {
      const [a, b] = [this.firstName.trim().toLowerCase(), this.lastName.trim().toLowerCase()].sort();
      this.combo = `${a}_${b}`;
    }
  }
}

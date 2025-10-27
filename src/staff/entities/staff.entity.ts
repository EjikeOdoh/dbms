import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('staff')
@Unique(['staffId'])
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  staffId: string;

  @Column({ length: 50, nullable: false })
  firstName: string;

  @Column({ length: 50, nullable: false })
  lastName: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true})
  phone: string;

  @Column({ nullable: true})
  email: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  role: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  skillSet: string;

  @Column({ nullable: true })
  cpName1: string;

  @Column({ nullable: true })
  cpRel1: string;

  @Column({ nullable: true })
  cpPhone1: string;

  @Column({ nullable: true })
  cpName2: string;

  @Column({ nullable: true })
  cpRel2: string;

  @Column({ nullable: true })
  cpPhone2: string;
}

import { Partner } from 'src/partners/entities/partner.entity';
import { Program } from 'src/programs/entities/program.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('sponsorship')
@Unique(['partner', 'program', 'year'])
export class Sponsorship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Partner, (partner) => partner.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  partner: Partner;

  @ManyToOne(() => Program, (program) => program.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  program: Program;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ nullable: true })
  amount: number;
}

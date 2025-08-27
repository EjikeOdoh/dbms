import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('partners')
@Unique(['name'])
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  desc: string;

  @Column({
    nullable: true,
  })
  logoUrl: string;

  @Column({ nullable: true })
  logoPublicId: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  linkedIn: string;

  @Column({ nullable: true })
  year: number;

  @Column({ default: true })
  isActive: boolean;
}

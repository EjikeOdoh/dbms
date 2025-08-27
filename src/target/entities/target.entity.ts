import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('target')
@Unique(['year'])
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  target: number;

  @Column({ nullable: false })
  year: number;
}

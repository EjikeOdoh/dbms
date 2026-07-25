import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
@Index(['user', 'endedAt'])
export class UserSession {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 64, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ length: 64, nullable: true })
  deviceFingerprint?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt?: Date;

  @Column({ nullable: true })
  endReason?: string;
}

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Unique } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity'
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { Role } from 'src/enums/role.enum';

@Entity('users')
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    // TOTP secrets are encrypted before persistence. A user is only challenged
    // during login after they have verified their enrollment code.
    @Column({ nullable: true, select: false })
    mfaSecret?: string;

    @Column({ nullable: true, select: false })
    mfaPendingSecret?: string;

    @Column({ default: false })
    mfaEnabled: boolean;

    @Column({ default: 0, select: false })
    failedLoginAttempts: number;

    @Column({ nullable: true, type: 'timestamptz', select: false })
    failedLoginWindowStartedAt?: Date;

    @Column({ nullable: true, type: 'timestamptz', select: false })
    lockoutUntil?: Date;

    @Column({ nullable: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Viewer,
    })
    role: Role;

    @OneToOne(() => Staff, { nullable: true })
    @JoinColumn()
    staff?: Staff;

    @OneToOne(() => Volunteer, { nullable: true })
    @JoinColumn()
    volunteer?: Volunteer;
}

import { Role } from "src/enums/role.enum";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('users')
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    email: string

    @Column({ nullable: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Viewer
    })
    role: Role;

    @Column({ nullable: false })
    password: string
}

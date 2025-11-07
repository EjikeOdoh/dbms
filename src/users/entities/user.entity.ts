import { Role } from "src/enums/role.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    email: string

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.Viewer
    })
    role: Role;

    @Column({ nullable: false })
    password: string
}

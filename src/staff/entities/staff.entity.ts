import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm"

@Entity('staff')
@Unique(['staffId'])
export class Staff {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    staffId: string

    @Column({ length: 50, nullable: false })
    firstName: string

    @Column({ length: 50, nullable: false })
    lastName: string

    @Column({ nullable: true })
    dob: Date

    @Column({ nullable: true })
    address: string

    @Column({ nullable: false })
    yearJoined: number

    @Column({ nullable: true })
    role: string

    @Column({ default: true })
    isActive: boolean

}

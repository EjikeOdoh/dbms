import { ProgramType } from "src/programs/entities/program.entity"
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm"

export enum VolunteerType {
        REGULAR = 'REGULAR',
        PROGRAM = 'PROGRAM'
}

@Entity('volunteers')
@Unique(['firstName', 'lastName', 'phone'])
export class Volunteer {
        @PrimaryGeneratedColumn()
        id: number

        @Column({ length: 50, nullable: false })
        firstName: string

        @Column({ length: 50, nullable: false })
        lastName: string

        @Column({
                type: 'enum',
                enum: VolunteerType,
                nullable: false,
        })
        type: VolunteerType

        @Column({ default: false, nullable: true })
        active: boolean

        @Column({ nullable: true })
        startDate: Date

        @Column({ nullable: true })
        endDate: Date

        @Column({ nullable: true })
        address: string

        @Column({ nullable: true })
        location: string

        @Column({ nullable: true })
        email: string

        @Column({ nullable: true })
        phone: string

        @Column({ nullable: true })
        skillSet: string

        @Column({ nullable: true })
        cpName1: string

        @Column({ nullable: true })
        cpRel1: string

        @Column({ nullable: true })
        cpPhone1: string

        @Column({ nullable: true })
        cpName2: string

        @Column({ nullable: true })
        cpRel2: string

        @Column({ nullable: true })
        cpPhone2: string

}

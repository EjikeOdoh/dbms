import { File } from "buffer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('partners')
export class Partner {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: string

    @Column({
        type: 'text',
        nullable: true
    })
    desc: string

    @Column({
        nullable: true
    })
    logoUrl: string

    @Column({ nullable: true })
    logoPublicId: string;

    @Column({ nullable: true })
    twitter: string

    @Column({ nullable: true })
    linkedIn: string
}

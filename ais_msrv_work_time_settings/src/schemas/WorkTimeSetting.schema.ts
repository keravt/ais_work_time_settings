import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WorkTimeGroup } from "./WorkTimeGroup.schema";
import { WorkTimeSchema } from "./WorkTime.schema";

@Entity()
export class WorkTimeSetting {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    title: string

    @OneToMany(() => WorkTimeSchema, (workTime) => workTime.workTimeSetting, {eager: true, cascade:true, onDelete:"CASCADE"})
    workTimes: WorkTimeSchema[]

    @Column("text", {array: true, default: []})
    userIds: string[]

    @ManyToMany(() => WorkTimeGroup,  (workTimeGroup)=>workTimeGroup.workTimeSettings, {onDelete: 'CASCADE'} )
    workTimeGroups: WorkTimeGroup[]




    @Column({default: false})
    isGeneral: boolean
}
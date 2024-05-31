import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;


    @Column({default: false})
    isGeneral: boolean
}
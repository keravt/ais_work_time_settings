import { Column, CreateDateColumn, Entity,  JoinTable,  ManyToMany,  PrimaryGeneratedColumn } from "typeorm";
import { WorkTimeSetting } from "./WorkTimeSetting.schema";



@Entity()
export class WorkTimeGroup {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    title: string


    @ManyToMany(() => WorkTimeSetting, (workTimeSetting)=>workTimeSetting.workTimeGroups, {onDelete: 'CASCADE'})
    @JoinTable()
    workTimeSettings: WorkTimeSetting[]



    @Column("text", {array: true, default: []})
    userIds: string[]

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;


    @Column({type:'json', default:[]})
    settingPositions: {uid:string, position:number}[]

}
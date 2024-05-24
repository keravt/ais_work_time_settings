

import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { WorkTimeSetting } from "./WorkTimeSetting.schema";
import { WorkTimeDayCloneSchema } from "./WorkTimeDayClone.schema";
import { WorkTimeDaysCloneSchema } from "./WorkTimeDaysClone.schema";
import { ColumnNumericTransformer } from "src/helpers/numericTransform";

@Entity()
export class WorkTimeSchema {
  @PrimaryGeneratedColumn("uuid")
  uid: string;

  @Column({nullable: true})
  @ApiProperty()
  userId: string;

  

  @Column({type: 'bigint', transformer: new ColumnNumericTransformer()})
  @ApiProperty()
  day: number

  @Column({type: 'bigint', transformer: new ColumnNumericTransformer(), nullable: true})
  @ApiProperty()
  endDate: number


  @Column({default: false, nullable: true})
  @ApiProperty()
  isHoliday: boolean


  @Column({default: false})
  @ApiProperty()
  never: boolean




  @Column({type:'json'})
  @ApiProperty()
  workTime:Time[]


  @Column({type:'json'})
  @ApiProperty()
  noRepeat:{noRepeat:boolean, date:number}



  @Column({default: "blue"})
  holidayColor: string

  @Column({default: ""})
  name: string

 
  @ManyToOne(() => WorkTimeSetting, workTimeSetting => workTimeSetting.workTimes,{ onDelete: 'CASCADE' })
  workTimeSetting: WorkTimeSetting

  @OneToMany(()=>WorkTimeDayCloneSchema,workTimeDayClone=>workTimeDayClone.workTimeSchema, {cascade:true, onDelete:"CASCADE"})
  workTimeDayClones:WorkTimeDayCloneSchema[]

  
  @OneToMany(()=>WorkTimeDaysCloneSchema,workTimeDaysClone=>workTimeDaysClone.workTimeSchema, {cascade:true, onDelete:"CASCADE"})
  workTimeDaysClones:WorkTimeDaysCloneSchema[]



  @Column({nullable: true})
  recurrence: string | null

  @Column({type:'json', default:[]})
  excludedDate: string[]
}



import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { WorkTimeSchema } from "./WorkTime.schema";
import { ColumnNumericTransformer } from "src/helpers/numericTransform";


@Entity()
export class WorkTimeDayCloneSchema {
  @PrimaryGeneratedColumn("uuid")
  uid: string;

  @Column({type: 'bigint', transformer: new ColumnNumericTransformer()})
  @ApiProperty()
  day: number

  @Column({default: false, nullable: true})
  @ApiProperty()
  isHoliday: boolean


  @Column({type:'json'})
  @ApiProperty()
  workTime:Time[]

  @Column({default: "Событие"})
  name: string
  

  @Column({default: "blue"})
  holidayColor: string

  @ManyToOne(()=> WorkTimeSchema,(workTimeSchema)=>workTimeSchema.workTimeDayClones,{ onDelete: 'CASCADE' })
  workTimeSchema:WorkTimeSchema
}



import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { WorkTimeSchema } from "./WorkTime.schema";
import { ColumnNumericTransformer } from "src/helpers/numericTransform";

@Entity()
export class WorkTimeDaysCloneSchema {
  @PrimaryGeneratedColumn("uuid")
  uid: string;



  @Column({type: 'bigint', transformer: new ColumnNumericTransformer()})
  @ApiProperty()
  day: number

  @Column({default: false, nullable: true})
  @ApiProperty()
  isHoliday: boolean

  @Column({default: "Событие"})
  name: string


  @Column({default: false})
  @ApiProperty()
  never: boolean



  @Column({type:'json'})
  @ApiProperty()
  workTime:Time[]

  @Column({default: "blue"})
  holidayColor: string



  @ManyToOne(()=>WorkTimeSchema,workTime=>workTime.workTimeDaysClones, { onDelete: 'CASCADE' })
  workTimeSchema:WorkTimeSchema

  @Column({nullable: true})
  recurrence: string | null


}

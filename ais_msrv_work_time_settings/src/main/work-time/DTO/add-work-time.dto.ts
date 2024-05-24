import { ApiProperty } from "@nestjs/swagger"

export class AddWorkTimeDto { 
    @ApiProperty()
    startTime: string
    @ApiProperty()
    endTime: string
    @ApiProperty()
    date: number
    @ApiProperty()
    dayTypeId: number
    @ApiProperty()
    uid: string
    @ApiProperty()
    workTime:any
    @ApiProperty()
    workTimes:[]
    @ApiProperty()
    workTimeSettingId:string
}
import { DayTypeModel } from "./DayType.model";
import { TimeSchema } from "./TimeSchema.model";
import { WorkTimeDayClone } from "./WorkTimeDayClone";
import { WorkTimeDaysClone } from "./WorkTimeDaysClone";

export interface WorkTimeModel {
    id?: number;
    uid?:string;

    userId?: string;

    day: number

    name:string

    isHoliday: boolean

    workTime: TimeSchema[]

    dayType?: DayTypeModel

    holidayColor: string

    endDate:number

    recurrence: string | null
    
    excludedDate:string

    workTimeDayClones:WorkTimeDayClone[]
    workTimeDaysClones:WorkTimeDaysClone[]

    isGeneral:boolean

    workTimeSettingId:string

    workTimes: TimeSchema[]

    never:boolean
    noRepeat:{
        noRepeat:boolean,
        date:number,
    }
    
}
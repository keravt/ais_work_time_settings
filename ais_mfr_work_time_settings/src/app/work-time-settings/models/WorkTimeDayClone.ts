import { TimeSchema } from "./TimeSchema.model"

export interface WorkTimeDayClone {
    day: string
    holidayColor:string
    isHoliday: boolean
    uid: string
    workTime:TimeSchema[]
    name:string
}
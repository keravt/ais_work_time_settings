import { TimeSchema } from "./TimeSchema.model"

export interface WorkTimeDaysClone {
    day: number
    holidayColor:string
    isHoliday: boolean
    uid: string
    workTime:TimeSchema[]
    name:string
}
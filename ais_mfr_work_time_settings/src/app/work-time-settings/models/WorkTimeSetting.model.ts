import { WorkTimeModel } from "./WorkTime.model"


export interface WorkTimeSetting {
    uid: string
    title: string
    isGeneral:boolean
    workTimes: WorkTimeModel[]
    userIds: string[]
    created_at:Date
}
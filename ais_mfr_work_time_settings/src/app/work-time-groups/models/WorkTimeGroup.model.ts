
import { WorkTimeSetting } from "./WorkTimeSetting.model"

export interface WorkTimeGroup {
    uid: string
    title: string
    workTimeSettings:WorkTimeSetting[]
    userIds: string[]
    settingPositions:{uid:string, position:number}[]

}
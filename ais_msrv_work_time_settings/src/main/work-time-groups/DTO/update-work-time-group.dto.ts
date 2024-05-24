
import { WorkTimeSetting } from "src/schemas/WorkTimeSetting.schema"
import { updateSettingPosition } from "./update-setting-position.dto"

export class updateWorkTimeGroupDto {
    uid:string
    title: string
    userIds: string[]
    workTimeSettings: WorkTimeSetting[]
    settingPositions: updateSettingPosition[]
}
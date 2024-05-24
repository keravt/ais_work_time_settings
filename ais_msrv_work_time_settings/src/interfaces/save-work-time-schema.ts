import { WorkTimeSchema } from "src/schemas/WorkTime.schema";


export interface SaveWorkTimeSchema  extends WorkTimeSchema {
   workTimeSettingId:string
}
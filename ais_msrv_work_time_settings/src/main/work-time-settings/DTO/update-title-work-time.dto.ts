import { WorkTimeSchema } from "src/schemas/WorkTime.schema";

export class UpdateTitleWorkTimeDto{
    uid:string;
    title:string;
    isGeneral:boolean
}
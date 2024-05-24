import { WorkTimeSchema } from "src/schemas/WorkTime.schema";

export class DeleteWorkTimeDto{
    currentDate:number;
    type:SaveType;
    workTime: WorkTimeSchema;
}
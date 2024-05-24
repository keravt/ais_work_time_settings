import { SaveWorkTimeSchema } from "src/interfaces/save-work-time-schema";



export class SaveWorkTimeDto{

    beforeReccurence:string;
    changeReccurence:boolean;
    currentDate:number;
    type:SaveType;
    workTime: SaveWorkTimeSchema;
    workTimeSettingUid: string;
    isHoliday:boolean;
    holidayColor:string;
    workTimes:Time[];
    workTimeName:string
    never:boolean
    noRepeat:{noRepeat:boolean, date:number}

}
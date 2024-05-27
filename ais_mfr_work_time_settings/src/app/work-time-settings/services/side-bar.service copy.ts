import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { HistoryService } from './history.service';
import { WorkTimeSettingsApi } from '../api/work-time-settings.api';
import { WorkTimeSettingStorageService } from './work-time-setting-storage.service';
import { WorkTimeModel } from '../models/WorkTime.model';
import { TimeSchema } from '../models/TimeSchema.model';
import { UpdateWorkTimeType } from '../models/UpdateWorkTimeType.model';
import { RepeatEndType } from '../enums/repeat-end-type';
import { RepeatType } from '../enums/repeat-type.enum';
import { ChosenRepeatType } from '../models/ChosenRepeatDays.model';
import { convertDateToICalFormat } from '../utils/date-utils';
import { WorkTimeApi } from '../api/work-time.api';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {

  constructor(
    private workTimeApi:WorkTimeApi,
    private historyService:HistoryService,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
  ) { }

  passageThroughWorkTimeDaysClones(currentDate:NgbDateStruct, workTime:WorkTimeModel){

    const day =   moment([
      currentDate.year,
      currentDate.month,
      currentDate.day,
    ])
      
      .startOf('day')
      .add(1,'d')
      .valueOf()
  
    const workTimeDaysClones = [...workTime.workTimeDaysClones.sort((a,b)=>a.day - b.day)]
    const nextClone = workTimeDaysClones.find(el=>el.day > day)
    let isHoliday = false
    let workTimeName:string = 'Событие'
    let holidayColor = 'white'
    let workTimes:TimeSchema[] | [] = []


    
    if (nextClone) {
      const indexofNextClone = workTimeDaysClones.indexOf(nextClone)      
      const thisClone = workTimeDaysClones[indexofNextClone - 1]     
      isHoliday = thisClone ? thisClone.isHoliday : workTimeDaysClones[0].isHoliday
      holidayColor = thisClone ? thisClone.holidayColor : workTimeDaysClones[0].holidayColor
      workTimeName = thisClone ? thisClone.name : workTimeDaysClones[0].name
      workTimes = thisClone ? thisClone.workTime.map(obj => ({ ...obj })) : workTimeDaysClones[0].workTime.map(obj => ({ ...obj }))
    }else{
      isHoliday = workTimeDaysClones[workTimeDaysClones.length - 1].isHoliday
      holidayColor = workTimeDaysClones[workTimeDaysClones.length - 1].holidayColor
      workTimeName = workTimeDaysClones[workTimeDaysClones.length - 1].name
      workTimes = workTimeDaysClones[workTimeDaysClones.length - 1].workTime.map(obj => ({ ...obj }))
    }

    return {isHoliday, holidayColor, workTimeName, workTimes}
  }


  passageThroughWorkTimeDayClone(workTime:WorkTimeModel, today:number){

    let isHoliday = false
    let workTimeName:string = 'Событие'
    let holidayColor = 'white'
    let workTimes:TimeSchema[] | [] = []

    const workTimedayClone = (workTime.workTimeDayClones.find(el=>{
      let day = moment(el.day) 
      let dayWithNoUtc = day.hour(0).utc(false).valueOf()
      return dayWithNoUtc  === new Date(today).setHours(0, 0, 0, 0)
    }))

    if(workTimedayClone){
      isHoliday = workTimedayClone.isHoliday 
      holidayColor = workTimedayClone.holidayColor 
      workTimeName = workTimedayClone.name 
      workTimes = workTimedayClone.workTime.map(obj => ({ ...obj })) 
      return {isHoliday, holidayColor, workTimeName, workTimes}
    }

    return workTimedayClone

    
  }

  async deleteWorkTime(today:number,type:UpdateWorkTimeType, workTime:WorkTimeModel, uid:string, year:string){
    const data = await firstValueFrom(this.workTimeApi.deleteWorkTime(today,type, workTime))
    this.historyService.setUndoArray(data)
    this.historyService.redoArray$.next([])
    const wts = await firstValueFrom(this.workTimeSettingsApi.getWorkTimeSettingByUid(uid, year))
    this.workTimeSettingStorageService.setWorkTimeSetting(wts)
        
   
  }

 async createWorkTime(
  beforeReccurence:string,
    changeReccurence:boolean,
    workTime:WorkTimeModel,
    currentDate:number,
    type:UpdateWorkTimeType,
    uid:string,
    year:string,
    isHoliday:boolean,
    holidayColor:string,
    workTimes:TimeSchema[],
    workTimeName:string,
    never:boolean,
    noRepeat:{noRepeat:boolean, date:number}
    ){
      const data = await firstValueFrom(this.workTimeApi
        .saveWorkTime(beforeReccurence,changeReccurence,currentDate, type, workTime, uid, isHoliday,holidayColor, workTimes, workTimeName, never,noRepeat))

      this.historyService.setUndoArray(data)
      this.historyService.redoArray$.next([])
      const wts= await firstValueFrom(this.workTimeSettingsApi.getWorkTimeSettingByUid(uid, year))
      this.workTimeSettingStorageService.setWorkTimeSetting(wts)
  }


  


 








  
  createRrule(
    currentRepeatType:RepeatType,
    interval:number,
    choosenRepeatDays:ChosenRepeatType,
    choosenRepeatEndType:RepeatEndType,
    endRepeatDate:Date,
    endRepeatCount:number,
    date:NgbDateStruct,
 
    ):string
    {
      const endRepeatDatePlusOne = 
      new Date(endRepeatDate).setDate(new Date(endRepeatDate).getDate() + 1)
    let rrule = 'RRULE:';
    let FREQ = 
    Object.keys(RepeatType)[
      Object.values(RepeatType).indexOf(currentRepeatType)
    ] 
  rrule += `FREQ=${FREQ}`;
  if (interval > 0) rrule += `;INTERVAL=${interval+1}`;
  if (choosenRepeatDays.length && FREQ === 'WEEKLY') {
    const choosenRepeatDyasNames = choosenRepeatDays.map(
      (rd) => rd.alias
    );
    rrule += `;BYDAY=${choosenRepeatDyasNames.join(',')}`;
  }

  if (FREQ === 'MONTHLY' ||  FREQ === 'YEARLY'){
    rrule +=`;BYMONTHDAY=${date.day}`
  }

  if (FREQ === 'YEARLY') {
    rrule +=`;BYMONTHDAY=${date.day};BYMONTH=${date.month}`
  }
 
  switch (choosenRepeatEndType) {
    case RepeatEndType.DATE:
      rrule += `;UNTIL=${
        convertDateToICalFormat(
        new Date(endRepeatDatePlusOne)
      )}`;
      break;
    case RepeatEndType.COUNT:
      rrule += `;COUNT=${endRepeatCount}`;
      break;
  }
  return rrule
  }
}

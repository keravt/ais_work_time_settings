import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject, repeat } from 'rxjs';
import { mainURL } from 'src/environments/environment';
import { EventType } from '../enums/event-type.enum';
import { WorkTimeModel } from '../models/WorkTime.model';
import { TimeSchema } from '../models/TimeSchema.model';
import { WorkTimeChange, WorkTimeChangeObj } from '../models/workTimeChange.model';
import { UpdateWorkTimeType } from '../models/UpdateWorkTimeType.model';

@Injectable({
  providedIn: 'root',
})
export class WorkTimeApi {
  constructor(private http: HttpClient) {
    localStorage.setItem(
      'queryParams',
      JSON.stringify({ userIds: ['1', '2', '3'] })
    );
    const queryParams = localStorage.getItem('queryParams');
    if (queryParams) {
      console.log(JSON.parse(queryParams));
    }
}

  eventsFilter = new Subject<{
    types: string;
    userIds: string;
  }>();



  public calendarsFilter = [
    { title: 'Отчёты', value: EventType.report, checked: true },
    { title: 'Мероприятия', value: EventType.meeting, checked: true },
  ];

  public changeCalendarsFilter(newItem: {
    title: string;
    value: EventType;
    checked: boolean;
  }) {
    newItem.checked = !newItem.checked;
  }

  getWorkTimeById(userId: string): Observable<WorkTimeModel> {
    return this.http.get<WorkTimeModel>(`${mainURL}/api/work-time/getUserWorkTimeById/${userId}`);
  }

 

  


  createWorkTime(
    workTimes:TimeSchema[]| [],
    userId: string,
    workTime:WorkTimeModel | null,
    date: number,
    startTime: string,
    endTime: string,
    workTimeSettingId:string
  ): Observable<WorkTimeChange[]> {
    return this.http.post<WorkTimeChange[]>(`${mainURL}/api/work-time/add-time/${userId}`, {
      workTimes,
      date,
      workTime:workTime,
      startTime,
      endTime,
      workTimeSettingId
    });
  }

  saveWorkTime(
    beforeReccurence:string,
    changeReccurence:boolean,
    currentDate:number,
    type:string,
    workTime: WorkTimeModel,
    workTimeSettingUid: string,
    isHoliday:boolean,
    holidayColor:string,
    workTimes:TimeSchema[] | [], 
    workTimeName:string,
    never:boolean,
    noRepeat:{noRepeat:boolean, date:number}
    ): Observable<WorkTimeChange[]> {
    return this.http.post<WorkTimeChange[]>(`${mainURL}/api/work-time/save`, {beforeReccurence, changeReccurence, currentDate, type, workTime, workTimeSettingUid,isHoliday, holidayColor, workTimes, workTimeName, never, noRepeat});
  }


  changeWorkTime(WorkTimeChanges:WorkTimeChangeObj[]){
    return this.http.post(`${mainURL}/api/work-time/change`,WorkTimeChanges);
  }

  deleteWorkTime(currentDate:number, type:UpdateWorkTimeType, workTime: WorkTimeModel): Observable<WorkTimeChange[]>  {
  
    
    return this.http.post<WorkTimeChange[]>(`${mainURL}/api/work-time/delete`, {currentDate, type, workTime});
  }



  getAllWorkTime(
    userId: string
  ): Observable<{ workTimes: WorkTimeModel[]; holidays: [] }> {
    return this.http.get<{ workTimes: WorkTimeModel[]; holidays: [] }>(
      `${mainURL}/api/work-time-settings/all/${userId}`
    );
  }

  getUserWorkTime(
    startDate: string,
    endDate: string,
    types: string | null,
    checkedUserIds: string | null
  ): Observable<{
    workTimes: WorkTimeModel[];
    tasks: Array<{
      created_at: string;
      title: string;
      deadline: string | null;
      description: string;
    }>;
    events: Event[];
    holidays: [];
  }> {
    let params = new HttpParams();
    params = params.append('startDate', startDate);
    params = params.append('endDate', endDate);
    params = params.append('types', types || '[]');
    params = params.append('userIds', checkedUserIds || '[]');
    return this.http.get<{
      workTimes: WorkTimeModel[];
      tasks: any;
      events: Event[];
      holidays: [];
    }>(`${mainURL}/api/work-time-settings/work-times`, { params });
  }
}

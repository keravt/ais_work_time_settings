import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { mainURL } from 'src/environments/environment';
import { WorkTimeModel } from '../models/WorkTime.model';
import { Sort } from '../models/sort.model';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';
import { GroupChange } from '../models/GroupChange.model';

@Injectable({
  providedIn: 'root'
})
export class WorkTimeSettingsApi {

  constructor(private http: HttpClient) {}

  createWorkTimeSettings(title: string, isGeneral:boolean): Observable<GroupChange[]> {
    return this.http.post<GroupChange[]>(`${mainURL}/api/work-time-settings`, {title, isGeneral})
  }

  getWorkTimeSettings(): Observable<WorkTimeSetting[]> {
    return this.http.get<WorkTimeSetting[]>(
      `${mainURL}/api/work-time-settings/all`
    );
  }

  deleteWorkTimeSetting(uid:string): Observable<GroupChange[]> {
    return this.http.delete<GroupChange[]>(`${mainURL}/api/work-time-settings/deleteWorkTimeSetting/${uid}`);
  }
  

  getWorkTimeSettingByUid(uid: string, year:string): Observable<WorkTimeSetting> {
    let params = new HttpParams();
    params = params.append('uid', uid);
    params = params.append('year', year);
    return this.http.get<WorkTimeSetting>(
      `${mainURL}/api/work-time-settings/getByUid`, {params}
    );
  }

  getWorkTimeGroupByUid(uid: string, year:string): Observable<WorkTimeSetting | null> {
    let params = new HttpParams();
    params = params.append('uid', uid);
    params = params.append('year', year);
    return this.http.get<WorkTimeSetting | null>(
      `${mainURL}/api/work-time-settings/getGroupByUid`, {params}
    );
  }


  

  updateWorkTimeSetting(workTimeSetting: Partial<WorkTimeSetting>): Observable<GroupChange[]> {
    return this.http.patch<GroupChange[]>(
      `${mainURL}/api/work-time-settings`, 
      workTimeSetting
    );
  }

  copyWorkTimeSetting(workTimeSetting: WorkTimeSetting): Observable<GroupChange[]> {

    console.log('ddddddfff', workTimeSetting);
    
    return this.http.post<GroupChange[]>(
      `${mainURL}/api/work-time-settings/copyWorkTimeSetting`, 
      workTimeSetting
    );
  }

  getUsersUidsInWorkTimeSettings(uid: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${mainURL}/api/work-time-settings/user-uids/${uid}`
    );
  }

  updateTitleWorkTime(body:{uid:string,title:string,isGeneral:boolean}): Observable<GroupChange[]> {
    return this.http.patch<GroupChange[]>(`${mainURL}/api/work-time-settings/updateSettingTitle`, body);
  }
}

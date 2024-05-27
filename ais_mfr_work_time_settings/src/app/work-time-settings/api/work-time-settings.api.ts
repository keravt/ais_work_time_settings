import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { mainURL } from 'src/environments/environment';
import { WorkTimeModel } from '../models/WorkTime.model';

@Injectable({
  providedIn: 'root'
})
export class WorkTimeSettingsApi {

  constructor(private http: HttpClient) {}

  createWorkTimeSettings(title: string, isGeneral:boolean): Observable<WorkTimeSetting> {
    return this.http.post<WorkTimeSetting>(`${mainURL}/api/work-time-settings`, {title, isGeneral})
  }

  getWorkTimeSettings(): Observable<WorkTimeSetting[]> {
    return this.http.get<WorkTimeSetting[]>(
      `${mainURL}/api/work-time-settings/all`
    );
  }

  deleteWorkTimeSetting(uid:string) {
    return this.http.delete(`${mainURL}/api/work-time-settings/deleteWorkTimeSetting/${uid}`);
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

  

  updateWorkTimeSetting(workTimeSetting: Partial<WorkTimeSetting>) {
    return this.http.patch(
      `${mainURL}/api/work-time-settings`, 
      workTimeSetting
    );
  }

  copyWorkTimeSetting(workTimeSetting: WorkTimeSetting) {

    console.log('ddddddfff');
    
    return this.http.post<WorkTimeSetting>(
      `${mainURL}/api/work-time-settings/copyWorkTimeSetting`, 
      workTimeSetting
    );
  }

  getUsersUidsInWorkTimeSettings(uid: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${mainURL}/api/work-time-settings/user-uids/${uid}`
    );
  }

  updateTitleWorkTime(body:{uid:string,title:string,isGeneral:boolean}): Observable<WorkTimeModel> {
    return this.http.patch<WorkTimeModel>(`${mainURL}/api/work-time-settings/updateSettingTitle`, body);
  }
}

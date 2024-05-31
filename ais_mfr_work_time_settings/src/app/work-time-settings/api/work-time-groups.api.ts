import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mainURL } from 'src/environments/environment';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';
import { Sort } from '../models/sort.model';

@Injectable({
  providedIn: 'root',
})
export class WorkTimeGroupsApi {
  constructor(private http: HttpClient) {}

  createWorkTimeGroup(title: string): Observable<WorkTimeGroup> {
    return this.http.post<WorkTimeGroup>(`${mainURL}/api/work-time-groups/create`, {title})
  }

  getWorkTimeGroups(): Observable<WorkTimeGroup[]> {
    return this.http.get<WorkTimeGroup[]>(`${mainURL}/api/work-time-groups/all`)
  }

  


  updateWorkTimeGroup(workTimeGroup:Partial<WorkTimeGroup>): Observable<WorkTimeGroup> {
    console.log('workTimeGroup', workTimeGroup);
    
    return this.http.patch<WorkTimeGroup>(`${mainURL}/api/work-time-groups/update`, workTimeGroup)
  }

  copyWorkTimeGroup(workTimeGroup: WorkTimeGroup){

    return this.http.post<WorkTimeGroup>(
      `${mainURL}/api/work-time-groups/copyWorkTimeGroup`, 
      workTimeGroup
    );

  }



  deleteWorkTimeGroup(uid:string){
    return this.http.delete(`${mainURL}/api/work-time-groups/delete/${uid}`)
  }
 



  getUsersUidsInWorkTimeGroups(uid: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${mainURL}/api/work-time-groups/user-uids/${uid}`
    );
  }



}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mainURL } from 'src/environments/environment';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';
import { Sort } from '../models/sort.model';
import { GroupChange, GroupChangeObj } from '../models/GroupChange.model';
import { WorkTimeChange } from '../models/workTimeChange.model';

@Injectable({
  providedIn: 'root',
})
export class WorkTimeGroupsApi {
  constructor(private http: HttpClient) {}

  createWorkTimeGroup(title: string): Observable<GroupChange[]> {
    return this.http.post<GroupChange[]>(`${mainURL}/api/work-time-groups/create`, {title})
  }

  getWorkTimeGroups(): Observable<WorkTimeGroup[]> {
    return this.http.get<WorkTimeGroup[]>(`${mainURL}/api/work-time-groups/all`)
  }

  
  getWorkTimeGroupById(id:string): Observable<WorkTimeGroup>{
    return this.http.get<WorkTimeGroup>(
      `${mainURL}/api/work-time-groups/${id}`,
    );
  }


  updateWorkTimeGroup(workTimeGroup:Partial<WorkTimeGroup>): Observable<GroupChange[]> {
    console.log('workTimeGroup', workTimeGroup);
    
    return this.http.patch<GroupChange[]>(`${mainURL}/api/work-time-groups/update`, workTimeGroup)
  }

  copyWorkTimeGroup(workTimeGroup: WorkTimeGroup): Observable<GroupChange[]> {

    return this.http.post<GroupChange[]>(
      `${mainURL}/api/work-time-groups/copyWorkTimeGroup`, 
      workTimeGroup
    );

  }



  deleteWorkTimeGroup(uid:string): Observable<GroupChange[]>{
    return this.http.delete<GroupChange[]>(`${mainURL}/api/work-time-groups/delete/${uid}`)
  }
 



  getUsersUidsInWorkTimeGroups(uid: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${mainURL}/api/work-time-groups/user-uids/${uid}`
    );
  }

  changeGroup(GroupChanges:GroupChangeObj[]): Observable<GroupChange[]>{
    return this.http.post<GroupChange[]>(`${mainURL}/api/work-time-groups/change`,GroupChanges);


  }



}

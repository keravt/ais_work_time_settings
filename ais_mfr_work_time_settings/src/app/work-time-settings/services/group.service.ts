import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';
import { Person } from '../models/Person.model';
import { Division } from '../models/Division.model';
import { WorkTimeSettingStorageService } from './work-time-setting-storage.service';
import { WorkTimeSettingsApi } from '../api/work-time-settings.api';
import { CheckedGroupStorageService } from './checked-group-storage.service';
import { HistoryGroupService } from './history-group.service';
import { WorkTimeGroupsApi } from '../api/work-time-groups.api';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeSettingStorageService: WorkTimeSettingStorageService,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private historyGroupService:     HistoryGroupService,
    private workTimeGroupsApi: WorkTimeGroupsApi,
  ) { }


  private AllGroups: BehaviorSubject<WorkTimeGroup[]> = new BehaviorSubject<WorkTimeGroup[]>([])
  public AllGroups$: Observable<WorkTimeGroup[]> = this.AllGroups.asObservable()





  sortUsers(persons:Person[], checkedUsers:Person[], sortType:any, sortCity:any, sortName:any){
    if (sortType === 'name') {
      persons.sort((a,b)=>{
        const isAsc = sortName.direction === 'asc';
        return this.compare(a.name, b.name, isAsc);
      })

      return Array.from(new Set([...checkedUsers,...persons]))
    }

    if (sortType === 'city') {
      persons.sort((a,b)=>{
        const isAsc = sortCity.direction === 'asc';
        return this.compare(a.city, b.city, isAsc);
      })

      return Array.from(new Set([...checkedUsers,...persons]))
    }

    persons.sort((a,b)=>{
      const isAsc = sortName.direction === 'asc';
      return this.compare(a.name, b.name, isAsc);
    })


      console.log('dd##', Array.from(new Set([...checkedUsers,...persons])));
      
    return Array.from(new Set([...checkedUsers,...persons]))

  }

  compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }



   _filter(value: string, filteredPersonsByDivision:Person[],checkedUsers:any, sortType:any, sortCity:any, sortName:any): Person[] {
    console.log('{{{[');
    
    const filterValue = value.toLowerCase();
    let persons = [...filteredPersonsByDivision]
    if (value !== '') {
      persons = filteredPersonsByDivision.filter((option) =>
      option.name?.toLowerCase().includes(filterValue) ||
      option.city?.toLowerCase().includes(filterValue)
    )
    }



  persons = this.sortUsers(persons, checkedUsers, sortType, sortCity, sortName)
  



  return  persons

      
  }


 _filterDivisions(value: string, divisions:Division[]) {
    console.log('{{{[', value);
    

    if (value !== '') {
      const filterValue = value.toLowerCase();
     return  [...divisions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue))]
    }


  
    return divisions
      
  }


  async updateWtsStorage(checkedGroup:WorkTimeGroup, year:string){
    const wts = await firstValueFrom(this.workTimeSettingsApi.getWorkTimeGroupByUid(checkedGroup.uid,year))
      if (!wts) {
      
     this.workTimeSettingStorageService.clearTimeGroup()
     return 
      }
      this.workTimeSettingStorageService.setWorkTimeGroup(wts)
  }

  async updateWtsPostitions(checkedWtg:WorkTimeGroup | null, GroupSettings:WorkTimeSetting[], settingPositions:{uid:string, position:number}[], year:number ){  
    const group = await firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...checkedWtg, workTimeSettings:GroupSettings, settingPositions:settingPositions }))


        this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup )
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
         
      if (checkedWtg) this.updateWtsStorage(group[0].redo.obj  as WorkTimeGroup,String(year))
  

  }

  async updateGroup(checkedWtg:WorkTimeGroup | null, GroupSettings:WorkTimeSetting[],){
    const group = await firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...checkedWtg, workTimeSettings:GroupSettings }))
    
 
    this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup )
    this.historyGroupService.setUndoArray(group)
    this.historyGroupService.redoArray$.next([])

    this.updateWtsStorage(group[0].redo.obj  as WorkTimeGroup,String( moment().year()))
  }

 
  clearGroup() {
    this.AllGroups.next([])
  }


}

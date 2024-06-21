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
import { SortType } from '../models/SortType.model';


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





  sortUsers(persons:Person[], checkedUsers:Person[], sort:SortType){
    if (sort.active === 'name') {
      persons.sort((a,b)=>{
        const isAsc = sort.direction === 'asc';
        return this.compare(a.name, b.name, isAsc);
      })

      return Array.from(new Set([...checkedUsers,...persons]))
    }

    if (sort.active === 'city') {
      persons.sort((a,b)=>{
        const isAsc = sort.direction === 'asc';
        return this.compare(a.city, b.city, isAsc);
      })

      return Array.from(new Set([...checkedUsers,...persons]))
    }

    persons.sort((a,b)=>{
      const isAsc = sort.direction === 'asc';
      return this.compare(a.name, b.name, isAsc);
    })


    
      
    return Array.from(new Set([...checkedUsers,...persons]))

  }

  compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }



   _filter(value: string, filteredPersonsByDivision:Person[],checkedUsers:any, sort:SortType): Person[] {
    console.log('{{{[');
    
    const filterValue = value.toLowerCase();
    let persons = [...filteredPersonsByDivision]
    if (value !== '') {
      persons = filteredPersonsByDivision.filter((option) =>
      option.name?.toLowerCase().includes(filterValue) ||
      option.city?.toLowerCase().includes(filterValue)
    )
    }



  persons = this.sortUsers(persons, checkedUsers, sort)
  



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
    console.log('checkedGroup', checkedGroup,  wts );
      if (!wts) {
   
      
     this.workTimeSettingStorageService.clearTimeGroup()
     return 
      }
      this.workTimeSettingStorageService.setWorkTimeGroup(wts)
  }

  async updateWtsPostitions(checkedWtg:WorkTimeGroup, groupSettings:WorkTimeSetting[], settingPositions:{uid:string, position:number}[], year:number, isUpdatebyApi:boolean ):
  Promise<
  {
     groupSettings:WorkTimeSetting[],
     settingPositions:{uid:string, position:number}[]}>
  {  
  
  
    let checkedGroup = checkedWtg
    settingPositions = []


    for (let i = 0; i < groupSettings.length; i++) {
      const element = groupSettings[i];
     settingPositions.push({uid:element.uid, position:i})
      
}
if (isUpdatebyApi) {

  
  checkedGroup = await firstValueFrom(this.workTimeGroupsApi.getWorkTimeGroupById(checkedWtg.uid))
  const settingsForSort = [...groupSettings]
  groupSettings = []
  
  console.log('checkedGroup333', checkedGroup.settingPositions, checkedGroup.workTimeSettings );
  if (checkedGroup.settingPositions.length > 0) {
    checkedGroup.settingPositions.sort((a,b)=> a.position - b.position).forEach(pos=>{
      const item = checkedGroup.workTimeSettings.find(el=>el.uid === pos.uid)
      item && groupSettings.push(item)
  
    })
  }else{
  
    
    groupSettings = [...checkedGroup.workTimeSettings]
    console.log('groupSettings', groupSettings);
  }








    this.updateWtsStorage(checkedGroup  as WorkTimeGroup,String(year))
    this.checkedGroupStorageService.setCheckedGroup(checkedGroup  as WorkTimeGroup )


}else{
  const group = await firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...checkedWtg, workTimeSettings:groupSettings, settingPositions:settingPositions }))
  this.historyGroupService.setUndoArray(group)
  this.historyGroupService.redoArray$.next([])
  if (checkedWtg) this.updateWtsStorage(group[0].redo.obj  as WorkTimeGroup,String(year))
    this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup )
}
   



   return {groupSettings, settingPositions}
  }

  async updateGroup(checkedWtg:WorkTimeGroup){
    const group = await firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...checkedWtg }))
    
 
    this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup )
    this.historyGroupService.setUndoArray(group)
    this.historyGroupService.redoArray$.next([])

    this.updateWtsStorage(group[0].redo.obj  as WorkTimeGroup,String( moment().year()))
  }

  async removeAllUsers(wtg:WorkTimeGroup | null, persons:Person[], checkedUsers:Person[]):Promise<{persons:Person[], checkedUsers:Person[]}>{
    if (!wtg )  return  {persons, checkedUsers}
    persons = [...persons.filter(elOne=>!checkedUsers.find(elTwo=>elTwo.keycloakUid == elOne.keycloakUid))]
    const data = await firstValueFrom(this.workTimeGroupsApi.getWorkTimeGroupById(wtg.uid))
 
    const newUsers = data.userIds.filter(el=> !checkedUsers.find(elTwo=>elTwo.keycloakUid  === el) )
    
    checkedUsers = []
    const group = await firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...wtg, userIds:newUsers }))

    this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup)
    this.historyGroupService.setUndoArray(group)
    this.historyGroupService.redoArray$.next([])
    
    return {persons, checkedUsers}
 
 
  }


  passageByDivisionTree(division:Division | null, filteredPersonsByDivision:Person[],persons:Person[], divisions:Division[]){
    if (division === null) {
      return persons

      
       
     }
 
     filteredPersonsByDivision = Array.from(new Set([...filteredPersonsByDivision,...persons.filter(el=>el.treeDivisionId === division.id)])) 
 
     
 for (let i = 0; i < divisions.length; i++) {
  const el = divisions[i];
  if (el.parentDivisionId === division.id) {
    filteredPersonsByDivision =  this.passageByDivisionTree(el, filteredPersonsByDivision, persons, divisions)
   }
 }
   
 return filteredPersonsByDivision
  }

 
  clearGroup() {
    this.AllGroups.next([])
  }


}

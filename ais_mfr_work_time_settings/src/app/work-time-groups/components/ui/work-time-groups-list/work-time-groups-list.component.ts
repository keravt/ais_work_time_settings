import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WorkTimeGroupsApi } from '../../../api/work-time-groups.api';
import { WorkTimeGroup } from '../../../models/WorkTimeGroup.model';

@Component({
  selector: 'app-work-time-groups',
  templateUrl: './work-time-groups-list.component.html',
  styleUrls: ['./work-time-groups-list.component.scss'],
  styles:['{flex:1 1 auto}']
})
export class WorkTimeGroupsListComponent {
   
  isGroupCreator:boolean = false

  checkedGroup:WorkTimeGroup | null = null
  opened:boolean = false
  workTimesGroups:  Observable<WorkTimeGroup[]> =
  this.workTimeGroupService.getWorkTimeGroups();

  constructor(
    private workTimeGroupService:WorkTimeGroupsApi,
    
  ) {}
  

  addCopySettings(){

    this.workTimesGroups = this.workTimeGroupService.getWorkTimeGroups()

  }

  checkGroup(wtg:WorkTimeGroup){
    this.checkedGroup = wtg
    this.opened = true
  }

  closeAddPerson(){
    this.opened = false
  }

  changeGroupCreator(bool:boolean){
    this.isGroupCreator = bool
  }

  filtrGroups(uid:string){
    this.workTimesGroups = this.workTimesGroups.pipe(map(groups=>groups.filter(el=>el.uid !== uid)))
    this.opened = false
  }


  onCreateGroup(){
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups();
    this.isGroupCreator = false
  }

     

}

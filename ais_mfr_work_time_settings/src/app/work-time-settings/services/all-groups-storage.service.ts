import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';


@Injectable({
  providedIn: 'root'
})
export class AllGroupsStorageService {

  constructor(

  ) { }


  private AllGroups: BehaviorSubject<WorkTimeGroup[]> = new BehaviorSubject<WorkTimeGroup[]>([])
  public AllGroups$: Observable<WorkTimeGroup[]> = this.AllGroups.asObservable()





  setAllGroups(allGroups: WorkTimeGroup) {
    this.AllGroups.next([allGroups])
  }

  getAllGroups() {
    return this.AllGroups.value
  }


 
  clearGroup() {
    this.AllGroups.next([])
  }


}

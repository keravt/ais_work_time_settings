import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';



@Injectable({
  providedIn: 'root'
})
export class CheckedGroupStorageService {

  constructor(

  ) { }


  private checkedGroup: BehaviorSubject<WorkTimeGroup | null> = new BehaviorSubject<WorkTimeGroup | null>(null)
  public checkedGroup$: Observable<WorkTimeGroup | null> = this.checkedGroup.asObservable()





  setCheckedGroup(checkedGroup: WorkTimeGroup) {
    this.checkedGroup.next(checkedGroup)
  }


 
  clearGroup() {
    this.checkedGroup.next(null)
  }








}

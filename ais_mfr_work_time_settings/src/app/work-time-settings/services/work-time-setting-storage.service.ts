import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';



@Injectable({
  providedIn: 'root'
})
export class WorkTimeSettingStorageService {

  constructor(

  ) { }

  private workTimeSetting: BehaviorSubject<WorkTimeSetting | null> = new BehaviorSubject<WorkTimeSetting | null>(null)
  public workTimeSetting$: Observable<WorkTimeSetting | null> = this.workTimeSetting.asObservable()


  setWorkTimeSetting(workTimeSetting: WorkTimeSetting) {
    this.workTimeSetting.next(workTimeSetting)
  }






}

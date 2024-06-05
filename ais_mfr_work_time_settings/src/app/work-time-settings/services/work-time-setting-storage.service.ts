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

  private workTimeGroup: BehaviorSubject<WorkTimeSetting | null> = new BehaviorSubject<WorkTimeSetting | null>(null)
  public workTimeGroup$: Observable<WorkTimeSetting | null> = this.workTimeGroup.asObservable()

  private workTimeSettingId: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)
  public workTimeSettingId$: Observable<string | null> = this.workTimeSettingId.asObservable()


  private workTimeGroupId: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)
  public workTimeGroupId$: Observable<string | null> = this.workTimeGroupId.asObservable()


  private year: BehaviorSubject<number> = new BehaviorSubject<number>(2024)
  public year$: Observable<number> = this.year.asObservable()


  setWorkTimeSetting(workTimeSetting: WorkTimeSetting) {
    this.workTimeSetting.next(workTimeSetting)
  }

  setWorkTimeGroup(workTimeGroup: WorkTimeSetting) {
    this.workTimeGroup.next(workTimeGroup)
  }


  setWorkTimeSettingId(workTimeSettingId: string | null) {
    this.workTimeSettingId.next(workTimeSettingId)
  }

  setWorkTimeGroupId(workTimeGroupId: string | null) {
    this.workTimeGroupId.next(workTimeGroupId)
  }


  getWorkTimeGroupId() {
   return  this.workTimeGroupId.getValue()
  }


  setYear(year: number) {
    this.year.next(year)
  }


  getYear() {
   return  this.year.getValue()
  }

  clearTimeSetting() {
    this.workTimeSetting.next(null)
  }

  clearTimeGroup() {
    this.workTimeGroup.next(null)
  }

  clearTimeSettingId() {
    this.workTimeSettingId.next(null)
  }

  clearTimeGroupId() {
    this.workTimeGroupId.next(null)
  }







}

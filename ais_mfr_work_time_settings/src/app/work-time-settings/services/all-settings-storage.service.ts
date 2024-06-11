import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';


@Injectable({
  providedIn: 'root'
})
export class AllSettingsStorageService {

  constructor(

  ) { }


  private AllSettings: BehaviorSubject<WorkTimeSetting[]> = new BehaviorSubject<WorkTimeSetting[]>([])
  public AllSettings$: Observable<WorkTimeSetting[]> = this.AllSettings.asObservable()





  setAllSettings(allSettings: WorkTimeSetting) {
    this.AllSettings.next([allSettings])
  }


 
  clearGroup() {
    this.AllSettings.next([])
  }








}

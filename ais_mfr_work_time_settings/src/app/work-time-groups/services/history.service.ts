import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { WorkTimeSettingsApi } from '../api/work-time-settings.api';
import { WorkTimeChange } from '../models/workTimeChange.model';
import { WorkTimeSettingStorageService } from './work-time-setting-storage.service';
import { WorkTimeApi } from '../api/work-time.api';


@Injectable({
  providedIn: 'root'
})

export class HistoryService {

  constructor(
    private workTimeApi:WorkTimeApi,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService
  ) { }

  public undoArray$ = new BehaviorSubject<WorkTimeChange[][]>([]);
  public redoArray$ = new BehaviorSubject<WorkTimeChange[][]>([]);
  public isChanged$ = new BehaviorSubject<boolean>(true);


  public setUndoArray(WorkTimeChanges: WorkTimeChange[]) {
    this.undoArray$.next([...this.undoArray$.getValue(),WorkTimeChanges]);
  }

  public setRedoArray(WorkTimeChanges: WorkTimeChange[]) {
    this.redoArray$.next([...this.redoArray$.getValue(),WorkTimeChanges]);
  }
  
  public  popUndoArray() {
    const values = this.undoArray$.getValue();
    const sliceValues = values.slice(0, values.length - 1)
   
    return   this.undoArray$.next(sliceValues);
  

  }

  public  popRedoArray() {
    const values = this.redoArray$.getValue();
    const sliceValues = values.slice(0, values.length - 1)
   
    return   this.redoArray$.next(sliceValues);
  

  }

  
  public  getUndoLastChanges() {
    const values = this.undoArray$.getValue();
    if (values.length !== 0) {
      const lastChanges = values[values.length-1]
   
      return lastChanges
    }
    return []
  
  

  }

  public  getRedoLastChanges() {
    const values = this.redoArray$.getValue();
    if (values.length !== 0) {
      const lastChanges = values[values.length-1]
   
      return lastChanges
    }
    return []
  
  

  }


  public getUndoArray() {
    return this.undoArray$.getValue();

  }


  public getRedoArray() {
    return this.redoArray$.getValue();

  }

  public  async onRedoChange(uid:string, year:string){
    if (this.isChanged$.getValue() === false || this.redoArray$.getValue().length === 0) {
      return 
    }

    this.isChanged$.next(false)
    const lastChanges = this.getRedoLastChanges()

    const redoLastChanges = lastChanges.map(el=>el.redo)
    
     await firstValueFrom(this.workTimeApi.changeWorkTime(redoLastChanges))
    const wts = await firstValueFrom(this.workTimeSettingsApi.getWorkTimeSettingByUid(uid, year))     

    this.workTimeSettingStorageService.setWorkTimeSetting(wts)
    this.popRedoArray()
    this.isChanged$.next(true)
    if (lastChanges.length !== 0) this.setUndoArray(lastChanges)
   
    
  }

  public async onUndoChange(uid:string, year:string){

    if (this.isChanged$.getValue() === false || this.undoArray$.getValue().length === 0) {
      return 
    }

    const lastChanges = this.getUndoLastChanges()
    const undoLastChanges = lastChanges.map(el=>el.undo)
    this.isChanged$.next(false)

    
    await firstValueFrom(this.workTimeApi.changeWorkTime(undoLastChanges))
    const wts = await firstValueFrom (this.workTimeSettingsApi.getWorkTimeSettingByUid(uid, year))
    this.workTimeSettingStorageService.setWorkTimeSetting(wts)
    this.isChanged$.next(true)
    this.popUndoArray()
    lastChanges.length !== 0 && this.setRedoArray(lastChanges)
   
  }
  
}

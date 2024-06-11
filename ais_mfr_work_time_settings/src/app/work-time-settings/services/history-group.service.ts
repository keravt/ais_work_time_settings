import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { WorkTimeSettingsApi } from '../api/work-time-settings.api';
import { WorkTimeChange } from '../models/workTimeChange.model';
import { WorkTimeSettingStorageService } from './work-time-setting-storage.service';
import { WorkTimeApi } from '../api/work-time.api';
import { GroupChange, GroupChangeObj } from '../models/GroupChange.model';
import { WorkTimeGroupsApi } from '../api/work-time-groups.api';


@Injectable({
  providedIn: 'root'
})

export class HistoryGroupService {

  constructor(
    private workTimeGroupsApi:WorkTimeGroupsApi,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService
  ) { }

  public undoArray$ = new BehaviorSubject<GroupChange[][]>([]);
  public redoArray$ = new BehaviorSubject<GroupChange[][]>([]);
  public isChanged$ = new BehaviorSubject<boolean>(true);


  public setUndoArray(GroupChanges: GroupChange[]) {
    this.undoArray$.next([...this.undoArray$.getValue(),GroupChanges]);
  }

  public setRedoArray(GroupChanges:GroupChange[]) {
    this.redoArray$.next([...this.redoArray$.getValue(),GroupChanges]);
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

  public  async onRedoChange():Promise<GroupChangeObj[]>{
    if (this.isChanged$.getValue() === false || this.redoArray$.getValue().length === 0) {
      return []
    }

    this.isChanged$.next(false)
    const lastChanges = this.getRedoLastChanges()

    const redoLastChanges = lastChanges.map(el=>el.redo)
    

    this.popRedoArray()
    this.isChanged$.next(true)
    if (lastChanges.length !== 0) this.setUndoArray(lastChanges)
    await firstValueFrom(this.workTimeGroupsApi.changeGroup(redoLastChanges))
    return redoLastChanges
    
  }

  public async onUndoChange():Promise<GroupChangeObj[]>{
    console.log('this.undoArray$.getValue()', this.undoArray$.getValue());
    
    if (this.isChanged$.getValue() === false || this.undoArray$.getValue().length === 0) {
      return []
    }

    const lastChanges = this.getUndoLastChanges()
    const undoLastChanges = lastChanges.map(el=>el.undo)
    this.isChanged$.next(false)
      console.log('undoLastChanges', undoLastChanges);
      
      await firstValueFrom(this.workTimeGroupsApi.changeGroup(undoLastChanges))

    this.isChanged$.next(true)
    this.popUndoArray()
    lastChanges.length !== 0 && this.setRedoArray(lastChanges)
    return undoLastChanges
  }
  
}

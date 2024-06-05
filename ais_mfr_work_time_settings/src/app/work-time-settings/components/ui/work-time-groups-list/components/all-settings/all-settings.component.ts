import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import {Sort as matSort} from '@angular/material/sort';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-all-settings',
  templateUrl: './all-settings.component.html',
  styleUrls: ['./all-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllSettingsComponent {

  constructor(
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeGroupsApi: WorkTimeGroupsApi,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef,
    private dialogRef: MatDialogRef<AllSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkTimeGroup,
  ) {}

  workTimesSettings:  Observable<WorkTimeSetting[]> =
  this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  allSearch = ''
  sortDirect:matSort = {active:'', direction:''}
  @Output() onChange = new EventEmitter()


  showSettingCreator = false
  closeSettingCreate(){
    this.showSettingCreator = false
  }


  close(){
    this.dialogRef.close()
  }

  sortWorkTimesSettings(groups:WorkTimeSetting[]){

    let filtrGroups = [...groups]
    if(this.allSearch !== ''){
      filtrGroups = [...filtrGroups.filter(group=>group.title.includes(this.allSearch))]
    }
  

    if (this.sortDirect.active = '') {
      return filtrGroups.sort((a, b)=>a.created_at.valueOf() - b.created_at.valueOf())
    }
  return filtrGroups.sort((a, b)=>{
    const isAsc = this.sortDirect.direction === 'asc';
    return this.compare(a.title, b.title, isAsc);
  })
    }



    compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }


    sortData(sort: matSort) {
     this.sortDirect = sort
     this.updateItems()
    }


  updateItems(){
    this.closeSettingCreate()
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
    this.workTimeGroupsApi.getWorkTimeGroupById(this.data.uid).subscribe(data=>{
      this.snackBar.open(`группа обновлена`, undefined,{
        duration: 2000
      }); 
      this.data = data
    })
    this.onChange.emit()
  }

  showSettingCreate(){
    this.showSettingCreator = true

  }

  onAllFiltrChange(){

    
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }



}

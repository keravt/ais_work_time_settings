import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map } from 'rxjs';
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
export class AllSettingsComponent implements OnInit {

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
  ngOnInit(): void {
    this.workTimeGroupsApi.getWorkTimeGroupById(this.data.uid).subscribe(data=>{
      this.checkedWts = data.workTimeSettings
   
    })

    this.workTimeSettingsApi.getWorkTimeSettings().subscribe(data=>{
  this.allSettings = data
    })
  }

  workTimesSettings:  Observable<WorkTimeSetting[]> =
  this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  allSearch = ''
  sortDirect:matSort = {active:'', direction:''}
  checkedWts:WorkTimeSetting[] = []
  allSettingChecked = false
  allSettings:WorkTimeSetting[] = []
  @Output() onChange = new EventEmitter()


  showSettingCreator = false
  closeSettingCreate(){
    this.showSettingCreator = false
  }


  close(){
    this.dialogRef.close()
  }

  checkAllSettings(){
    this.checkedWts = [...this.allSettings]
    this.allSettingChecked = true
  }

  uncheckAllSettnigs(){
    this.checkedWts = []
    this.allSettingChecked = false
  }


  sortWorkTimesSettings(groups:WorkTimeSetting[]){

    let filtrGroups = [...groups]
    if(this.allSearch !== ''){
      filtrGroups = [...filtrGroups.filter(group=>group.title.includes(this.allSearch))]
    }
  

    if (this.sortDirect.active = '') {
      const wts =  filtrGroups.filter(elOne=>{
      return  !this.checkedWts.find(el=>el.uid === elOne.uid)
      }).sort((a, b)=>a.created_at.valueOf() - b.created_at.valueOf())
    
     return  [...this.checkedWts, ...wts]
    }
    const wts =filtrGroups.filter(elOne=>{
      return !this.checkedWts.find(el=>el.uid === elOne.uid)
     }).sort((a, b)=>{
    const isAsc = this.sortDirect.direction === 'asc';
    return this.compare(a.title, b.title, isAsc);
  })

  return  [...this.checkedWts, ...wts]
    }



    compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }


    sortData(sort: matSort) {
     this.sortDirect = sort
     this.updateItems()
    }

    userChecked(wts: WorkTimeSetting) {
      console.log('{{{{');
      
      if (this.checkedWts.find(el=>el.uid === wts.uid)) {
        this.checkedWts = this.checkedWts.filter(el => el.uid !== wts.uid)
      } else {
        this.checkedWts = [...this.checkedWts,wts]
      }
  
      
    }


    addToGroup(){
    
      this.workTimeGroupsApi.getWorkTimeGroupById(this.data.uid).subscribe(data=>{
  
        this.workTimeGroupsApi.updateWorkTimeGroup({...data, workTimeSettings:this.checkedWts  }).subscribe({next:(group)=>{
          this.workTimesSettings =
          this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
        
          this.onChange.emit()
          this.cdr.markForCheck()
          
      }
      
      })
      })

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
      this.cdr.markForCheck()
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

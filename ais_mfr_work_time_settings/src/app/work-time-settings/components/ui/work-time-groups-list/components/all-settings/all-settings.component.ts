import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import {Sort as matSort} from '@angular/material/sort';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';
import { isSetting } from 'src/app/work-time-settings/guards/isSetting';
import { AllGroupsStorageService } from 'src/app/work-time-settings/services/all-groups-storage.service';
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
    private checkedGroupStorageService: CheckedGroupStorageService,
    private allSettingsStorageService: AllSettingsStorageService,
    private allGroupsStorageService: AllGroupsStorageService,
    private historyGroupService:     HistoryGroupService,
    @Inject(MAT_DIALOG_DATA) public data: WorkTimeGroup,
  ) {}

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }




  ngOnInit(): void {


    this.workTimeGroupsApi.getWorkTimeGroupById(this.data.uid).subscribe(data=>{
      this.checkedWts = data.workTimeSettings
      this.data = data
      this.cdr.markForCheck()
   
    })

    this.workTimeSettingsApi.getWorkTimeSettings().subscribe(data=>{
  this.allSettings = data
  this.cdr.markForCheck()
    })

    this.checkedGroupStorageService.checkedGroup$.subscribe(group=>{
    
      if (group) {
    
        
        this.checkedWts = group.workTimeSettings
      }
      this.cdr.markForCheck()
    })

    this.allSettingsStorageService.AllSettings$.subscribe(data=>{
      this.workTimesSettings =
      this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
     this.workTimeGroupsApi.getWorkTimeGroupById(this.data.uid).subscribe(group=>{
      this.checkedWts = group.workTimeSettings
      this.cdr.markForCheck()
     })
      this.cdr.markForCheck()
    })


    this.historyGroupService.undoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
 
      this.workTimesSettings =
      this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
      this.undoActive = data.length === 0 ? false : true
      this.cdr.markForCheck()
    })


    this.historyGroupService.redoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
      this.redoActive = data.length === 0 ? false : true
      this.cdr.markForCheck()
    })


  }

  workTimesSettings:  Observable<WorkTimeSetting[]> =
  this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  allSearch = ''
  sortDirect:matSort = {active:'', direction:''}
  checkedWts:WorkTimeSetting[] = []
  allSettingChecked = false
  allSettings:WorkTimeSetting[] = []
  undoActive:boolean = false
  redoActive:boolean = false
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


  sortWorkTimesSettings(groups:WorkTimeSetting[], onHistroy:boolean = false){

    let filtrGroups = [...groups]

    
    const checkedWtsForSort:WorkTimeSetting[] = []
  
    this.data.workTimeSettings.forEach(el=>{
      const item = groups.find(item=>item.uid === el.uid)
      item  && checkedWtsForSort.push(item)
    })
 
    this.checkedWts = [...checkedWtsForSort]
    console.log('groups', this.checkedWts);
   
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

    
        const removedSettings = data.workTimeSettings.filter(el=>!this.checkedWts.find(item=>item.uid == el.uid))
        console.log('this.checkedWts', this.checkedWts);
        

        let settingPositions = data.settingPositions

        settingPositions = settingPositions
        .filter(el=>!removedSettings.find(item=>item.uid == el.uid))
        .sort((a,b)=> a.position - b.position)
        .map((el,i)=>({uid:el.uid,position:i}))


        const addedSettings = this.checkedWts
        .filter(el=>!data.workTimeSettings.find(item=>item.uid == el.uid))
        .map((el,i)=>({uid:el.uid, position:settingPositions.length + i }))
        
        settingPositions = [...settingPositions, ...addedSettings]
   
        this.workTimeGroupsApi.updateWorkTimeGroup({...data, workTimeSettings:this.checkedWts, settingPositions  }).subscribe({next:(group)=>{
   
      
          this.workTimesSettings =
          this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
          if(!isSetting(group[0].redo.obj)){
            this.data = group[0].redo.obj
          }
          this.historyGroupService.setUndoArray(group)
          this.historyGroupService.redoArray$.next([])
          this.onChange.emit()
          this.cdr.markForCheck()
          
      }
      
      })
      })

    }


    async undo(){

      const data = await this.historyGroupService.onUndoChange()
      console.log('data[0].obj', data[0].obj);

   
     
      if (!isSetting(data[0].obj)) {
        this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
        this.allGroupsStorageService.setAllGroups(data[0].obj)
      }else{
        this.allSettingsStorageService.setAllSettings(data[0].obj)
       }
    
       this.snackBar.open(`изменение группы `, undefined,{
        duration: 2000
      }); 
    }
  
  
    async redo(){
  
  
      const data =  await this.historyGroupService.onRedoChange()
    if (!isSetting(data[0].obj)) {
      this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
      this.allGroupsStorageService.setAllGroups(data[0].obj)
    }else{
      this.allSettingsStorageService.setAllSettings(data[0].obj)
     }
  
    this.snackBar.open(`изменение группы `, undefined,{
      duration: 2000
    }); 
    }



  updateItems(){
    console.log('delete2');
    console.log('__@$', ); 
    this.closeSettingCreate()
    console.log('__@'); 
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

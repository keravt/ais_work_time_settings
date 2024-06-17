import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';



import { ActivatedRoute,  Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { DeleteWorkTimeSettingsComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-settings/delete-work-time-settings.component';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import * as moment from 'moment';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';



@Component({
  selector: 'app-work-time-setting-item',
  templateUrl: './work-time-setting-item.component.html',
  styleUrls: ['./work-time-setting-item.component.scss']
})
export class WorkTimeSettingItemComponent implements OnInit {

  constructor( 
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeGroupsApi:WorkTimeGroupsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,

    private historyGroupService:HistoryGroupService,
    private router: Router,
     private route: ActivatedRoute,
     public dialog: MatDialog,
     private cdr:ChangeDetectorRef,
     private elementRef: ElementRef,){
 
  }



  @Input() checkedSetting!:WorkTimeSetting | null
  @Input() wts!:WorkTimeSetting 
  @Input() wtg!:WorkTimeGroup

  @Output() onSettingDelete = new EventEmitter<string>()
  @Output() onSettingCopy = new EventEmitter<WorkTimeSetting>()
  @Output() onSettingUpdate = new EventEmitter()
  inputValue:string = ''
  changedName:boolean = false
  loader:boolean = false
  inGroup = false

  ngOnInit(): void {
    console.log('wtgg', this.wtg.workTimeSettings);
    
    
  if (this.wtg.workTimeSettings.find(el=>el.uid === this.wts.uid)) {
    this.inGroup = true
  }
   
  this.inputValue = this.wts.title
    
    
 
  }

  addToGroup(){
    let settings = [...this.wtg.workTimeSettings]
    if (settings.find(el=>el.uid === this.wts.uid)) {
      settings = [...settings.filter(el=>el.uid !== this.wts.uid)]
      this.inGroup = true
    }else{
      settings = [...settings,this.wts ]
      this.inGroup = false
    }
    this.workTimeGroupsApi.updateWorkTimeGroup({...this.wtg, workTimeSettings:settings  }).subscribe({next:(group)=>{
      this.wtg = group[0].redo.obj  as WorkTimeGroup
      this.onSettingUpdate.emit()
      
  }
  
  })
  }



  onItemClick(uid:string){
      if (this.changedName) return
    this.router.navigate([uid,new Date().getFullYear()],{relativeTo:this.route});
  
  
}

  changeName(){

    this.changedName = true
    const elementRef = this.elementRef.nativeElement as HTMLElement
    const change = elementRef.querySelector('#change') as HTMLElement
     console.log('change', change);
     
    
    change.focus()
   }

   updateTitle(){
    if (this.wts) {
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.wts.uid,title:this.inputValue,isGeneral:this.wts.isGeneral}).subscribe(group=>{
          console.log('d$$$$', group);
          
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        this.changedName = false
        if (this.wts) {
          this.wts.title = this.inputValue
        }
        this.onSettingUpdate.emit()
        this.cdr.markForCheck()
      })
    }
  
   }

   copyWts(){

    if (!this.wts) {
      return
    }
    console.log();
    
    this.workTimeSettingsApi.copyWorkTimeSetting(this.wts).subscribe(group=>{
      this.historyGroupService.setUndoArray(group)
      this.historyGroupService.redoArray$.next([])
      
      this.onSettingCopy.emit(group[0].undo.obj  as WorkTimeSetting)
      this.cdr.markForCheck()
    })
   }

   onInputClick(event:MouseEvent){
    event.stopPropagation()
   }

   slideToggleClick(event:MouseEvent){
    event.stopPropagation()
   }

   removeSetting(){
 
    if (!this.wts) {
      return
    }
 const thisDialog = this.dialog.open(DeleteWorkTimeSettingsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:this.wts.uid, type:'Setting'},
      width: '448px',
    
    });
    thisDialog.beforeClosed().subscribe(action=>{
      
      if (action === 'delete') {

        this.onSettingUpdate.emit()
    
        this.cdr.detectChanges()
      }
      this.cdr.detectChanges()

    })



   }

   closeChanged(){
 
    this.changedName = false
   }

   onKeyDown(event:KeyboardEventInit){
 
    
    if (!this.wts) {
      return
    }

    if (event.key === 'Escape') {
      this.changedName = false
    }
    if (event.key === 'Enter') {
      
      
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.wts.uid,title:this.inputValue,isGeneral:this.wts.isGeneral}).subscribe(group=>{
        if (!this.wts) {
          return
        }
        this.changedName = false
        
        this.wts.title = this.inputValue
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        this.onSettingUpdate.emit()
        this.cdr.markForCheck()
      })
    }
   
   }

   goToSetting(){
    this.workTimeSettingStorageService.setWorkTimeSettingId(this.wts.uid)
   
  }
  

 




}

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { AllGroupsStorageService } from 'src/app/work-time-settings/services/all-groups-storage.service';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { GroupService } from 'src/app/work-time-settings/services/group.service';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { AllSettingsComponent } from '../all-settings/all-settings.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupSettingsComponent {



  ngOnInit(): void {


    this.workTimeSettingStorageService.year$.subscribe(data=>{
      this.year = data
    })




      this.checkedGroupStorageService.checkedGroup$.subscribe(group=>{
          console.log('@@@', group);
          
        this.wtg = group
        if (this.wtg) {
          this.checkWtg(this.wtg)
        }
  
        this.cdr.markForCheck()
      })

      this.allSettingsStorageService.AllSettings$.subscribe(data=>{
        if (!this.wtg) return
        this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(group=>{
          this.wtg = group
       
            this.checkWtg(this.wtg)
    
    
          this.cdr.markForCheck()
        })
      })
      
  }


  constructor(

    private workTimeGroupsApi: WorkTimeGroupsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private groupService:GroupService,
    private snackBar: MatSnackBar,
    private allGroupsStorageService:AllGroupsStorageService,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private allSettingsStorageService: AllSettingsStorageService,
    


  ) {}
  
  wtg:WorkTimeGroup | null = null
  checkedSettings:WorkTimeSetting[] = []
  settingsControl = new FormControl('');
  GroupSettings:WorkTimeSetting[] = []
 filteredSettings!: WorkTimeSetting[];
  isLoadingSettings = false
  settingPositions:{uid:string, position:number}[] = []
  settingValue = ''
 settingVisible = true
  year = moment().year()
  allSettingChecked = false



  checkAllSettings(){
    this.checkedSettings = Array.from(new Set([...this.checkedSettings, ...this.GroupSettings]))
    this.allSettingChecked = true
  }

  uncheckAllSettnigs(){
    this.checkedSettings = []
    this.allSettingChecked = false
  }

  openAllSettings(){
    
    const dialogRef = this.dialog.open(AllSettingsComponent, {
      minWidth: '600px',
      maxWidth:'600px',
      autoFocus: false, 
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:this.wtg
    });

    dialogRef.componentInstance.onChange.subscribe(async ()=>{


      if (!this.wtg) return
      await this.updateWtsPostitions(true)
      this.allGroupsStorageService.setAllGroups(this.allGroupsStorageService.getAllGroups()[0])
      this.cdr.markForCheck()

   
    })
  }

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.GroupSettings, event.previousIndex, event.currentIndex);

    
    if (this.wtg) {
  this.updateWtsPostitions(false)
    
      
    }
  }
  settingChecked(setting: WorkTimeSetting) {
    if (this.checkedSettings.find(el=>el.uid === setting.uid)) {
      this.checkedSettings = this.checkedSettings.filter(el => el.uid !== setting.uid)
    } else {
      this.checkedSettings = [...this.checkedSettings, setting] 
    }
    

  }
 async updateWtsPostitions(isUpdatebyApi:boolean){

    if(!this.wtg) return
    let {groupSettings, settingPositions} = await  this.groupService.updateWtsPostitions(this.wtg,this.GroupSettings,this.settingPositions,this.year, isUpdatebyApi) 
     console.log('%%', groupSettings, settingPositions);
     

    this.GroupSettings = groupSettings
    this.settingPositions = settingPositions

    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.allGroupsStorageService.setAllGroups(this.allGroupsStorageService.getAllGroups()[0])
    this.isLoadingSettings = false
    this.cdr.markForCheck()
  }


  async deleteFromGroup(){
    if (!this.wtg)  return

    this.GroupSettings = this.GroupSettings.filter(el => !this.checkedSettings.find(checked=>checked.uid === el.uid))
    this.settingPositions = this.settingPositions
    .filter(el=>this.GroupSettings.find(item=>item.uid === el.uid))
    .sort((a,b)=> a.position - b.position)
    .map((el,i)=>({uid:el.uid,position:i}))

    this.wtg.workTimeSettings = this.GroupSettings
    this.wtg.settingPositions = this.settingPositions


    

    await this.groupService.updateGroup(this.wtg)
    this.checkedSettings = []
    this.allSettingChecked = false
    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.allGroupsStorageService.setAllGroups(this.allGroupsStorageService.getAllGroups()[0])
    this.cdr.markForCheck()
  }


  async checkWtg(wtg:WorkTimeGroup){
    //this.chooseOption(1)
    this.workTimeSettingStorageService.setWorkTimeGroupId(wtg.uid)
 
 
     this.GroupSettings = [...wtg.workTimeSettings].sort((a,b)=>{
       const first = wtg.settingPositions.find(el=>el.uid === a.uid)
       const second = wtg.settingPositions.find(el=>el.uid === b.uid)
       if (second && first) {
         return first?.position - second?.position
       }
       return -1
 
     })
 
     this.wtg = wtg
     this.settingPositions = wtg.settingPositions
    
     await this.groupService.updateWtsStorage(wtg,String(this.year))
 
 
 

         this.cdr.markForCheck()
     
 
 
 
 
   }

  upItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id > 0) {
      [this.GroupSettings[id], this.GroupSettings[id - 1]] =
      [this.GroupSettings[id- 1], this.GroupSettings[id]];
    }
    if (this.wtg) {

     
      this.updateWtsPostitions(false)
      
    }



  }

  downItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id < this.GroupSettings.length - 1) {
      [this.GroupSettings[id], this.GroupSettings[id + 1]] =
      [this.GroupSettings[id+ 1], this.GroupSettings[id]];
    
  }

  if (this.wtg) {


    this.updateWtsPostitions(false)
  }
  }

}

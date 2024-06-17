import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Observable, firstValueFrom, map, startWith, switchMap } from 'rxjs';
import { UserApi } from 'src/app/work-time-settings/api/user.api';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { DeleteWorkTimeGroupComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-group/delete-work-time-group..component';
import { Division } from 'src/app/work-time-settings/models/Division.model';
import { Person } from 'src/app/work-time-settings/models/Person.model';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { AllSettingsComponent } from '../all-settings/all-settings.component';
import { Router } from '@angular/router';
import { DeleteWorkTimeSettingsComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-settings/delete-work-time-settings.component';
import { Sort } from 'src/app/work-time-settings/models/sort.model';
import { MatSort } from '@angular/material/sort';
import { AllUsersComponent } from 'src/app/work-time-settings/components/modals/all-users/all-users.component';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';
import { WorkTimeInfoComponent } from 'src/app/work-time-settings/components/modals/work-time-info/work-time-info.component';
import { GroupService } from 'src/app/work-time-settings/services/group.service';


@Component({
  selector: 'app-add-person-to-work-time-settings',
  templateUrl: './add-person-to-work-time-settings.component.html',
  styleUrls: ['./add-person-to-work-time-settings.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AddPersonToWorkTimeSettingsComponent implements   OnInit {
  constructor(
    private UserApi: UserApi,
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeSettingStorageService: WorkTimeSettingStorageService,
    private workTimeGroupsApi: WorkTimeGroupsApi,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private historyGroupService:     HistoryGroupService,
    private groupService:GroupService,

    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private router:Router,
    


  ) {}


  wtg:WorkTimeGroup | null = null
  @Output() onGroupSave = new EventEmitter()
  @Output() onClose = new EventEmitter()
  @Output() onGroupDelete = new EventEmitter<string>()
  @Output() onGroupCopy = new EventEmitter<string>()
  @Output() onPreviewVisible = new EventEmitter<boolean>()
  personsControl = new FormControl('');
  checkedUsers:Person[] = []
  checkedSettings:WorkTimeSetting[] = []
  settingsControl = new FormControl('');
  persons: Person[] = [];
  allPersons: Person[] = [];
  settings:WorkTimeSetting[] = []
  GroupSettings:WorkTimeSetting[] = []
  filteredPersons: Person[] = [];
  filteredPersonsByDivision: Person[] = [];
  filteredSettings!: WorkTimeSetting[];
  isLoading = false
  isLoadingSettings = false
  isUpdate = false
  checkedWtg:WorkTimeGroup | null = null
  workTimeGroups:WorkTimeGroup[] = []
  lockedUsers:{userUid:string, groupName:string}[] = []
  divisions:Division[] = []
  fiteredDivisions:Division[] = []
  divionInput = new FormControl()
  selectedDivision:null | Division = null
  settingPositions:{uid:string, position:number}[] = []
  option = 1
  inputValue = ''
  settingValue = ''
  previewVisible = false
  settingVisible = true
  changedName = ''
  year = moment().year()
  checkActive = false
  sortName = {active: 'name', direction: ''}
  sortCity = {active: 'city', direction: ''}
  sortType = 'name'
  allChecked = false
  allSettingChecked = false

  ngOnInit(): void {


    this.workTimeSettingStorageService.year$.subscribe(data=>{
      this.year = data
    })
    this.divionInput.valueChanges.subscribe(data=>{
      console.log('dd', data);
      
      this.fiteredDivisions  = this.groupService._filterDivisions(data, this.divisions)
      this.cdr.markForCheck()
    })
    this.UserApi.getAllDivisions().subscribe(data=>{
      console.log('diviss', data);
      
      this.divisions = data.sort((a,b)=>{
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      })
      this.fiteredDivisions =  [...this.divisions]
      this.cdr.markForCheck()
   
      
    })

    this.UserApi.fetch().subscribe( async data => {

      this.allPersons = data.filter(el=>el.keycloakUid)
      this.cdr.markForCheck()
        
      });

      this.checkedGroupStorageService.checkedGroup$.subscribe(group=>{

        this.cdr.markForCheck()
        this.wtg = group
        if (this.wtg) {
          this.checkWtg(this.wtg)
        }
        console.log('kmomji', this.wtg );
      })
  }


  userChecked(person: Person) {
    if (this.checkedUsers.find(el=>el.keycloakUid === person.keycloakUid)) {
      this.checkedUsers = this.checkedUsers.filter(el => el.keycloakUid !== person.keycloakUid)
    } else {
      this.checkedUsers = [...this.checkedUsers,person]
    }

    
  }


  checkAllUsers(){
    this.checkedUsers = Array.from(new Set([...this.checkedUsers, ...this.filteredPersons]))
    this.allChecked = true
  }

  uncheckAllUsers(){
    this.checkedUsers = []
    this.allChecked = false
  }

  checkAllSettings(){
    this.checkedSettings = Array.from(new Set([...this.checkedSettings, ...this.GroupSettings]))
    this.allSettingChecked = true
  }

  uncheckAllSettnigs(){
    this.checkedSettings = []
    this.allSettingChecked = false
  }

  changeName(wts:WorkTimeSetting){
    this.changedName = wts.uid
    this.settingValue = wts.title
    console.log('this.settingValue', this.settingValue, this.changedName);
    
  }

  closeChanged(){
    this.changedName = ''
    this.settingValue = ''
  }

  passageByDivisionTree(division:Division | null){
    console.log('ff', division);
 

    if (division === null) {
      this.filteredPersonsByDivision = [...this.persons]

      return
       
     }
 
     this.filteredPersonsByDivision = Array.from(new Set([...this.filteredPersonsByDivision,...this.persons.filter(el=>el.treeDivisionId === division.id)])) 
 
     
 for (let i = 0; i < this.divisions.length; i++) {
  const el = this.divisions[i];
  if (el.parentDivisionId === division.id) {
    this.passageByDivisionTree(el)
   }
 }
   
 
  }

  sortData(sort:any){
   if (sort.active === 'name') {
     this.sortName.direction = sort.direction
     this.sortType = 'name'
   }

   if (sort.active === 'city') {
    this.sortCity.direction = sort.direction
    this.sortType = 'city'
  }


   this.filteredPersons = this.groupService.sortUsers(this.filteredPersons, this.checkedUsers, this.sortType, this.sortCity, this.sortName)

  }



 

  onDivisionChange(division:Division | null){
    console.log('ddd', division);
    
    this.selectedDivision = division
    this.divionInput.setValue(division?.name ?? '')
    this.filteredPersonsByDivision = []
    this.passageByDivisionTree(division)
    this.filteredPersons = this.groupService._filter(this.personsControl.value ?? '', this.filteredPersonsByDivision,  this.checkedUsers, this.sortType, this.sortCity, this.sortName)
    this.cdr.markForCheck()
  }

  chooseOption(option:number){
    if (option === 1) {
     
      
      this.previewVisible = false
      console.log('dawda', this.previewVisible);
      this.onPreviewVisible.emit(false)
    }else{
      this.previewVisible = true
      this.onPreviewVisible.emit(true)
    }

  this.option = option
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

    dialogRef.componentInstance.onChange.subscribe(()=>{

      
      if (!this.wtg) return
     this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe((data)=>{
      this.GroupSettings = data.workTimeSettings
      this.settingPositions = []
    
      
      for (let i = 0; i < data.settingPositions.length; i++) {
        const element = this.settingPositions[i];
        this.settingPositions.push({uid:element.uid, position:i})
        
      }

      this.updateWtsPostitions()
      this.onGroupSave.emit()
      this.cdr.markForCheck()

     })
    })
  }




  openAllUsers(){
    
    const dialogRef = this.dialog.open(AllUsersComponent, {
      minWidth: '600px',
      maxWidth:'600px',
      autoFocus: false, 
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:this.wtg
    });

    dialogRef.componentInstance.onChange.subscribe(()=>{

      
      if (!this.wtg) return
  
     this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe((data)=>{
      const newPersons = this.allPersons.filter(el=>data.userIds.includes(el.keycloakUid))
      this.persons = newPersons
      this.onDivisionChange(this.selectedDivision)
      this.onGroupSave.emit()
      this.cdr.markForCheck()

     })
    })

  
  }

  gunt(){
    const startDate = moment({year:2024, month:0, date:1}).valueOf()
    const endDate = moment({year:2024, month:1, date:1}).valueOf()
    this.workTimeSettingsApi.getHolidays(startDate,endDate,["8fb28591-ad86-4102-8a02-8d834e2ffef9","921107b0-66e7-4e98-83db-1458effdc908"]).subscribe(data=>{
      console.log('data', data);
      
    })
  }

  openInfo(){
    const dialogRef = this.dialog.open(WorkTimeInfoComponent, {
      minWidth: '600px',
      maxWidth:'600px',
      autoFocus: false, 
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:this.wtg
    });
  }


  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.GroupSettings, event.previousIndex, event.currentIndex);
    console.log('this.GroupSettings', this.GroupSettings);
    
    
    if (this.wtg) {
      this.settingPositions = []
      console.log('tttt', this.settings);
      
      for (let i = 0; i < this.GroupSettings.length; i++) {
        const element = this.GroupSettings[i];
        this.settingPositions.push({uid:element.uid, position:i})
        
      }
      
     
      this.updateWtsPostitions()
      
    }
  }


  removeAllUsers(){
    if (!this.wtg )  return
    this.persons = [...this.persons.filter(elOne=>!this.checkedUsers.find(elTwo=>elTwo.keycloakUid == elOne.keycloakUid))]

    this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(data=>{
      const newUsers = data.userIds.filter(el=> !this.checkedUsers.find(elTwo=>elTwo.keycloakUid  === el) )
    
      this.checkedUsers = []
      this.workTimeGroupsApi.updateWorkTimeGroup({...this.wtg, userIds:newUsers }).subscribe({next:(group)=>{
        this.checkedGroupStorageService.setCheckedGroup(group[0].redo.obj  as WorkTimeGroup)
        this.historyGroupService.setUndoArray(group)
        this.historyGroupService.redoArray$.next([])
        this.onGroupSave.emit()
        this.onDivisionChange(this.selectedDivision)
        this.allChecked = false
        
    this.cdr.markForCheck()
    }})
    })
 

  }

  settingChecked(setting: WorkTimeSetting) {
    if (this.checkedSettings.find(el=>el.uid === setting.uid)) {
      this.checkedSettings = this.checkedSettings.filter(el => el.uid !== setting.uid)
    } else {
      this.checkedSettings = [...this.checkedSettings, setting] 
    }
    

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

    this.checkedWtg = wtg
    this.settingPositions = wtg.settingPositions
    this.persons = [...this.persons.filter(elOne=>!this.checkedUsers.find(elTwo=>elTwo.keycloakUid == elOne.keycloakUid))]
    await this.groupService.updateWtsStorage(wtg,String(this.year))
    this.isLoading = true
    this.isLoadingSettings = true
   
    this.UserApi.fetch().subscribe( async data => {

      
    this.persons = data.filter(el=>el.keycloakUid && wtg.userIds.includes(el.keycloakUid))

    
      this.filteredPersonsByDivision = [...this.persons]
      this.isLoading = false
 
      this.filteredPersons = [...this.persons]
      this.personsControl.valueChanges.subscribe((value)=>{
        this.filteredPersons = this.groupService._filter(value || '',this.filteredPersonsByDivision,  this.checkedUsers, this.sortType, this.sortCity, this.sortName)
       });
        this.onDivisionChange(this.selectedDivision)
        this.cdr.markForCheck()
    });

    this.workTimeGroupsApi.getWorkTimeGroups().subscribe(data=>{
      this.lockedUsers = []
      this.workTimeGroups = data
      data.forEach(el=>{
        if (el.uid !== this.checkedWtg?.uid) {
          const title = el.title
          const uids = el.userIds
          for(const uid of uids){
            this.lockedUsers.push({groupName:title,userUid:uid})
          }
        }

       
      })
      this.cdr.markForCheck()
    })

    this.workTimeSettingsApi.getWorkTimeSettings().subscribe( async settings => {
      this.settings = settings
      this.isLoadingSettings = false

      wtg.settingPositions.forEach(sett => {
        const setting = this.settings.find(el=>el.uid === sett.uid)
        const index = this.settings.findIndex(el=>el.uid === sett.uid)
        if (setting) {
          this.settings.splice(index,1)
          this.settings.splice(sett.position,0,setting)

        }
    });
    this.cdr.markForCheck()
    });


  }



 async updateWtsPostitions(){ 
 await  this.groupService.updateWtsPostitions(this.checkedWtg,this.GroupSettings,this.settingPositions,this.year) 

    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.onGroupSave.emit()
    this.isUpdate = false
    this.cdr.markForCheck()
  }

  async deleteFromGroup(){
    this.GroupSettings = this.GroupSettings.filter(el => !this.checkedSettings.find(checked=>checked.uid === el.uid))
    await this.groupService.updateGroup(this.checkedWtg, this.GroupSettings)
    this.checkedSettings = []
    this.allSettingChecked = false
    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.onGroupSave.emit()
    this.cdr.markForCheck()
  }



async  updateWorkTimeSetting() {
  this.isUpdate = true
  this.workTimeGroups = [...this.workTimeGroups.map(el=>{
    if (this.checkedWtg && this.checkedWtg.uid !== el.uid) {
      return el
    }else{
      return {...el, userIds :Array.from(this.persons.map(el=>el.keycloakUid)) }
    }

  })]
 
   const group =await  firstValueFrom(this.workTimeGroupsApi.updateWorkTimeGroup({...this.checkedWtg, userIds:Array.from(this.persons.map(el=>el.keycloakUid)) , workTimeSettings:this.GroupSettings, settingPositions:this.settingPositions, title:this.inputValue }))
   if (this.checkedWtg) await   this.groupService.updateWtsStorage(group[0].redo.obj  as WorkTimeGroup,String( moment().year()))
    
  this.snackBar.open(`рабочее время обновлено`, undefined,{duration: 2000}); 
  this.onGroupSave.emit()
  this.isUpdate = false
  this.cdr.markForCheck()
  }

  close(){
 this.chooseOption(1)
this.onClose.emit()
  }



  upItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id > 0) {
      [this.GroupSettings[id], this.GroupSettings[id - 1]] =
      [this.GroupSettings[id- 1], this.GroupSettings[id]];
    }
    if (this.wtg) {
      this.settingPositions = []
      console.log('tttt', this.settings);
      
      for (let i = 0; i < this.GroupSettings.length; i++) {
        const element = this.GroupSettings[i];
        this.settingPositions.push({uid:element.uid, position:i})
        
      }
      
     
      this.updateWtsPostitions()
      
    }



  }

  downItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id < this.GroupSettings.length - 1) {
      [this.GroupSettings[id], this.GroupSettings[id + 1]] =
      [this.GroupSettings[id+ 1], this.GroupSettings[id]];
    
  }

  if (this.wtg) {
    this.settingPositions = []
    console.log('tttt', this.settings);
    
    for (let i = 0; i < this.GroupSettings.length; i++) {
      const element = this.GroupSettings[i];
      this.settingPositions.push({uid:element.uid, position:i})
    }

    this.updateWtsPostitions()
  }
  }




}

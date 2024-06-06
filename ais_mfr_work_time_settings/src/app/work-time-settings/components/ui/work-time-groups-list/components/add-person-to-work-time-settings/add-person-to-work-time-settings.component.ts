import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Observable, map, startWith, switchMap } from 'rxjs';
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


@Component({
  selector: 'app-add-person-to-work-time-settings',
  templateUrl: './add-person-to-work-time-settings.component.html',
  styleUrls: ['./add-person-to-work-time-settings.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AddPersonToWorkTimeSettingsComponent implements  OnChanges, OnInit {
  constructor(
    private UserApi: UserApi,
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeSettingStorageService: WorkTimeSettingStorageService,
    private workTimeGroupsApi: WorkTimeGroupsApi,
    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private router:Router,


  ) {}


  @Input() wtg:WorkTimeGroup | null = null
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
      
      this._filterDivisions(data)
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


   this.filteredPersons = this.sortUsers(this.filteredPersons)

  }

  sortUsers(persons:Person[]){
    if (this.sortType === 'name') {
      persons.sort((a,b)=>{
        const isAsc = this.sortName.direction === 'asc';
        return this.compare(a.name, b.name, isAsc);
      })

      return Array.from(new Set([...this.checkedUsers,...persons]))
    }

    if (this.sortType === 'city') {
      persons.sort((a,b)=>{
        const isAsc = this.sortCity.direction === 'asc';
        return this.compare(a.city, b.city, isAsc);
      })

      return Array.from(new Set([...this.checkedUsers,...persons]))
    }

    persons.sort((a,b)=>{
      const isAsc = this.sortName.direction === 'asc';
      return this.compare(a.name, b.name, isAsc);
    })


      console.log('dd##', Array.from(new Set([...this.checkedUsers,...persons])));
      
    return Array.from(new Set([...this.checkedUsers,...persons]))

  }

  compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onDivisionChange(division:Division | null){
    console.log('ddd', division);
    
    this.selectedDivision = division
    this.divionInput.setValue(division?.name ?? '')
    this.filteredPersonsByDivision = []
    this.passageByDivisionTree(division)
    this.filteredPersons = this._filter(this.personsControl.value ?? '')
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wtg']) {

      
      if (this.wtg) {
        this.checkWtg(this.wtg)
        this.inputValue =this.wtg.title ;
      }
    }
  }

  onKeyDown(event:KeyboardEventInit, wts:WorkTimeSetting){
 
    
 
    if (event.key === 'Escape') {
      this.changedName = ''
    }
    if (event.key === 'Enter') {
      
      
      this.workTimeSettingsApi.updateTitleWorkTime({uid:wts.uid,title:this.settingValue,isGeneral:wts.isGeneral}).subscribe(data=>{
 
        this.changedName = ''
        const settingId = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
        this.GroupSettings[settingId].title =  this.settingValue
        this.onGroupSave.emit()
        this.cdr.markForCheck()
      })
    }
   
   }

   updateTitle(wts:WorkTimeSetting){
    this.workTimeSettingsApi.updateTitleWorkTime({uid:wts.uid,title:this.settingValue,isGeneral:wts.isGeneral}).subscribe(data=>{
 
      this.changedName = ''
      const settingId = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
      this.GroupSettings[settingId].title =  this.settingValue
      this.onGroupSave.emit()
      this.cdr.markForCheck()
    })
   }

  checkAll(){
  
    this.checkActive = true
   
  
  }

  copyWts(wts:WorkTimeSetting){

  
    console.log();
    console.log('dataaasdasda', wts);
    this.workTimeSettingsApi.copyWorkTimeSetting(wts).subscribe(data=>{
      console.log('dataa', data);
      
      if (!this.wtg) return
      const settings = [data, ...this.GroupSettings]
      this.workTimeGroupsApi.updateWorkTimeGroup({...this.wtg, workTimeSettings:settings}).subscribe(group=>{
        console.log('grr', group);
        this.onGroupSave.emit()
        this.GroupSettings = [...settings]
    
        this.cdr.markForCheck()
      })
 
      this.cdr.markForCheck()
    })
   }


   removeSetting(wts:WorkTimeSetting){
 
   
 const thisDialog = this.dialog.open(DeleteWorkTimeSettingsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:wts.uid, type:'Setting'},
      width: '448px',
    
    });

    thisDialog.afterClosed().subscribe(action=>{
  
      if (action === 'delete') {
        this.GroupSettings = [...this.GroupSettings.filter(el=>el.uid !== wts.uid)]
        this.onGroupSave.emit()
   

      }
      this.cdr.markForCheck()
    })

   }




  copySetting(){

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
      console.log('tttt', this.settings);
      
      for (let i = 0; i < this.GroupSettings.length; i++) {
        const element = this.GroupSettings[i];
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






  
  private _filter(value: string): Person[] {
    console.log('{{{[');
    
    const filterValue = value.toLowerCase();
    let persons = [...this.filteredPersonsByDivision]
    if (value !== '') {
      persons = this.filteredPersonsByDivision.filter((option) =>
      option.name?.toLowerCase().includes(filterValue) ||
      option.city?.toLowerCase().includes(filterValue)
    )
    }



  persons = this.sortUsers(persons)
  



  return  persons

      
  }

    
  private _filterDivisions(value: string) {
    console.log('{{{[', value);
    

    if (value !== '') {
      const filterValue = value.toLowerCase();
     return  this.fiteredDivisions = [...this.divisions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue))]
    }


  
    this.fiteredDivisions = [...this.divisions]
      
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


  deleteUserFromGroup(uid:string){
    if (!this.wtg)  return
    this.persons =  [...this.persons.filter(el=>el.keycloakUid !== uid)]
    this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(data=>{
      const newUsers = data.userIds.filter(el=>el !== uid )
      this.workTimeGroupsApi.updateWorkTimeGroup({...this.wtg, userIds:newUsers }).subscribe({next:(group)=>{
        this.onGroupSave.emit()
        this.onDivisionChange(this.selectedDivision)
        
    this.cdr.markForCheck()
    }})
    })
 

  

  }


  removeAllUsers(){
    if (!this.wtg )  return
    this.persons = [...this.persons.filter(elOne=>!this.checkedUsers.find(elTwo=>elTwo.keycloakUid == elOne.keycloakUid))]

    this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(data=>{
      const newUsers = data.userIds.filter(el=> !this.checkedUsers.find(elTwo=>elTwo.keycloakUid  === el) )
    
      this.checkedUsers = []
      this.workTimeGroupsApi.updateWorkTimeGroup({...this.wtg, userIds:newUsers }).subscribe({next:(group)=>{
        this.onGroupSave.emit()
        this.onDivisionChange(this.selectedDivision)
        
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

  checkWtg(wtg:WorkTimeGroup){
   this.chooseOption(1)
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


    this.isLoading = true
    this.isLoadingSettings = true
   
    this.UserApi.fetch().subscribe( async data => {

      
    this.persons = data.filter(el=>el.keycloakUid && wtg.userIds.includes(el.keycloakUid))

    
      this.filteredPersonsByDivision = [...this.persons]
      this.isLoading = false
 
      this.filteredPersons = [...this.persons]
      this.personsControl.valueChanges.subscribe((value)=>{
        this.filteredPersons = this._filter(value || '')
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

  goToSetting(uid:string){
    this.router.navigate([`ais_mfr_work_time_settings/work-time/${uid}/${moment().year()}`])
  }


  updateWtsPostitions(){
    this.workTimeGroupsApi.updateWorkTimeGroup({...this.checkedWtg, workTimeSettings:this.GroupSettings, settingPositions:this.settingPositions }).subscribe({next:(group)=>{
        console.log('ggg', group);
        
         
      if (this.checkedWtg) {
    
        
          this.updateWtsStorage(group,String(this.year))
        
      
      }
  
    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.onGroupSave.emit()
    this.cdr.markForCheck()
  },
complete:()=>{
  this.isUpdate = false
  this.cdr.markForCheck()
}
})
  }

  deleteFromGroup(){
    this.GroupSettings = this.GroupSettings.filter(el => !this.checkedSettings.find(checked=>checked.uid === el.uid))

    this.workTimeGroupsApi.updateWorkTimeGroup({...this.checkedWtg, workTimeSettings:this.GroupSettings }).subscribe({next:(group)=>{
      this.checkedSettings = []
         
      this.updateWtsStorage(group,String( moment().year()))
  
    this.snackBar.open(`рабочее время обновлено`, undefined,{
      duration: 2000
    }); 
    this.onGroupSave.emit()
    this.cdr.markForCheck()
  },
complete:()=>{
  this.isUpdate = false
  this.cdr.markForCheck()
}
})

  }

  updateWorkTimeSetting() {
  this.isUpdate = true
  this.workTimeGroups = [...this.workTimeGroups.map(el=>{
    if (this.checkedWtg && this.checkedWtg.uid !== el.uid) {
      return el
    }else{
      return {...el, userIds :Array.from(this.persons.map(el=>el.keycloakUid)) }
    }
   
    
  })]
  console.log('this.GroupSettings', this.GroupSettings);
  
   
    this.workTimeGroupsApi.updateWorkTimeGroup({...this.checkedWtg, userIds:Array.from(this.persons.map(el=>el.keycloakUid)) , workTimeSettings:this.GroupSettings, settingPositions:this.settingPositions, title:this.inputValue }).subscribe({next:(group)=>{
      
         
        if (this.checkedWtg) {
      
          
            this.updateWtsStorage(group,String( moment().year()))
          
        
        }
    
      this.snackBar.open(`рабочее время обновлено`, undefined,{
        duration: 2000
      }); 
      this.onGroupSave.emit()
      this.cdr.markForCheck()
    },
  complete:()=>{
    this.isUpdate = false
    this.cdr.markForCheck()
  }
})
  }

  close(){
 this.chooseOption(1)
this.onClose.emit()
  }

  updateWtsStorage(checkedGroup:WorkTimeGroup, year:string){

  
  
      this.workTimeSettingsApi
      .getWorkTimeGroupByUid(checkedGroup.uid,year)
      .subscribe((wts) => {
      
        
      if (!wts) {
        console.log('www', wts);
     this.workTimeSettingStorageService.clearTimeGroup()
     return 
      }
        
        this.workTimeSettingStorageService.setWorkTimeGroup(wts)
        //this.workTimeSetting = wts;


     
        this.cdr.markForCheck()
      });
   
  }

  upItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id > 0) {
      [this.GroupSettings[id], this.GroupSettings[id - 1]] =
      [this.GroupSettings[id- 1], this.GroupSettings[id]];
    }

  }

  downItem(wts:WorkTimeSetting){
    const id = this.GroupSettings.findIndex(el=>el.uid === wts.uid)
    if (id < this.GroupSettings.length - 1) {
      [this.GroupSettings[id], this.GroupSettings[id + 1]] =
      [this.GroupSettings[id+ 1], this.GroupSettings[id]];
    
  }
  }

  copyWtg(){
    if (!this.wtg) {
      return
    }

    
    this.workTimeGroupsApi.copyWorkTimeGroup(this.wtg).subscribe(data=>{
      console.log('workkk', data);
      
      this.onGroupCopy.emit()
      this.cdr.markForCheck()
    })
  }

  deleteWtg(){
   
    if (!this.wtg) {
      return
    }
 const thisDialog = this.dialog.open(DeleteWorkTimeGroupComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data: {uid:this.wtg.uid, type:'Group'},
      width: '448px',
    
    });

    thisDialog.afterClosed().subscribe(action=>{
    if (action == 'delete') {
      this.onGroupDelete.emit()
      this.cdr.markForCheck()
    }
  
    })

  }



}

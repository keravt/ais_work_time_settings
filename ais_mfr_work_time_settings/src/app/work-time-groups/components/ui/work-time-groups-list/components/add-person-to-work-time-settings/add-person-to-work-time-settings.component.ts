import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { UserApi } from 'src/app/work-time-groups/api/user.api';
import { WorkTimeGroupsApi } from 'src/app/work-time-groups/api/work-time-groups.api';
import { WorkTimeSettingsApi } from 'src/app/work-time-groups/api/work-time-settings.api';
import { Division } from 'src/app/work-time-groups/models/Division.model';
import { Person } from 'src/app/work-time-groups/models/Person.model';
import { WorkTimeGroup } from 'src/app/work-time-groups/models/WorkTimeGroup.model';
import { WorkTimeSetting } from 'src/app/work-time-groups/models/WorkTimeSetting.model';
import { WorkTimeSettingStorageService } from 'src/app/work-time-groups/services/work-time-setting-storage.service';


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
    private workTimeGroupsApi: WorkTimeGroupsApi,
    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef

  ) {}


  @Input() wtg:WorkTimeGroup | null = null
  @Output() onGroupSave = new EventEmitter()
  @Output() onClose = new EventEmitter()
  personsControl = new FormControl('');
  settingsControl = new FormControl('');
  persons: Person[] = [];
  settings:WorkTimeSetting[] = []
  userIds:Set<string> = new Set<string>()
  GroupSettings:WorkTimeSetting[] = []
  filteredPersons!: Person[];
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

  ngOnInit(): void {
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
  }

  passageByDivisionTree(division:Division | null){
    console.log('ff', division);
 

    if (division === null) {
      this.filteredPersonsByDivision = [...this.persons]

      return
       
     }
     this.filteredPersonsByDivision = [...this.filteredPersonsByDivision,...this.persons.filter(el=>el.treeDivisionId === division.id)]
 
     
 for (let i = 0; i < this.divisions.length; i++) {
  const el = this.divisions[i];
  if (el.parentDivisionId === division.id) {
    this.passageByDivisionTree(el)
   }
 }
   
 
  }

  onDivisionChange(division:Division | null){
    console.log('ddd', division);
    
    this.selectedDivision = division

    this.filteredPersonsByDivision = []
    this.passageByDivisionTree(division)
    this.filteredPersons = this._filter('', this.userIds)
    this.cdr.markForCheck()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wtg']) {

      
      if (this.wtg) {
        this.checkWtg(this.wtg)
      }
    }
  }

  checkAll(){
    console.log('this.filteredPersons', this.filteredPersons);
    
   this.userIds =  new Set( [...this.userIds,...[...this.filteredPersons.filter(el=>!this.lockedUsers.find(lock=>lock.userUid === el.keycloakUid))].map(el=>el.keycloakUid)])
  
  }


  
  private _filter(value: string, userIds:Set<string>): Person[] {
    console.log('{{{[');
    
    const filterValue = value.toLowerCase();
    let persons = [...this.filteredPersonsByDivision]
    if (value !== '') {
      persons = this.filteredPersonsByDivision.filter((option) =>
      option.name?.toLowerCase().includes(filterValue))
    }

  persons.sort((a, b)=>userIds.has(a.keycloakUid) ? -1 : 1)
  
  return persons
      
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


  userChecked(userUid: string) {
    if (this.userIds.has(userUid)) {
      this.userIds =new Set(Array.from(this.userIds).filter(uid => uid !== userUid)) 
    } else {
      this.userIds.add(userUid)
    }
    console.log(userUid);
    
  }

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.settings, event.previousIndex, event.currentIndex);
    
    if (this.wtg) {
      const settingPositions:{uid:string, position:number}[] = []
      for (let i = 0; i < this.settings.length; i++) {
        const element = this.settings[i];
        settingPositions.push({uid:element.uid, position:i})
        
      }
      
      this.workTimeGroupsApi.updateWorkTimeGroup({uid:this.wtg.uid, settingPositions}).subscribe()

      
    }
  }


  settingChecked(setting: WorkTimeSetting) {
    if (this.GroupSettings.find(el=>el.uid === setting.uid)) {
      this.GroupSettings = this.GroupSettings.filter(el => el.uid !== setting.uid)
    } else {
      this.GroupSettings.push(setting)
    }


  }

  checkWtg(wtg:WorkTimeGroup){
 
    this.GroupSettings = [...wtg.workTimeSettings]
    this.checkedWtg = wtg


    this.userIds =new Set([...wtg.userIds]) 
    this.isLoading = true
    this.isLoadingSettings = true
   
    this.UserApi.fetch().subscribe( async data => {

      
    this.persons = data.filter(el=>el.keycloakUid)
      this.filteredPersonsByDivision = [...this.persons]
      this.isLoading = false
 
      this.filteredPersons = [...this.persons]
      this.personsControl.valueChanges.subscribe((value)=>{
        this.filteredPersons = this._filter(value || '', this.userIds)
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

  updateWorkTimeSetting() {
  this.isUpdate = true
  this.workTimeGroups = [...this.workTimeGroups.map(el=>{
    if (this.checkedWtg && this.checkedWtg.uid !== el.uid) {
      return el
    }else{
      return {...el, userIds :Array.from(this.userIds) }
    }
   
    
  })]
  console.log('this.GroupSettings', this.GroupSettings);
  
   
    this.workTimeGroupsApi.updateWorkTimeGroup({...this.checkedWtg, userIds:Array.from(this.userIds) , workTimeSettings:this.GroupSettings}).subscribe({next:()=>{
            

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
this.onClose.emit()
  }


}

import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserApi } from 'src/app/work-time-settings/api/user.api';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { AllUsersComponent } from 'src/app/work-time-settings/components/modals/all-users/all-users.component';
import { WorkTimeInfoComponent } from 'src/app/work-time-settings/components/modals/work-time-info/work-time-info.component';
import { Division } from 'src/app/work-time-settings/models/Division.model';
import { Person } from 'src/app/work-time-settings/models/Person.model';
import { SortType } from 'src/app/work-time-settings/models/SortType.model';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { AllGroupsStorageService } from 'src/app/work-time-settings/services/all-groups-storage.service';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { GroupService } from 'src/app/work-time-settings/services/group.service';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonsComponent {


  constructor(

    private workTimeGroupsApi: WorkTimeGroupsApi,
    private UserApi: UserApi,
    private groupService:GroupService,

    private allGroupsStorageService:AllGroupsStorageService,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private allSettingsStorageService: AllSettingsStorageService,
    


  ) {}

  wtg:WorkTimeGroup | null =  null
  personsControl = new FormControl('');
  checkedUsers:Person[] = []
persons: Person[] = [];
  allPersons: Person[] = [];
filteredPersons: Person[] = [];
  filteredPersonsByDivision: Person[] = [];
lockedUsers:{userUid:string, groupName:string}[] = []
divisions:Division[] = []
fiteredDivisions:Division[] = []
divionInput = new FormControl()
selectedDivision:null | Division = null
inputValue = ''
sort:SortType = {active:'name', direction:''}
  allChecked = false

  isLoading = false


  ngOnInit(): void {

    this.personsControl.valueChanges.subscribe((value)=>{
      this.filteredPersons = this.groupService._filter(value || '',this.filteredPersonsByDivision,  this.checkedUsers, this.sort)
     });
  
    this.divionInput.valueChanges.subscribe(data=>{
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


  sortData(sort:any){
   if (sort.active === 'name') {
     this.sort.direction = sort.direction
     this.sort.active = 'name'
   }

   if (sort.active === 'city') {
    this.sort.direction= sort.direction
    this.sort.active = 'city'
  }


   this.filteredPersons = this.groupService.sortUsers(this.filteredPersons, this.checkedUsers, this.sort)

  }
  onDivisionChange(division:Division | null){
    console.log('ddd', division);
    
    this.selectedDivision = division
    this.divionInput.setValue(division?.name ?? '')
    this.filteredPersonsByDivision = []
    this.filteredPersonsByDivision =  this.groupService.passageByDivisionTree(division, this.filteredPersonsByDivision, this.persons,  this.divisions)
    this.filteredPersons = this.groupService._filter(this.personsControl.value ?? '', this.filteredPersonsByDivision,  this.checkedUsers, this.sort)
    this.cdr.markForCheck()
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
      this.allGroupsStorageService.setAllGroups(this.allGroupsStorageService.getAllGroups()[0])
      this.cdr.markForCheck()

     })
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


  async checkWtg(wtg:WorkTimeGroup){
   
    //this.workTimeSettingStorageService.setWorkTimeGroupId(wtg.uid)

    this.checkedUsers = []
     this.isLoading = true
   
    
 
 
       
     this.persons = [...this.allPersons.filter(el=>el.keycloakUid && wtg.userIds.includes(el.keycloakUid))]
 
     
       this.filteredPersonsByDivision = [...this.persons]
       this.isLoading = false
  
       this.filteredPersons = [...this.persons]

 
         this.onDivisionChange(this.selectedDivision)
         this.cdr.markForCheck()
     
 
 
 
 
   }

async removeAllUsers(){
    const {persons, checkedUsers} = await this.groupService.removeAllUsers(this.wtg, this.persons, this.checkedUsers)
    this.persons = persons
    this.checkedUsers = checkedUsers
    this.allGroupsStorageService.setAllGroups(this.allGroupsStorageService.getAllGroups()[0])
    this.onDivisionChange(this.selectedDivision)
    this.allChecked = false
    this.cdr.markForCheck()

  }
}

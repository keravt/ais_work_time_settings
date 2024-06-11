import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserApi } from 'src/app/work-time-settings/api/user.api';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { Division } from 'src/app/work-time-settings/models/Division.model';
import { Person } from 'src/app/work-time-settings/models/Person.model';
import { AllSettingsComponent } from '../../ui/work-time-groups-list/components/all-settings/all-settings.component';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';
import { Subject, takeUntil } from 'rxjs';
import { isSetting } from 'src/app/work-time-settings/guards/isSetting';
import { AllGroupsStorageService } from 'src/app/work-time-settings/services/all-groups-storage.service';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllUsersComponent implements OnInit {


  constructor(
    private UserApi: UserApi,
    private workTimeGroupsApi:WorkTimeGroupsApi,
    private cdr:ChangeDetectorRef,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private historyGroupService:     HistoryGroupService,
    private allGroupsStorageService: AllGroupsStorageService,
    private allSettingsStorageService: AllSettingsStorageService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AllUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public wtg: WorkTimeGroup,
  ) {}
  

  personsControl = new FormControl('');
  persons: Person[] = [];
   filteredPersons: Person[] = [];
    filteredPersonsByDivision: Person[] = [];
    @Output() onChange = new EventEmitter()
    divisions:Division[] = []
    fiteredDivisions:Division[] = []
    divionInput = new FormControl()
    selectedDivision:null | Division = null
    sortName = {active: 'name', direction: ''}
    sortCity = {active: 'city', direction: ''}
    sortType = 'name'
    checkActive = false
    isLoading = false
    allUsersInGroups:string[] = []
    checkedUsers:Person[] = []
    allPersons:Person[]= []
    allChecked = false
    undoActive:boolean = false
    redoActive:boolean = false

    private destroy$ = new Subject<void>();

    ngOnDestroy(): void {
       this.destroy$.next();
       this.destroy$.complete();
     }
  
  


      

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

      this.workTimeGroupsApi.getWorkTimeGroups().subscribe(data=>{
        for(const el of data){
          this.allUsersInGroups = [...this.allUsersInGroups, ...el.userIds]
        }
       
        this.UserApi.fetch().subscribe( async data => {

          this.allPersons = data.filter(el=>el.keycloakUid && el.status !== 'Уволен')
          this.persons = data.filter(el=>el.keycloakUid && !this.allUsersInGroups.includes(el.keycloakUid) && el.status !== 'Уволен')
           console.log('dddd', this.persons.filter(el=>el.name?.includes('фара')));
           
          
            this.filteredPersonsByDivision = [...this.persons]
            this.isLoading = false
       
            this.filteredPersons = [...this.persons]
            this.personsControl.valueChanges.subscribe((value)=>{
              this.filteredPersons = this._filter(value || '')
             });
              this.onDivisionChange(this.selectedDivision)
              this.cdr.markForCheck()
          });
      })

      this.checkedGroupStorageService.checkedGroup$.subscribe(group=>{
        this.allUsersInGroups = []
        this.workTimeGroupsApi.getWorkTimeGroups().subscribe(data=>{
          for(const el of data){
            this.allUsersInGroups = [...this.allUsersInGroups, ...el.userIds]
          }
          
          this.UserApi.fetch().subscribe( async data => {
  
            this.allPersons = data.filter(el=>el.keycloakUid && el.status !== 'Уволен' && el.status !== 'Увольнение' )
            this.persons = data.filter(el=>el.keycloakUid && !this.allUsersInGroups.includes(el.keycloakUid) && el.status !== 'Уволен' && el.status !== 'Увольнение')
    
    
              this.filteredPersonsByDivision = [...this.persons]
              this.isLoading = false
         
              this.filteredPersons = [...this.persons]
              this.personsControl.valueChanges.subscribe((value)=>{
                this.filteredPersons = this._filter(value || '')
               });
                this.onDivisionChange(this.selectedDivision)
                this.cdr.markForCheck()
            });
        })
        this.cdr.markForCheck()
 
      })


      this.historyGroupService.undoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
   
          
        this.undoActive = data.length === 0 ? false : true
        this.cdr.markForCheck()
      })
  
  
      this.historyGroupService.redoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
        this.redoActive = data.length === 0 ? false : true
        this.cdr.markForCheck()
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


    checkAllUsers(){
      this.checkedUsers = Array.from(new Set([...this.checkedUsers, ...this.filteredPersons]))
      this.allChecked = true
    }
  
    uncheckAllUsers(){
      this.checkedUsers = []
      this.allChecked = false
    }


    userChecked(person: Person) {
      if (this.checkedUsers.find(el=>el.keycloakUid === person.keycloakUid)) {
        this.checkedUsers = this.checkedUsers.filter(el => el.keycloakUid !== person.keycloakUid)
      } else {
        this.checkedUsers = [...this.checkedUsers,person]
      }
  
      
    }


    checkUser(uid:string){
      this.persons = [...this.persons.filter(el=>el.keycloakUid !== uid)]
      this.onDivisionChange(this.selectedDivision)
      this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(data=>{
        this.workTimeGroupsApi.updateWorkTimeGroup({...data, userIds:[...data.userIds,uid ] }).subscribe({next:(group)=>{
          this.snackBar.open(`рабочее время обновлено`, undefined,{
            duration: 2000
          }); 
          this.onChange.emit()
          
      }
      
      })
      })
      

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

    private _filterDivisions(value: string) {
      console.log('{{{[', value);
      
  
      if (value !== '') {
        const filterValue = value.toLowerCase();
       return  this.fiteredDivisions = [...this.divisions.filter((option) =>
        option.name?.toLowerCase().includes(filterValue))]
      }
  
  
    
      this.fiteredDivisions = [...this.divisions]
        
    }


    addAllUsers(){

      this.persons = [...this.persons.filter(elOne=>!this.checkedUsers.find(elTwo=>elTwo.keycloakUid == elOne.keycloakUid))]
 

      this.workTimeGroupsApi.getWorkTimeGroupById(this.wtg.uid).subscribe(data=>{
        this.workTimeGroupsApi.updateWorkTimeGroup({...data, userIds:[...data.userIds, ...this.checkedUsers.map(el=>el.keycloakUid) ] }).subscribe({next:(group)=>{

          this.historyGroupService.setUndoArray(group)
          this.historyGroupService.redoArray$.next([])
          this.checkedUsers = []
          this.snackBar.open(`группа обновлена`, undefined,{
            duration: 2000
          }); 
          this.onChange.emit()
          this.allChecked = false
          this.onDivisionChange(this.selectedDivision)
      }
      
      })
      })
      

    }


    close(){
      this.dialogRef.close()
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

  

        return  Array.from(new Set([...this.checkedUsers,...persons]))
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
  
      return Array.from(new Set([...this.checkedUsers,...persons]))
  
    }
  
    compare(a: any, b: any, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  
    onDivisionChange(division:Division | null){

      
      this.selectedDivision = division
      this.divionInput.setValue(division?.name ?? '')
      this.filteredPersonsByDivision = []
      this.passageByDivisionTree(division)

      this.filteredPersons = this._filter(this.personsControl.value  ?? '')
      this.cdr.markForCheck()
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
    

    return  Array.from(persons) 
  
        
    }
  
}

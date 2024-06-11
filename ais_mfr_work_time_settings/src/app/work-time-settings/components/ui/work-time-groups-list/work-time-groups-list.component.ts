import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, fromEvent, map, takeUntil } from 'rxjs';
import { WorkTimeGroupsApi } from '../../../api/work-time-groups.api';
import { WorkTimeGroup } from '../../../models/WorkTimeGroup.model';
import { Sort } from 'src/app/work-time-settings/models/sort.model';
import { MatDialog } from '@angular/material/dialog';
import { FilterDropdownComponent } from '../filter-dropdown/filter-dropdown.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {Sort as matSort, MatSortModule} from '@angular/material/sort';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { UserApi } from 'src/app/work-time-settings/api/user.api';
import { Person } from 'src/app/work-time-settings/models/Person.model';
import { DOCUMENT } from '@angular/common';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { isSetting } from 'src/app/work-time-settings/guards/isSetting';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';
import { AllGroupsStorageService } from 'src/app/work-time-settings/services/all-groups-storage.service';
@Component({
  selector: 'app-work-time-groups',
  templateUrl: './work-time-groups-list.component.html',
  styleUrls: ['./work-time-groups-list.component.scss'],
  styles:['{flex:1 1 auto}']
})
export class WorkTimeGroupsListComponent implements OnInit {
   
  isGroupCreator:boolean = false
  sort:Sort = 'none'
  checkedGroup!:WorkTimeGroup 
  opened:boolean = false
  workTimesGroups:  Observable<WorkTimeGroup[]> =
  this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  allWorkTimeGroups:WorkTimeGroup[] = []
  filterData:{filterType:string, filterValue:string}  = {filterType:'', filterValue:''}
  sortDirect:matSort = {active:'', direction:''}
  lengthOfSortedWtg = 0
  allSearch = ''
  previewVisible = false
  allPersons:Person[] = []
  wtsId:string | null =  null
  undoActive:boolean = false
  redoActive:boolean = false

  @ViewChild('filtr',{read: ElementRef}) filtrIcon!:ElementRef<HTMLElement>
  constructor(
    private workTimeGroupService:WorkTimeGroupsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private userApi:UserApi,
    private historyGroupService:HistoryGroupService,
    private allGroupsStorageService:AllGroupsStorageService,
    private dialog:MatDialog,
    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef,
    private checkedGroupStorageService:CheckedGroupStorageService,
    private allSettingsStorageService:AllSettingsStorageService,

    @Inject(DOCUMENT) private document: Document,
    
  ) {}

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }


  ngOnInit(): void {
    this.workTimeGroupService.getWorkTimeGroups().subscribe(data=>{
      this.allWorkTimeGroups = data
      data.length !== 0 && (this.checkedGroup = data[data.length - 1])
    })

    this.workTimeSettingStorageService.workTimeSettingId$.subscribe(data=>{
      this.wtsId = data
    })

    this.userApi.fetch().subscribe( async data => {

      this.allPersons = data.filter(el=>el.keycloakUid)

      

      });

      fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (event) => {
          
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
          if (event.shiftKey ) {
            if (!this.redoActive) {
              return
            }
        
          const data =  await this.historyGroupService.onRedoChange()
    
           this.workTimesGroups =
           this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
           if (!isSetting(data[0].obj)) {
            this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
           }else{
            this.allSettingsStorageService.setAllSettings(data[0].obj)
           }
         
              this.snackBar.open(`изменение группы`, undefined,{
                duration: 2000
              }); 
             
  
            return
          }
      
           
          if (!this.undoActive) {
            return
          }
  
          const data = await this.historyGroupService.onUndoChange()

          this.workTimesGroups =
          this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
          if (!isSetting(data[0].obj)) {
            this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
          }else{
            this.allSettingsStorageService.setAllSettings(data[0].obj)
           }

            this.snackBar.open(`изменение группы `, undefined,{
              duration: 2000
            }); 
  
  
  
        }
        this.cdr.markForCheck()
      });


      this.historyGroupService.undoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
 
        
        this.undoActive = data.length === 0 ? false : true
        this.cdr.markForCheck()
      })
  
  
      this.historyGroupService.redoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
        this.redoActive = data.length === 0 ? false : true
        this.cdr.markForCheck()
      })

      this.allGroupsStorageService.AllGroups$.subscribe(group=>{
        this.workTimesGroups =
        this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
      })
    
  }

  async undo(){

    const data = await this.historyGroupService.onUndoChange()
    console.log('data[0].obj', data[0].obj);
    
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
    if (!isSetting(data[0].obj)) {
      this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
    }else{
      this.allSettingsStorageService.setAllSettings(data[0].obj)
     }
  
     this.snackBar.open(`изменение группы `, undefined,{
      duration: 2000
    }); 
  }


  async redo(){


    const data =  await this.historyGroupService.onRedoChange()
  this.workTimesGroups =
  this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  if (!isSetting(data[0].obj)) {
    this.checkedGroupStorageService.setCheckedGroup(data[0].obj)
  }else{
    this.allSettingsStorageService.setAllSettings(data[0].obj)
   }

  this.snackBar.open(`изменение группы `, undefined,{
    duration: 2000
  }); 
  }



  sortGroup(sort:matSort){
    console.log('dadawd', sort);
    
    this.sortDirect = sort

    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  }

  changePreviewVisible(bool:boolean){
    this.previewVisible = bool
  }

  sortWorkTimesGroups(groups:WorkTimeGroup[]){

  let filtrGroups = this.filterGroups(this.filterData,groups)
  
  if(this.allSearch !== ''){
    const search = this.allSearch.toLowerCase()
    filtrGroups = [...filtrGroups.filter(group=>{
      const title = group.title.toLowerCase()
      const persons = [...this.allPersons.filter(person=>group.userIds.find(uid=>person.keycloakUid === uid))]
      const isPersonInGroup = persons.find(person=>person.name?.toLowerCase()?.includes(search) ?? false)
      return title.includes(search) || isPersonInGroup
    })]
  }

  this.lengthOfSortedWtg = filtrGroups.length
  if (this.sortDirect.active = '') {
    return filtrGroups.sort((a, b)=>a.created_at.valueOf() - b.created_at.valueOf())
  }
return filtrGroups.sort((a, b)=>{
  const isAsc = this.sortDirect.direction === 'asc';
  return this.compare(a.title, b.title, isAsc);
})
  }
  
  onAllFiltrChange(){

    
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  }
 


  addCopySettings(){

    this.workTimesGroups = this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)))

  }

  checkGroup(wtg:WorkTimeGroup){
    this.checkedGroupStorageService.setCheckedGroup(wtg)
    this.checkedGroup = wtg
    this.opened = true
  }

  closeAddPerson(){
    this.previewVisible = false
    this.opened = false
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  changeGroupCreator(bool:boolean){
    this.isGroupCreator = bool
  }

  openFiltrModal(){

   const height = this.filtrIcon.nativeElement.getBoundingClientRect().height
   const width = this.filtrIcon.nativeElement.getBoundingClientRect().width
   const left = this.filtrIcon.nativeElement.getBoundingClientRect().left - 112 + (width /4)
   const top = this.filtrIcon.nativeElement.getBoundingClientRect().top + height
   
    const dialogRef = this.dialog.open(FilterDropdownComponent, {
      minWidth: '448px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:this.filterData,
      position:{
        top:`${top}px`,
        left:`${left}px`}
 
    });
      dialogRef.componentInstance.applyFilter.subscribe(result => {
        this.filterData = result
        this.workTimesGroups =  this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  });
  }




  resetFilters(){
    this.filterData  = {filterType:'', filterValue:''}
    this.workTimesGroups = this.workTimesGroups.pipe(map(groups => this.sortWorkTimesGroups(groups)));
  }


  filtrGroups(){
    this.opened = false
    this.workTimesGroups = this.workTimesGroups.pipe(map(groups => this.sortWorkTimesGroups(groups)));
   
  }

  onSortChange(){
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  }
   

  updateItem(){
        
        
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
  }


  filterGroups(result: {filterValue: string; filterType: string;}, wtg: WorkTimeGroup[]): WorkTimeGroup[] {
    if (result.filterValue === '') {
      return wtg
    }
    switch (result.filterType) {
      case 'contains':
        return wtg.filter(group => group.title.toLowerCase().includes(result.filterValue.toLowerCase()));
      case 'notContains':
        return wtg.filter(group => !group.title.toLowerCase().includes(result.filterValue.toLowerCase()));
      case 'startsWith':
        return wtg.filter(group => group.title.toLowerCase().startsWith(result.filterValue.toLowerCase()));
      case 'endsWith':
        return wtg.filter(group => group.title.toLowerCase().endsWith(result.filterValue.toLowerCase()));
      case 'equals':
        return wtg.filter(group => group.title.toLowerCase() === result.filterValue.toLowerCase());
      case 'notEquals':
        return wtg.filter(group => group.title.toLowerCase() !== result.filterValue.toLowerCase());
      default:
        return wtg;
    }
  }


  onCreateGroup(){
    this.workTimesGroups =
    this.workTimeGroupService.getWorkTimeGroups().pipe(map(groups => this.sortWorkTimesGroups(groups)));
    this.isGroupCreator = false
  }

     

}

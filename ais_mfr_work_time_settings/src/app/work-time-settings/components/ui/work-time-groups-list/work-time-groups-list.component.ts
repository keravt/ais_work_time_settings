import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WorkTimeGroupsApi } from '../../../api/work-time-groups.api';
import { WorkTimeGroup } from '../../../models/WorkTimeGroup.model';
import { Sort } from 'src/app/work-time-settings/models/sort.model';
import { MatDialog } from '@angular/material/dialog';
import { FilterDropdownComponent } from '../filter-dropdown/filter-dropdown.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {Sort as matSort, MatSortModule} from '@angular/material/sort';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
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
  wtsId:string | null =  null
  @ViewChild('filtr',{read: ElementRef}) filtrIcon!:ElementRef<HTMLElement>
  constructor(
    private workTimeGroupService:WorkTimeGroupsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private dialog:MatDialog
    
  ) {}
  ngOnInit(): void {
    this.workTimeGroupService.getWorkTimeGroups().subscribe(data=>{
      this.allWorkTimeGroups = data
      data.length !== 0 && (this.checkedGroup = data[data.length - 1])
    })

    this.workTimeSettingStorageService.workTimeSettingId$.subscribe(data=>{
      this.wtsId = data
    })
    
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
    filtrGroups = [...filtrGroups.filter(group=>group.title.includes(this.allSearch))]
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

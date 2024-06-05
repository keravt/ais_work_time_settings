import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { Observable, map, tap } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { Sort } from 'src/app/work-time-settings/models/sort.model';
import {Sort as matSort} from '@angular/material/sort';
import { FilterDropdownComponent } from '../filter-dropdown/filter-dropdown.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';



@Component({
  selector: 'app-work-time-settings-list',
  templateUrl: './work-time-settings-list.component.html',
  styleUrls: ['./work-time-settings-list.component.scss'],
})
export class WorkTimeSettingsListComponent   {
  constructor(
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr:ChangeDetectorRef
  ) {}
 

  ngOnInit(): void {
    this.workTimeSettingsApi.getWorkTimeSettings().subscribe(data=>{
      this.allWorkTimeSettings =data
      data.length !== 0 && (this.checkedSetting = data[0])
    })
    
  }

  showSettingCreator = false

  newSettingTitle = new FormControl('');
  isGeneral = false
  sortDirect:matSort = {active:'', direction:''}
  changedName:boolean = false
  sort:Sort = 'none'
  checkedSetting!:WorkTimeSetting
  opened = false
  allSearch = ''
  previewVisible = false
  allWorkTimeSettings:WorkTimeSetting[] = []
  filterData:{filterType:string, filterValue:string}  = {filterType:'', filterValue:''}
  lengthOfSortedWtg = 0
  workTimesSettings:  Observable<WorkTimeSetting[]> =
  this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  @ViewChild('filtr',{read: ElementRef}) filtrIcon!:ElementRef<HTMLElement>

  closeSettingCreate(){
    this.showSettingCreator = false
  }

 
  checkSetting(wts:WorkTimeSetting){
    this.checkedSetting = wts
    this.opened = true
  }
  
  onSortChange(){
    console.log('sort', this.sort);
    
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }
   

  

  backClicked() {
    this.router.navigate([`../../week/${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()}`], { relativeTo: this.route });
  }

  resetFilters(){
    this.filterData  = {filterType:'', filterValue:''}
    this.workTimesSettings =this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }
  

  onAllFiltrChange(){

    
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }

  filtrSettings(){
    this.workTimesSettings = this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }

  addCopySettings(){

    
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
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
         this.workTimesSettings =this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)));
   });
   }



  changeName(){
    this.changedName = true


  }

  updateItem(){
        
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }

  sortSetting(sort:matSort){
    console.log('dadawd', sort);
    
    this.sortDirect = sort

    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
  }

  sortWorkTimesSettings(groups:WorkTimeSetting[]){

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

    compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    filterGroups(result: {filterValue: string; filterType: string;}, wtg: WorkTimeSetting[]): WorkTimeSetting[] {
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
 

  showSettingCreate(){
    this.showSettingCreator = true

  }

  createWorkTimeSetting() {
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings().pipe(map(groups => this.sortWorkTimesSettings(groups)))
    this.showSettingCreator = false
  }

  close(){
    this.previewVisible = false
    this.opened = false
  }


  changePreviewVisible(bool:boolean){
    this.previewVisible = bool
  }

}

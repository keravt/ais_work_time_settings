import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment-timezone';

import { DOCUMENT } from '@angular/common';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { HistoryService } from 'src/app/work-time-settings/services/history.service';
import { Result } from 'src/app/work-time-settings/models/Result.model';


@Component({
  selector: 'app-work-time-settings',
  templateUrl: './work-time-settings.component.html',
  styleUrls: ['./work-time-settings.component.scss'],
})
export class WorkTimeSettingsComponent implements OnInit{

  workTimeSetting!: WorkTimeSetting;
  opened = false;
  selectedDate!: any;
  isLoading = false
  result:any = null
  inputValue:string = ''
  today:Date =  new Date()
  activeDate:{year:number,month:number,day:number} = {year:this.today.getFullYear(), month:this.today.getMonth() + 1,day:this.today.getDate()} 
  currentDate:{year:number,month:number,day:number} = {year:this.today.getFullYear(), month:this.today.getMonth() + 1,day:this.today.getDate()} 
  changedName:boolean = false
  startDate:{year:number,month:number} = {year:new Date().getFullYear(), month:1}

  constructor(
    private route: ActivatedRoute,
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    public dialog: MatDialog,
    public historyService:HistoryService,
    private router: Router,
    private cdr:ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {

    this.historyService.undoArray$.next([])
    this.historyService.redoArray$.next([])
    this.isLoading = true
    const { uid,year } = this.route.snapshot.params;
     console.log('this.startDate', this.startDate);
     this.startDate.year = +year
     this.route.params.subscribe((data)=>{
      const year = data['year']

   
      this.workTimeSettingsApi
      .getWorkTimeSettingByUid(uid,year)
      .subscribe((wts) => {
        this.workTimeSettingStorageService.setWorkTimeSetting(wts)
        //this.workTimeSetting = wts;

        this.inputValue = this.workTimeSetting.title
        this.isLoading = false
        this.cdr.markForCheck()
      });
      this.cdr.markForCheck()
     })

   this.workTimeSettingStorageService.workTimeSetting$.subscribe(data=>{
    if (data) {

      const workTime = data.workTimes.find(el=>moment(el.day).hours(0).valueOf() === moment({...this.activeDate, month:this.activeDate.month}).valueOf())
          if (this.result ) {

            console.log();
            
            this.onClickDate({...this.result, uid:workTime?.uid}, this.selectedDate)
            
          }
        
      
      this.workTimeSetting = data
    }
    this.cdr.markForCheck()
   })

  }

  






  







  onDblclick(){
    this.changedName =  true
  }

  onKeyDown(event:KeyboardEventInit){
    if (event.key === 'Enter') {
      console.log(';;;;;;;;;');
      
      this.workTimeSettingsApi.updateTitleWorkTime({uid:this.workTimeSetting.uid,title:this.inputValue,isGeneral:this.workTimeSetting.isGeneral}).subscribe(data=>{
        this.changedName = false
        this.workTimeSetting.title = this.inputValue
        this.cdr.markForCheck()
      })
    }
   
   }


numberToNgbDate(num: number): NgbDateStruct {
  const date = new Date(num); // Assuming num is a timestamp
  return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}


  onClickDate( result:Result, date:NgbDateStruct){
    if (!this.opened) {
      this.opened = true;
    }
    this.selectedDate = date

    this.activeDate = date
  

    
    this.result = {...result}
    console.log('resss', result);
    
    }

 
  
  
   
  closeSideNav() {
    this.opened = false;
  }

  onPrevYear(){
    const { uid } = this.route.snapshot.params;
    this.startDate = {...this.startDate, year:this.startDate.year - 1}
    this.router.navigate(["ais_mfr_work_time_settings", "settings", "work-time", uid,this.startDate.year])

  }

  updateWorkTimes(wts: WorkTimeSetting){
    this.workTimeSettingStorageService.setWorkTimeSetting(wts)
    //this.workTimeSetting = wts;
  }
  
  onNextYear(){
    const { uid } = this.route.snapshot.params;
    this.startDate = {...this.startDate, year:this.startDate.year + 1}
    this.router.navigate(["ais_mfr_work_time_settings", "settings", "work-time", uid,this.startDate.year])
  }




  
  backClicked() {
    this.router.navigate(["../../"], {relativeTo: this.route  })
  }
}

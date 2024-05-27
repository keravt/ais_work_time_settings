import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { Result } from 'src/app/work-time-settings/models/Result.model';
import { WorkTimeModel } from 'src/app/work-time-settings/models/WorkTime.model';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';


@Component({
  selector: 'app-work-time-group-preview',
  templateUrl: './work-time-group-preview.component.html',
  styleUrls: ['./work-time-group-preview.component.scss']
})
export class WorkTimeGroupPreviewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private cdr:ChangeDetectorRef
  ) {}
  startDate:{year:number,month:number} = {year:new Date().getFullYear(), month:1}
  isLoading = false
  workTimes: WorkTimeModel[]  = [];
  workTimeSetting!: WorkTimeSetting;
  opened = false;
  selectedDate!: any;
  result:any = null
  inputValue:string = ''
  today:Date =  new Date()
  activeDate:{year:number,month:number,day:number} = {year:this.today.getFullYear(), month:this.today.getMonth() + 1,day:this.today.getDate()} 
  changedName:boolean = false


  ngOnInit(): void {
    this.route.params.subscribe((data)=>{

    this.isLoading = true
    const { uid,year } = this.route.snapshot.params;
  
      this.workTimeSettingsApi
      .getWorkTimeGroupByUid(uid,year)
      .subscribe((wts) => {
      if (!wts) {
        return  this.workTimes = []
      }
        
        this.workTimeSettingStorageService.setWorkTimeSetting(wts)
        //this.workTimeSetting = wts;

        this.isLoading = false
     
        this.cdr.markForCheck()
      });
      this.cdr.markForCheck()
     })

     this.workTimeSettingStorageService.workTimeSetting$.subscribe(data=>{
      if (data) {
        this.workTimes = data.workTimes
      }
      this.cdr.markForCheck()
     })
  }

  onPrevYear(){
    const { uid } = this.route.snapshot.params;
    this.startDate = {...this.startDate, year:this.startDate.year - 1}
    this.router.navigate(["ais_mfr_work_time_settings", "settings", "work-time-groups",uid,this.startDate.year])

  }
  onNextYear(){
    const { uid } = this.route.snapshot.params;
    this.startDate = {...this.startDate, year:this.startDate.year + 1}
    this.router.navigate(["ais_mfr_work_time_settings", "settings", "work-time-groups",uid, this.startDate.year])
  }

  backClicked() {
    this.router.navigate(["../../"], {relativeTo: this.route  })
  }


  onClickDate(event:MouseEvent, result:Result, date:NgbDateStruct){
    if (!this.opened) {
      this.opened = true;
    }
    this.selectedDate = date

    this.activeDate = date
  
    console.log('resss', result);
    
    this.result = result
  
    
    }

    setClass = (date:{year:number, month:number,day:number},result:any,activeDate:{year:number, month:number,day:number}=this.activeDate)=>{

    
   
      const id = result ? result.uid : false
  
      const ppp = {
        'active':date.year === activeDate.year && date.month === activeDate.month && date.day === activeDate.day,
        'activeResult':id && date.year === activeDate.year && date.month === activeDate.month && date.day === activeDate.day}
  
        
        return ppp
     }
     

    closeSideNav() {
      this.opened = false;
    }
}

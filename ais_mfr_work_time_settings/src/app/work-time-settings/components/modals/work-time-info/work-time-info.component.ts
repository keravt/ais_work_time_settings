import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeModel } from 'src/app/work-time-settings/models/WorkTime.model';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';

@Component({
  selector: 'app-work-time-info',
  templateUrl: './work-time-info.component.html',
  styleUrls: ['./work-time-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkTimeInfoComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public wtg: WorkTimeGroup,
    private dialogRef: MatDialogRef<WorkTimeInfoComponent>,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private cdr:ChangeDetectorRef
  ){}
  ngOnInit(): void {

    this.getInfo(this.wtg,String(moment().year()))
  }

  isLoading = false
  workTimes:WorkTimeModel[] = []
   months:any[] = []

   getInfo(checkedGroup:WorkTimeGroup, year:string){
    this.isLoading = true
  
  
      this.workTimeSettingsApi
      .getWorkTimeGroupByUid(checkedGroup.uid,year)
      .subscribe((wts) => {
      if (!wts) {
        return  this.workTimes = []
      }
        
      this.workTimes = wts.workTimes
 
      
       for (let i = 0; i < 12; i++) {
      
        const el = i;
        const start = moment({year:+year, month:el,date:15}).startOf('month').valueOf()
        const end = moment({year:+year, month:el,date:15}).endOf('month').valueOf()
       
        
        const monthData:WorkTimeModel[] = [...this.workTimes.filter(workTime=>
          workTime.day >= start &&  
          workTime.day <= end
        )]

        const monthDateTwo:WorkTimeModel[] = []
        
        for(const date of monthData){
          if (!monthDateTwo.find(el=>moment(el.day).date() === moment(date.day).date())) {
            monthDateTwo.push(date)
          }
        }
   
        const workDays = [...monthDateTwo.filter(el=>!el.isHoliday)]
        const hollidays = [...monthDateTwo.filter(el=>el.isHoliday)]
        const workHours = workDays.reduce((prev:number, current:WorkTimeModel)=>{
          let currentHours = 0

          for(const time of current.workTime){
           const statTime  =  moment(time.start, "HH:mm").valueOf();
           const endTime  =  moment(time.end, "HH:mm").valueOf();
           currentHours+= endTime - statTime
          }

          return prev + currentHours
      
        },0) / 3600000 
        const monthName = moment({year:+year, month:el,date:15}).locale('ru').format('MMMM')
        
        const data = {
          'monthName':monthName,
          'calendarDays':monthDateTwo.length,
          'workDays':workDays.length,
          'hollidays':hollidays.length,
          'workHours':workHours
        }

        this.months.push(data)
       }
       

        this.isLoading = false
     
        this.cdr.markForCheck()
      });
      this.cdr.markForCheck()
  }

  close(){
    this.dialogRef.close()
  }
}

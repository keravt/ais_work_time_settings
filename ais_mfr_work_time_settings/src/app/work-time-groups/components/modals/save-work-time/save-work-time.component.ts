import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeSchema } from 'src/app/work-time-groups/models/TimeSchema.model';
import { UpdateWorkTimeType } from 'src/app/work-time-groups/models/UpdateWorkTimeType.model';
import { WorkTimeModel } from 'src/app/work-time-groups/models/WorkTime.model';
import { HistoryService } from 'src/app/work-time-groups/services/history.service';
import { SideBarService } from 'src/app/work-time-groups/services/side-bar.service';



@Component({
  selector: 'app-save-work-time',
  templateUrl: './save-work-time.component.html',
  styleUrls: ['./save-work-time.component.scss']
})
export class SaveWorkTimeComponent  implements  OnInit{

  constructor(
    private dialogRef: MatDialogRef<SaveWorkTimeComponent>,
    private sideBarService:SideBarService,
    public historyService:HistoryService,
    @Inject(MAT_DIALOG_DATA) public data: {    
      beforeReccurence:string,
      changeReccurence:boolean,
      isHoliday : boolean,
      workTimeName:string,
      holidayColor : string,
      workTimes : TimeSchema[] | [],
      currentDate:number,
      workTime:WorkTimeModel,
      uid:string,
      year:string,
      never:boolean,
      showRepeatMenu:boolean
    },
    ){}


  ngOnInit(): void {
    console.log('currentDate', this.data.currentDate, this.data.workTime.day);
    if (this.data.currentDate === this.data.workTime.day) {
      this.aloowNext = false
      if (!this.data.changeReccurence) {
        this.type = 'all'
      }
    }
  }

  

    
  type:UpdateWorkTimeType = this.data.changeReccurence ? 'one' : 'next'
  aloowNext:boolean = true


  async saveWorkTime(){
    await this.sideBarService.createWorkTime(
      this.data.beforeReccurence,
      this.data.changeReccurence,
      this.data.workTime,
      this.data.currentDate,
      this.type,
      this.data.uid,
      this.data.year,
      this.data.isHoliday,
      this.data.holidayColor,
      this.data.workTimes,
      this.data.workTimeName,
      this.data.never,
      {noRepeat:!this.data.showRepeatMenu, date:this.data.currentDate,})

      this.closeDialog()
   
  }

  closeDialog(){
    this.dialogRef.close()
  }
}

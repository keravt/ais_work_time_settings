import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import * as moment from 'moment';
import { times } from 'src/app/work-time-settings/data/times';
import { TimeSchema } from 'src/app/work-time-settings/models/TimeSchema.model';



@Component({
  selector: 'app-time-period',
  templateUrl: './time-period.component.html',
  styleUrls: ['./time-period.component.scss']
})
export class TimePeriodComponent  implements OnInit{

  @Input() today!: number
  @Input() workTime!: TimeSchema
  @Output() onTimeChange: EventEmitter<{start:moment.Moment,end:moment.Moment}> = new EventEmitter();
  @Output() onTimeDelete = new EventEmitter();
  @Input() canDelete:boolean = false
  times = times

  timesStart = times.slice(0,-1)
  timesEnd = times.slice(1)
  startt = '00:00'
  endd = '00:30'
  @Input() viewColor:boolean = true
  workTimeMoment:{start:moment.Moment,end:moment.Moment} = {start:moment(),end:moment()}

 
 convertTimeToMoment(time:string){
    const todayDate = moment(this.today); 
    const dateTimeString = todayDate.format('YYYY-MM-DD') + ' ' + time; 
    return moment(dateTimeString);
  }

  deleteTime(){
    this.onTimeDelete.emit()
  }

  changeTime(time:string, key:'start' | 'end'){
    const dateTimeMoment = this.convertTimeToMoment(time);

    if (key === 'start') {
   const endTimeId = times.indexOf(this.workTime.end)
   let startTimeId = times.indexOf(time)
   this.timesEnd = times.slice(startTimeId+1)


   if (startTimeId > endTimeId) {
     const newEndTimeMoment = this.convertTimeToMoment(times[startTimeId + 1])
     this.workTimeMoment.end = newEndTimeMoment
     this.workTimeMoment.start = dateTimeMoment
     this.workTime[key] = time
     this.workTime['end'] = times[startTimeId + 1]
     this.endd = times[startTimeId + 1]
     return
   }
    this.workTimeMoment.start = dateTimeMoment
     this.workTime[key] = time
    }else{
     this.workTimeMoment.end = dateTimeMoment

     this.workTime[key] = time
    }

    this.onTimeChange.emit(this.workTimeMoment)
 }

  onSelectChange(event:MatSelectChange){
    console.log('emit',event);
    
  }


  ngOnInit(): void {
    this.workTimeMoment = {start:this.convertTimeToMoment(this.workTime.start),end:this.convertTimeToMoment(this.workTime.end)}
    this.startt = this.workTime.start
    this.endd = this.workTime.end
  }



}

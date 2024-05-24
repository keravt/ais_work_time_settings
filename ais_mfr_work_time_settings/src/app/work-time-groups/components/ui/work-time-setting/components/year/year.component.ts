import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { WorkTimeModel } from 'src/app/work-time-groups/models/WorkTime.model';



@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class YearComponent implements OnChanges, OnInit {





  ngOnInit(): void {
    this.daysInMonth(this.year)

  
  
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year']) {
      this.daysInMonth(this.year)
  
    }

  }

  months = moment.months().map(el=>[el[0].toUpperCase(),...el.slice(1)].join(''))
  daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  daysMonth:any[] = []
  sortedEvents: Event[][] = [];
  modalActive:boolean = false
  today:{year:number, month:number,day:number} = {year:new Date().getFullYear(), month:new Date().getMonth(),day:new Date().getDate()}
  chekedDate:{year:number, month:number,day:number}  | null = this.today
  load = true

  @Input() allUserWorkTimes: WorkTimeModel[] = [];
  @Input() year: number = new Date().getFullYear();
  @Input() month: number = new Date().getMonth();
  @Input() type: 'year'| 'month' = 'year';
  @Input() borderVisible:boolean = false


  @Output() onDayClick: EventEmitter<{event:MouseEvent,date:{year:number, month:number,day:number}, result:any}> = new EventEmitter();
  @Output() onDaySecondClick: EventEmitter<{event:MouseEvent,date:{year:number, month:number,day:number}, result:any}> = new EventEmitter();
   


  onClick(event:MouseEvent,date:{year:number, month:number,day:number}, result:any){

    if( this.chekedDate && this.chekedDate.year === date.year && this.chekedDate.month ===  date.month && this.chekedDate.day === date.day){
      this.onDaySecondClick.emit({event,date,result})
      return
    }
    this.chekedDate = date
    this.onDayClick.emit({event,date,result})
  }

  @HostListener('document:click', ['$event'])
  clickout(event:MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.classList.contains('day')) {
      this.chekedDate = null
    }
  
  }

  ngClassSet(date:{year:number, month:number,day:number}, result:any):string | string[] | Set<string> | {
    [klass: string]: any;
} | null | undefined{

  const id = result ? result.uid : false

  const ppp = {
    'active':this.chekedDate && date.year === this.chekedDate.year && date.month === this.chekedDate.month && date.day === this.chekedDate.day,
    'activeResult':id && this.chekedDate && date.year === this.chekedDate.year && date.month === this.chekedDate.month && date.day === this.chekedDate.day,
    'today': date.year === this.today.year && date.month === this.today.month  && date.day === this.today.day
  }
    return ppp
  }

  daysInMonth(year:number){
    
    this.daysMonth = []
    for (let index = 0; index < 12; index++) {
      const day = moment([year,index,1]).weekday()
      const ccc =  Array.from(Array.from({length: moment([year, index]).daysInMonth()}, (_, i) => i + 1)) 
     
    if (day !== 0) {
      const blank = Array(day)
    blank.fill('')

     this.daysMonth.push([...blank, ...ccc])
     continue
    }
    this.daysMonth.push(ccc)
      
    }

    this.load = true
  }

  toNextMonth(){
  
    if (this.month === 11) {
      this.month = 0
      this.year += 1
      this.daysInMonth(this.year)
      return
    }
    this.month+=1
  }

  toPrevMonth(){
    console.log('month',this.month   );
    
    if (this.month === 0) {
      this.month =11
      this.year -= 1
      this.daysInMonth(this.year)
      return
    }
    this.month-=1
  }

  getNgbDate(year:number, month:number,day:number){
    return {year, month,day}
  }


  
 
}

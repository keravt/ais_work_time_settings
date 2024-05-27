import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Weekday, rrulestr } from 'rrule';
import { Subject, takeUntil } from 'rxjs';
import { WorkTimeApi } from 'src/app/work-time-settings/api/work-time.api';
import { RepeatEndType } from 'src/app/work-time-settings/enums/repeat-end-type';
import { RepeatType } from 'src/app/work-time-settings/enums/repeat-type.enum';
import { ChosenRepeatType } from 'src/app/work-time-settings/models/ChosenRepeatDays.model';
import { TimeSchema } from 'src/app/work-time-settings/models/TimeSchema.model';
import { WorkTimeModel } from 'src/app/work-time-settings/models/WorkTime.model';
import { SideBarService } from 'src/app/work-time-settings/services/side-bar.service';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';

moment.updateLocale('ru',{});
@Component({
  selector: 'app-side-bar-locked',
  templateUrl: './side-bar-locked.component.html',
  styleUrls: ['./side-bar-locked.component.css']
})
export class SideBarLockedComponent {

  constructor(
    
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private workTimeApi:WorkTimeApi,
    private sideBarService:SideBarService,
    private cdr:ChangeDetectorRef
  
  ) {}


  @Input() currentDate!: NgbDateStruct;
  @Input() result!: WorkTimeModel;
  @Output() closeSideNav: EventEmitter<any> = new EventEmitter();
  workTime!: WorkTimeModel | null;
  workTimes:TimeSchema[] | [] = []
  workTimeName:string = ''
  isHoliday = false
  holidayColor = 'white'
  showRepeatMenu = false;
  currentRepeatType = RepeatType.DAILY;
  repeatType = RepeatType;
  interval = 0;
  choosenRepeatDays: ChosenRepeatType = [];
  repeatTypes = Object.values(RepeatType);
  today = 0
  repeatEndType = RepeatEndType;
  choosenRepeatEndType: RepeatEndType = RepeatEndType.NEVER;
  endRepeatCount: number = 30;
  endRepeatDate: Date = new Date()
  weekDays = [
    { name: 'пн', num: 1, numForFilter: 1, alias: 'MO' },
    { name: 'вт', num: 2, numForFilter: 2, alias: 'TU' },
    { name: 'ср', num: 3, numForFilter: 3, alias: 'WE' },
    { name: 'чт', num: 4, numForFilter: 4, alias: 'TH' },
    { name: 'пт', num: 5, numForFilter: 5, alias: 'FR' },
    { name: 'сб', num: 6, numForFilter: 6, alias: 'SA' },
    { name: 'вс', num: 0, numForFilter: 7, alias: 'SU' },
  ];
  dayNumber = 0


  ngOnInit() {

 

    this.workTimeSettingStorageService.workTimeSetting$.subscribe(()=>{
      this.updateSideBar()
      this.cdr.markForCheck()
    })


  }

  ngOnChanges(changes: SimpleChanges): void {

    this.today= new Date(
      this.currentDate.year,
      this.currentDate.month,
      this.currentDate.day  
    ).valueOf()


    this.choosenRepeatDays = []
    this.currentRepeatType = RepeatType.DAILY;
    this.choosenRepeatEndType = RepeatEndType.NEVER
    this.endRepeatDate = new Date( this.currentDate.year,
      this.currentDate.month,
      this.currentDate.day) 
      
    //console.log('workTime',moment(this.workTime?.day).date());
    if (changes['currentDate'] && this.currentDate) {

  
      this.updateSideBar()
        
    }
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }
  updateSideBar(){

    console.log('update');
    
 this.workTimeApi
 .getWorkTimeById(this.result.uid ?? 'undefined')
 .pipe(takeUntil(this.destroy$))
 .subscribe((data) => {

     console.log('data', data);
     
   this.workTime = data;
   if (this.workTime === null)  return null

   this.workTimeName = data.name
    


 

   if(this.workTime.workTimeDaysClones.length >1){

     const info = this.sideBarService.passageThroughWorkTimeDaysClones(this.currentDate,this.workTime)
     console.log('info', info);
     
     this.isHoliday = info.isHoliday
     this.holidayColor = info.holidayColor
     this.workTimeName = info.workTimeName
     this.workTimes = info.workTimes
  
   }else{
     this.isHoliday = this.workTime.isHoliday
     this.holidayColor = data.holidayColor
     this.workTimeName = data.name
     this.workTimes = this.workTime.workTime.map(obj => ({ ...obj }))
   }

   const info = this.sideBarService.passageThroughWorkTimeDayClone(this.workTime,this.today)

   if (info) {
     this.isHoliday = info.isHoliday
     this.holidayColor = info.holidayColor
     this.workTimeName = info.workTimeName
     this.workTimes = info.workTimes
   }






   if (this.workTime.recurrence) {
     this.showRepeatMenu = true;
     const rrule = rrulestr(this.workTime.recurrence);
    
   
     if (rrule.origOptions.freq !== null) {
       this.currentRepeatType = [...this.repeatTypes].reverse()[ rrule.origOptions.freq as number];
     }
   
       

     if (rrule.origOptions.interval) {
       this.interval = rrule.origOptions.interval - 1;
     }

     if (rrule.origOptions.count ) {
 
       
       this.choosenRepeatEndType = RepeatEndType.COUNT;
       this.endRepeatCount = rrule.origOptions.count;
     }

     if(rrule.origOptions.byweekday && Array.isArray(rrule.origOptions.byweekday)){
       const rruleDays:Weekday[] = rrule.origOptions.byweekday as Weekday[]
       const days = this.weekDays.filter((el)=>
         rruleDays.find((findEl)=>findEl.weekday + 1 === el.numForFilter)
       )
 
       this.choosenRepeatDays = days
     }

       
     if (rrule.origOptions.until && this.workTime) {

       this.choosenRepeatEndType = RepeatEndType.DATE;
       
       
       this.endRepeatDate = new Date(new Date(rrule.origOptions.until).setDate(new Date(rrule.origOptions.until).getDate() - 1))
     }
   
   }else{
     this.showRepeatMenu = false
   }
   this.cdr.markForCheck()
 });
}


  closeSideBar() {
    this.closeSideNav.emit();
  }

  getMonthShortName() {
    const date = new Date(
      this.currentDate.year,
      this.currentDate.month,
      this.currentDate.day
    );
    return date.toLocaleString('ru-RU', { month: 'long' });
  }

  getWeektName() {
    const date = new Date(
      this.currentDate.year,
      this.currentDate.month,
      this.currentDate.day  
    );
    return date.toLocaleString('ru-RU', { weekday: 'long' });
  }

  checkRepeatDay(day: { name: string; num: number; alias: string }): boolean {
    return this.choosenRepeatDays.includes(day);
  }


}

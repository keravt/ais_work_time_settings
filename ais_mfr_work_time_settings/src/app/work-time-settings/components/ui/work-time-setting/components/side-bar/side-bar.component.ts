import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';


import { KeycloakService } from 'keycloak-angular';

import * as moment from 'moment';

import { ActivatedRoute } from '@angular/router';


import { Weekday, rrulestr } from 'rrule';


import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

import { v4 } from 'uuid';

import { MatSnackBar } from '@angular/material/snack-bar';

import { DOCUMENT } from '@angular/common';

import { Subject, fromEvent, takeUntil } from 'rxjs';
import { WorkTimeApi } from 'src/app/work-time-settings/api/work-time.api';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { SideBarService } from 'src/app/work-time-settings/services/side-bar.service';
import { HistoryService } from 'src/app/work-time-settings/services/history.service';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { WorkTimeModel } from 'src/app/work-time-settings/models/WorkTime.model';
import { RepeatType } from 'src/app/work-time-settings/enums/repeat-type.enum';
import { ChosenRepeatType } from 'src/app/work-time-settings/models/ChosenRepeatDays.model';
import { I18N_VALUES } from 'src/app/work-time-settings/services/datepicker-localization.service';
import { TimeSchema } from 'src/app/work-time-settings/models/TimeSchema.model';
import { RepeatEndType } from 'src/app/work-time-settings/enums/repeat-end-type';
import { ChangeEnum } from 'src/app/work-time-settings/enums/change.enum';
import { DeleteWorkTimeGroupComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-group/delete-work-time-group..component';
import { SaveWorkTimeComponent } from 'src/app/work-time-settings/components/modals/save-work-time/save-work-time.component';
import { DeleteWorkTimeComponent } from 'src/app/work-time-settings/components/modals/delete-work-time/delete-work-time.component';



moment.updateLocale('ru',{});
@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnChanges, OnInit, OnDestroy {


  constructor(
    private route: ActivatedRoute,
    private workTimeApi: WorkTimeApi,
    private keycloackServie: KeycloakService,
    public dialog: MatDialog,
    private workTimeSettingsApi:WorkTimeSettingsApi,
    private sideBarService:SideBarService,
    public historyService:HistoryService,
    private snackBar: MatSnackBar,
    private workTimeSettingStorageService:WorkTimeSettingStorageService,
    private cdr:ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  
  ) {}


  
  @Input() currentDate!: NgbDateStruct;
  @Input() result!: WorkTimeModel;
  @Output() closeSideNav: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  weekDays = [
    { name: 'пн', num: 1, numForFilter: 1, alias: 'MO' },
    { name: 'вт', num: 2, numForFilter: 2, alias: 'TU' },
    { name: 'ср', num: 3, numForFilter: 3, alias: 'WE' },
    { name: 'чт', num: 4, numForFilter: 4, alias: 'TH' },
    { name: 'пт', num: 5, numForFilter: 5, alias: 'FR' },
    { name: 'сб', num: 6, numForFilter: 6, alias: 'SA' },
    { name: 'вс', num: 0, numForFilter: 7, alias: 'SU' },
  ];



  workTime!: WorkTimeModel | null;
  showAddTimePeriod = false;
  showRepeatMenu = false;
  currentRepeatType = RepeatType.DAILY;
  repeatTypes = Object.values(RepeatType);
  repeatType = RepeatType;
  choosenRepeatDays: ChosenRepeatType = [];
  startTime = '00:00';
  endTime = '00:30';
  currentUserId!: string;
  dayNumber = 0
  interval = 0;
  months = I18N_VALUES.ru.months;
  monthNumber: number | undefined;
  endRepeatDate: Date = new Date()
  weekDay = 'mon'
  isHoliday = false
  workTimeName:string = ''
  holidayColor = 'white'
  workTimes:TimeSchema[] | [] = []
  today = 0
  endRepeatCount: number = 30;
  repeatEndType = RepeatEndType;
  choosenRepeatEndType: RepeatEndType = RepeatEndType.NEVER;
  prevRecurrence:string | null = ''
  prevWorkTimes:TimeSchema[] = []
  undoActive:boolean = false
  redoActive:boolean = false

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }

  ngOnInit() {

    this.keycloackServie.loadUserProfile().then((data) => {
      if (data.id) {
        this.currentUserId = data.id;
      }
      this.cdr.markForCheck()
    });


    this.historyService.undoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
      console.log('dataUndo', data);
      
      this.undoActive = data.length === 0 ? false : true
      this.cdr.markForCheck()
    })


    this.historyService.redoArray$.pipe(takeUntil(this.destroy$)).subscribe(data=>{
      this.redoActive = data.length === 0 ? false : true
      this.cdr.markForCheck()
    })


    fromEvent<KeyboardEvent>(this.document, 'keydown')
    .pipe(takeUntil(this.destroy$))
    .subscribe(async (event) => {

      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
        const { uid, year} = this.route.snapshot.params;
        if (event.shiftKey ) {
          if (!this.redoActive) {
            return
          }
      
         await this.historyService.onRedoChange(uid,year)
          this.updateSideBar()

      
            this.snackBar.open(`изменение рабочего времени ${ChangeEnum.redo}`, undefined,{
              duration: 2000
            }); 
           

          return
        }
    
         
        if (!this.undoActive) {
          return
        }

        await this.historyService.onUndoChange(uid,year)
        this.updateSideBar()
  
          this.snackBar.open(`изменение рабочего времени ${ChangeEnum.undo}`, undefined,{
            duration: 2000
          }); 



      }
      this.cdr.markForCheck()
    });
  }
 
  removeTime(i:number){
    this.workTimes.splice(i,1)
  }

  updateSideBar(){

       
    this.workTimeApi
    .getWorkTimeById(this.result.uid ?? 'undefined')
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {

        console.log('data', data);
        
      this.workTime = data;
      if (this.workTime === null)  return null

      this.workTimeName = data.name
       
      this.prevWorkTimes = this.workTime.workTime.map(obj => ({ ...obj }));

      this.prevRecurrence = data?.recurrence ?? ''

    

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
        }else{
          this.interval = 0;
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
      if (data.noRepeat.noRepeat) {
        this.showRepeatMenu = false
      }
      this.cdr.markForCheck()
    });
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
    if (changes['currentDate'] && this.currentDate || changes['result']) {
        console.log('changes');
        
  
      this.updateSideBar()
        
    }
  }



 

  onDateChange($event: any) {
    console.log('$event', $event.target.value);
    
    this.endRepeatDate = $event.value.toISOString();
  }

  deleteWorkTime(){
    const { uid,year } = this.route.snapshot.params;
    if (!this.workTime) return
   
     
    if (!this.workTime.recurrence || this.workTime.noRepeat.noRepeat) {
      this.sideBarService.deleteWorkTime(this.today,'all',this.workTime,uid,year).then(()=>{
  
  
      })
      return

    }
  

    const deleteModal = this.dialog.open(DeleteWorkTimeComponent, {
      minWidth: '448px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy:new NoopScrollStrategy(),
      data:{
        workTime :this.workTime,
        currentDate:this.today,
        uid:uid,
        year
      }
    })

    deleteModal.afterClosed().subscribe(el=>{
    
      
    })

  }


  async undo(){
    const { uid, year} = this.route.snapshot.params;
    await this.historyService.onUndoChange(uid,year)
    this.updateSideBar()
     this.snackBar.open(`изменение рабочего времени ${ChangeEnum.undo}`, undefined,{
      duration: 2000
    }); 
  }


  async redo(){
    const { uid, year} = this.route.snapshot.params;
  await this.historyService.onRedoChange(uid,year)
  this.updateSideBar()
  this.snackBar.open(`изменение рабочего времени ${ChangeEnum.redo}`, undefined,{
    duration: 2000
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

  repeatDayClick(day: { name: string; num: number; alias: string }) {
    if (this.choosenRepeatDays.includes(day)) {
      this.choosenRepeatDays = this.choosenRepeatDays.filter(
        (d) => d.name !== day.name
      );
    } else {
      this.choosenRepeatDays.push(day);
    }
    this.choosenRepeatDays.sort((a,b)=>{
      if (a.num === 0) a.num = 7
      if (b.num === 0) b.num = 7
      return a.num - b.num
    })
  }

  addTimePeriod() {

      if(this.workTime ){
        this.workTimes = [...this.workTimes,{id:v4(), color:'white', start:'00:00', end:'00:30'}]
        return
      }  



      const { uid, year } = this.route.snapshot.params;
      this.endRepeatCount = 30;
      this.showAddTimePeriod = false;
      this.showRepeatMenu = false;
      this.currentRepeatType = RepeatType.DAILY;
      this.choosenRepeatDays = [];
      this.isHoliday = false
      this.workTimeName = ''
      this.holidayColor = 'white'
      this.choosenRepeatEndType = RepeatEndType.NEVER;
    this.workTimeApi
      .createWorkTime(
        this.workTimes,
        this.currentUserId,
        this.workTime,
        moment([
          this.currentDate.year,
          this.currentDate.month,
          this.currentDate.day,
        ])
          .startOf('day')
          .valueOf(),
        this.startTime,
        this.endTime,
        uid
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.historyService.setUndoArray(data)
        this.result.uid = data[0].undo.obj.uid
        this.workTime = data[0].undo.obj;
        this.workTimes = data[0].undo.obj.workTime
        this.showAddTimePeriod = false;
        this.historyService.redoArray$.next([]) 
        this.workTimeSettingsApi

        .getWorkTimeSettingByUid(uid, year)
        .pipe(takeUntil(this.destroy$))
        .subscribe((wts) => {
          this.workTimeSettingStorageService.setWorkTimeSetting(wts)
          this.cdr.markForCheck()
         
        });
      console.log('SAVED', data)
      this.cdr.markForCheck()
      });
  }


  closeAddTimePeriod() {
    this.showAddTimePeriod = false;
  }

  saveWorkTime() {
 
    
     if (!this.workTime) return
  
    const { uid, year } = this.route.snapshot.params;
    if (!this.showRepeatMenu ) {
      this.sideBarService.createWorkTime(
        '',
        this.prevRecurrence === this.workTime.recurrence,
        this.workTime,
        new Date(
          this.currentDate.year,
          this.currentDate.month,
          this.currentDate.day  
        ).valueOf(),
        'noRepeat',
        uid,
        year,
        this.isHoliday,
        this.holidayColor,
        this.workTimes,
        this.workTimeName,
        this.choosenRepeatEndType === RepeatEndType.NEVER,
        {noRepeat:!this.showRepeatMenu, date:new Date(
          this.currentDate.year,
          this.currentDate.month,
          this.currentDate.day  
        ).valueOf(),}
        )
        return
    }
    
    const rrule = this.sideBarService.createRrule(
      this.currentRepeatType,
      this.interval,
      [...this.choosenRepeatDays],
      this.choosenRepeatEndType,
      this.endRepeatDate,
      this.endRepeatCount,
      this.currentDate
      )

      console.log('this.prevRecurrence',  this.prevRecurrence, this.workTime.recurrence);
      

      if (!this.workTime.recurrence || this.workTime.noRepeat.noRepeat) {
        this.sideBarService.createWorkTime(
          '',
          this.prevRecurrence === this.workTime.recurrence,
        this.workTime,
        new Date(
          this.currentDate.year,
          this.currentDate.month,
          this.currentDate.day  
        ).valueOf(),
        'all',
        uid,
        year,
        this.isHoliday,
        this.holidayColor,
        this.workTimes,
        this.workTimeName,
        this.choosenRepeatEndType === RepeatEndType.NEVER,
        {noRepeat:!this.showRepeatMenu, date:new Date(
          this.currentDate.year,
          this.currentDate.month,
          this.currentDate.day  
        ).valueOf()}
        )
        this.workTime.recurrence = rrule;
        return
      }
  
      const beforeReccurence =  this.workTime.recurrence 
  
      this.workTime.recurrence = rrule;
      console.log('++++', this.prevRecurrence,  this.workTime.recurrence,);

      this.dialog.open(SaveWorkTimeComponent, {
        minWidth: '448px',
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy:new NoopScrollStrategy(),
        data:{
          beforeReccurence, 
          changeReccurence: this.prevRecurrence === this.workTime.recurrence,
          isHoliday : this.isHoliday,
          holidayColor : this.holidayColor,
          workTimes :this.workTimes,
          workTimeName:this.workTimeName,
          currentDate:new Date(
            this.currentDate.year,
            this.currentDate.month,
            this.currentDate.day  
          ).valueOf(),
          workTime:this.workTime,
          uid,
          year,
          never:this.choosenRepeatEndType === RepeatEndType.NEVER,
          showRepeatMenu:this.showRepeatMenu
        }
      });

 
    
    
  }


  

}

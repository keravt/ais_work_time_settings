import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';




import { WorkTimeSchema } from 'src/schemas/WorkTime.schema';
import { WorkTimeSetting } from 'src/schemas/WorkTimeSetting.schema';
import { RRule, RRuleSet, rrulestr } from 'rrule';

import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import * as moment from 'moment';
import { WorkTimeDayCloneSchema } from 'src/schemas/WorkTimeDayClone.schema';
import { WorkTimeDaysCloneSchema } from 'src/schemas/WorkTimeDaysClone.schema';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { WorkTimeGroup } from 'src/schemas/WorkTimeGroup.schema';
import { createWorkTimeSettingDto } from './DTO/create-work-time-setting.dto';
import { UpdateTitleWorkTimeDto } from './DTO/update-title-work-time.dto';
import { GetHolidaysDto } from './DTO/get-holidays.dto';
import { WorkTimeService } from '../work-time/work-time.service';
import { HttpService } from '@nestjs/axios';
import { Event } from './models/Event.model';
import { Sort } from './models/sort.model';
import { GroupChange } from 'src/interfaces/group-change';
import { WorkTimeGroupsService } from '../work-time-groups/work-time-groups.service';



@Injectable()
export class WorkTimeSettingsService {
  constructor(

    @InjectRepository(WorkTimeSchema)
    private workTimeRepo: Repository<WorkTimeSchema>,
    @InjectRepository(WorkTimeDayCloneSchema)
    private workTimeDayCloneSchema: Repository<WorkTimeDayCloneSchema>,
    @InjectRepository(WorkTimeDaysCloneSchema)
    private workTimeDaysCloneSchema: Repository<WorkTimeDaysCloneSchema>,
    @InjectRepository(WorkTimeSetting)
    private workTimeSettingRepo: Repository<WorkTimeSetting>,
    @InjectRepository(WorkTimeGroup)
    private workTimeGroupRepo: Repository<WorkTimeGroup>,
    private workTimeService: WorkTimeService,
    private workTimeGroupService: WorkTimeGroupsService,
    private http:HttpService,
  ) {}

  async createWorkTimeSetting(dto: createWorkTimeSettingDto):Promise<GroupChange[]>  {
    const wts =  await this.workTimeSettingRepo.save(dto);

    return [{
      undo:{method:'create', schema:'setting',obj:wts},
      redo:{method:'delete', schema:'setting',obj:wts}
    }]
  }

  async deleteWorkTimeSetting(uid: string):Promise<GroupChange[]> {
    console.log('uid', uid);
    const setting = await this.workTimeSettingRepo.findOne({where:{uid:uid}, relations:{workTimeGroups:true}})
    await this.workTimeSettingRepo.delete({ uid });

    return [{
      undo:{method:'delete', schema:'setting',obj:setting},
      redo:{method:'create', schema:'setting',obj:setting}
    }]
  }

  async updateSettingTitle(dto: UpdateTitleWorkTimeDto):Promise<GroupChange[]>  {
    const prevWts = await this.workTimeSettingRepo.findOne({where:{uid:dto.uid}, relations:{workTimeGroups:true}})
    const wts =  await this.workTimeSettingRepo.save(dto);

    return [{
      undo:{method:'update', schema:'setting',obj:prevWts},
      redo:{method:'update', schema:'setting',obj:wts}
    }]
  }

  async updateWorkTimeSetting(userUid: string, wts: WorkTimeSetting):Promise<GroupChange[]>  {
    const prevWts = await this.workTimeSettingRepo.findOne({where:{uid:wts.uid}, relations:{workTimeGroups:true}})
    const  setting =  await this.workTimeSettingRepo.save({
      uid:wts.uid,
      userIds: wts.userIds,
    });
    return [{
      undo:{method:'update', schema:'setting',obj:prevWts},
      redo:{method:'update', schema:'setting',obj:setting}
    }]
  }

  async getWorkTimeSettings() {
    return await this.workTimeSettingRepo.find({order:{
      created_at:'DESC'
    }});
 
  }

  async getWorkTimeSettingByUid(uid: string, year: string) {
    let recurringInstances: WorkTimeSchema[] = [];
    let workTimes: WorkTimeSchema[] = [];

    const workTimeSetting = await this.workTimeSettingRepo
      .createQueryBuilder('workTimeSetting')
      .where('workTimeSetting.uid = :uid', { uid })
      .leftJoinAndSelect('workTimeSetting.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getOne();

    if (workTimeSetting) {
      if (workTimeSetting.workTimes)
        workTimes = [...workTimes, ...workTimeSetting.workTimes];
    }

    for (const workTime of workTimes) {
      if (!workTime.recurrence || workTime.noRepeat.noRepeat) {
        console.log('+++++++++++++=');
        
        if (
          moment(new Date(+year, 0, 0)).subtract(1, 'day').valueOf() <= workTime.day &&
          moment(new Date(+year + 1, 0, 0)).valueOf() >= workTime.day
        ) {
          recurringInstances.push({...workTime,   day:  moment(workTime.day).add(1, 'day').hour(0).toDate().valueOf()});
        }
        continue;
      }

      const instances: Date[] = this.createInstancess(
        workTime,
        new Date(+year, 0, 0),
        new Date(+year + 1, 0, 0),
      );

      console.log(instances);
      


      const endDate: null | Date = await this.createEndDateForDaysClones(
        workTime,
        instances,
      );

      if (workTime.workTimeDaysClones.length !== 0 && endDate) {
        recurringInstances = this.passageThroughDaysClones(
          workTime,
          recurringInstances,
          endDate,
          new Date(+year, 0, 0),
        );
        continue;
      }

        console.log('instances.length', instances.length);
        
      for (const instanceDate of instances) {
        const dayClone = workTime.workTimeDayClones.find((el) => {
          let dayPlusOne = moment(el.day).add(1, 'day');
          const dayPlusOneUTCFalse = dayPlusOne.hour(0).utc(false).valueOf();
          return (
            dayPlusOneUTCFalse === new Date(instanceDate).setHours(0, 0, 0, 0)
          );
        });

        if (dayClone) {
          recurringInstances.push({
            ...workTime,
            holidayColor: dayClone.holidayColor,
            isHoliday: dayClone.isHoliday,
            workTime: dayClone.workTime,
            uid: workTime.uid,
            name: dayClone.name,
            day: new Date(instanceDate).valueOf(),
          });
          continue;
        }

        recurringInstances.push({
          ...workTime,
          uid: workTime.uid,
          day: new Date(instanceDate).valueOf(),
        });
      }
    }

    workTimeSetting.workTimes = recurringInstances;
    console.log('instances.length', recurringInstances.length);
    return workTimeSetting;
  }

  async getWorkTimeGroupByUid(uid: string, year: string) {
    let recurringInstances: WorkTimeSchema[] = [];
    let workTimes: WorkTimeSchema[] = [];

  
      const workTimeGroup = await this.workTimeGroupRepo
      .createQueryBuilder('workTimeGroup')
      .where('workTimeGroup.uid = :uid', { uid })
      .leftJoinAndSelect('workTimeGroup.workTimeSettings', 'workTimeSettings')
      .leftJoinAndSelect('workTimeSettings.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getOne();

      let workTimeSettings:WorkTimeSetting[] = [...workTimeGroup.workTimeSettings]

    


 
    if (workTimeSettings.length === 0) {
      return null
    }

    const settingPositions = workTimeGroup.settingPositions.sort((a,b)=>a.position - b.position)

    settingPositions.forEach(sett => {
        const setting = workTimeSettings.find(el=>el.uid === sett.uid)
        const index = workTimeSettings.findIndex(el=>el.uid === sett.uid)
        if (setting) {
          if (sett.position > workTimeGroup.settingPositions.length) {
            workTimeSettings.splice(index,1)
            workTimeSettings.push(setting)
          }else{
            workTimeSettings.splice(index,1)
            workTimeSettings.splice(sett.position,0,setting)
          }

        }
    });


   
     
        for (const el of workTimeSettings) {
          if (el.workTimes) {
            workTimes = [...workTimes, ...el.workTimes];
          }
        }
      
    
    console.log('workTimes', workTimes);
    for (const workTime of workTimes) {
      if (!workTime.recurrence || workTime.noRepeat.noRepeat) {
        if (
          moment(new Date(+year, 0, 0)).subtract(1, 'day').valueOf() <=
            workTime.day &&
          moment(new Date(+year + 1, 0, 0)).valueOf() >= workTime.day
        ) {
          recurringInstances.push(workTime);
        }
        continue;
      }

      const instances: Date[] = this.createInstancess(
        workTime,
        new Date(+year, 0, 0),
        new Date(+year + 1, 0, 0),
      );
      const endDate: null | Date = await this.createEndDateForDaysClones(
        workTime,
        instances,
      );

      if (workTime.workTimeDaysClones.length !== 0 && endDate) {
        recurringInstances = this.passageThroughDaysClones(
          workTime,
          recurringInstances,
          endDate,
          new Date(+year, 0, 0),
        );
        continue;
      }

      for (const instanceDate of instances) {
        const dayClone = workTime.workTimeDayClones.find((el) => {
          let dayPlusOne = moment(el.day).add(1, 'day');
          const dayPlusOneUTCFalse = dayPlusOne.hour(0).utc(false).valueOf();
          return (
            dayPlusOneUTCFalse === new Date(instanceDate).setHours(0, 0, 0, 0)
          );
        });

        if (dayClone) {
          recurringInstances.push({
            ...workTime,
            holidayColor: dayClone.holidayColor,
            isHoliday: dayClone.isHoliday,
            workTime: dayClone.workTime,
            uid: workTime.uid,
            name: dayClone.name,
            day: new Date(instanceDate).valueOf(),
          });
          continue;
        }

        recurringInstances.push({
          ...workTime,
          uid: workTime.uid,
          day: new Date(instanceDate).valueOf(),
        });
      }
    }
    console.log('workTimeSettings', workTimeSettings);
    workTimeSettings[0].workTimes = recurringInstances;

    return workTimeSettings[0];
  }

  async copyWorkTimeSetting(wts: WorkTimeSetting):Promise<GroupChange[]>  {
    const newWorkTimeSetting = await this.workTimeSettingRepo.save({
      title: `${wts.title} копия`,
    });
    if (!wts.workTimes) {
  
      return [{
        undo:{method:'create', schema:'setting',obj:newWorkTimeSetting},
        redo:{method:'delete', schema:'setting',obj:newWorkTimeSetting}
      }]
      
    }

    for (const workTime of wts.workTimes) {
      const workTimeR = await this.workTimeService.getUserWorkTimeById(
        workTime.uid,
      );

      workTimeR.workTimeSetting = newWorkTimeSetting;
      delete workTimeR.uid;

      const newWorkTime = await this.workTimeRepo.save({
        ...workTimeR,
        workTimeDayClones: [],
        workTimeDaysClones: [],
      });

      if (workTimeR.workTimeDayClones) {
        for (const el of workTimeR.workTimeDayClones) {
          delete el.uid;
          el.workTimeSchema = newWorkTime;
          await this.workTimeDayCloneSchema.save(el);
        }
      }

      if (workTimeR.workTimeDaysClones) {
        for (const el of workTimeR.workTimeDaysClones) {
          delete el.uid;
          el.workTimeSchema = newWorkTime;
          await this.workTimeDaysCloneSchema.save(el);
        }
      }
    }
 
    return [{
      undo:{method:'create', schema:'setting',obj:newWorkTimeSetting},
      redo:{method:'delete', schema:'setting',obj:newWorkTimeSetting}
    }]
  }

  async getAllUserWorkTime(userUid: string, query: any) {
    let tasks = [];
    let workTimes: WorkTimeSchema[] = [];
    let recurringInstances: WorkTimeSchema[] = [];
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    let events:Event[] = []

    // try {
      // const response = await firstValueFrom(this.http.get(`https://api.calendar.k-portal.ru/api/events/event/${userUid}`, {params:query}))
      // events = response.data as unknown as Event[];
      // 
 
    // } catch (error) {
      // 
    // }
 
    
    const sortedEvents = [
      ...events.filter(
        (event) =>
          moment(event.startDate) >= moment(startDate).subtract(1, 'days') &&
          moment(event.endDate) <= moment(endDate).add(1, 'days'),
      ),
    ];

    const workTimeGroups = await this.workTimeGroupRepo
      .createQueryBuilder('workTimeGroup')
      .where(':userUid  = ANY(workTimeGroup.userIds)', { userUid })
      .leftJoinAndSelect('workTimeGroup.workTimeSettings', 'workTimeSettings')
      .leftJoinAndSelect('workTimeSettings.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getMany();

    const GeneralsWorkTimeSetting = await this.workTimeSettingRepo
      .createQueryBuilder('workTimeSetting')
      .where('workTimeSetting.isGeneral = :isGeneral', { isGeneral: true })
      .leftJoinAndSelect('workTimeSetting.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getMany();
 

      let workTimeSettings:WorkTimeSetting[] = []

      

      workTimeGroups.forEach(el=>{
          const settings = el.workTimeSettings
        el.settingPositions.forEach(sett => {
          const setting = el.workTimeSettings.find(el=>el.uid === sett.uid)
          const index = el.workTimeSettings.findIndex(el=>el.uid === sett.uid)
          if (setting) {
            if (sett.position > el.settingPositions.length) {
              settings.splice(index,1)
              settings.push(setting)
            }else{
              settings.splice(index,1)
              settings.splice(sett.position,0,setting)
            }
  
          }
      });

        workTimeSettings = [...workTimeSettings, ...settings]
      })

    if (workTimeSettings) {
      for (const el of workTimeSettings) {
        if (el.workTimes) {
          workTimes = [...workTimes, ...el.workTimes];
        }
      }
    }

    /*
    if (GeneralsWorkTimeSetting) {
        if (!workTimeSetting) {
          GeneralsWorkTimeSetting.forEach(el=>{
            if(el.workTimes) workTimes = [...workTimes, ...el.workTimes]
           
          })
        }else{
          !workTimeSetting.isGeneral && GeneralsWorkTimeSetting.forEach(el=>{
            if(el.workTimes) workTimes = [...workTimes, ...el.workTimes]
           
          })
        }

    }
*/

    if (workTimes.length === 0) {
      return {
        workTimes: [],
        tasks,
        events: sortedEvents,
        holidays: [],
      };
    }

    for (const workTime of workTimes) {
      if (!workTime.recurrence) {
        if (
          moment(startDate).subtract(1, 'day').valueOf() <= workTime.day &&
          endDate.valueOf() >= workTime.day
        ) {
          recurringInstances.push(workTime);
        }

        continue;
      }

      const instances: Date[] = this.createInstancess(
        workTime,
        startDate,
        endDate,
      );

 
      
      const dateEnd: null | Date = await this.createEndDateForDaysClones(
        workTime,
        instances,
      );

      if (workTime.workTimeDaysClones.length > 1 && dateEnd) {
        recurringInstances = this.passageThroughDaysClones(
          workTime,
          recurringInstances,
          dateEnd,
          startDate,
        );

        continue;
      }
     
      

      for (const instanceDate of instances) {
        const dayClone = workTime.workTimeDayClones.find((el) => {
          let dayPlusOne = moment(el.day).add(1, 'day');
          const dayPlusOneUTCFalse = dayPlusOne.hour(0).utc(false).valueOf();
          return (
            dayPlusOneUTCFalse === new Date(instanceDate).setHours(0, 0, 0, 0)
          );
        });

        if (dayClone) {
          recurringInstances.push({
            ...workTime,
            holidayColor: dayClone.holidayColor,
            isHoliday: dayClone.isHoliday,
            workTime: dayClone.workTime,
            uid: workTime.uid,
            name: dayClone.name,
            day: new Date(instanceDate).valueOf(),
          });
          continue;
        }

        recurringInstances.push({
          ...workTime,
          uid: workTime.uid,
          day: new Date(instanceDate).valueOf(),
        });
      }


   
      
    }
    
    return {
      workTimes: recurringInstances,
      tasks,
      events: sortedEvents,
      holidays: [],
    };
  }

  async createEndDateForDaysClones(
    workTime: WorkTimeSchema,
    instances: Date[],
  ) {
    let dateEnd = null;
    if (workTime.endDate) dateEnd = new Date(workTime.endDate);

    if (instances.length !== 0) {
      await this.workTimeRepo.update(workTime.uid, {
        endDate: new Date(instances[instances.length - 1]).valueOf(),
      });
      dateEnd = new Date(instances[instances.length - 1]);
    }

    return dateEnd;
  }

  async getUsersUidsInWorkTimeSettings(uid: string): Promise<string[]> {
    let userUids = [];
    const workTimeSettings = await this.workTimeSettingRepo.find({
      where: { uid: Not(uid) },
    });
    workTimeSettings.forEach((wts) => {
      userUids = [...userUids, wts.userIds];
    });

    return userUids;
  }



  createInstancess(workTime: WorkTimeSchema, startDate: Date, endDate: Date) {

    let dayFromWorkTime = moment(workTime.day).add(1, 'day').hour(0).toDate();
    if (workTime.never) {
      dayFromWorkTime = startDate
    }
    const set = this.createRRuleSet(workTime, dayFromWorkTime);
    console.log('[{{', startDate, endDate);
    
    return set.between(startDate, endDate, true);
   

  }

  passageThroughDaysClones(
    workTime: WorkTimeSchema,
    recurringInstances: WorkTimeSchema[],
    endDate: Date,
    startDate: Date,
  ) {
    const recurringInstancesClones: WorkTimeSchema[] = [];
    const workTimeDaysClones = [
      ...workTime.workTimeDaysClones.sort((a, b) => a.day - b.day),
    ];

    for (let i = 0; i < workTimeDaysClones.length; i++) {
      const workTimeDaysClone = workTimeDaysClones[i];

      let dayFromWorkTimeClone = moment(workTimeDaysClone.day).hour(0).toDate();
      if (workTimeDaysClone.never) {
        dayFromWorkTimeClone = startDate
      }

      console.log('dayFromWorkTimeClone', dayFromWorkTimeClone);
      
      const set = this.createRRuleSet(workTime, dayFromWorkTimeClone);

      let instances = [];

      const dayFromWorkTimeCloneNext =
        i + 1 < workTimeDaysClones.length
          ? moment(workTimeDaysClones[i + 1].day)
              .subtract(1, 'day')
              .hour(0)
              .toDate()
          : null;

      let end = !dayFromWorkTimeCloneNext
        ? new Date(endDate.setHours(0, 0, 0, 0))
        : dayFromWorkTimeCloneNext;

        console.log('ppppppppp11111', end);
        if (end.valueOf() > endDate.valueOf()) {
      end = endDate
        }
        console.log('ppppppppp', startDate, end, endDate);
        
      instances = set.between(startDate, end, true);
      console.log('pffffffpppp', instances);

      for (const instanceDate of instances) {
        const dayClone = workTime.workTimeDayClones.find((el) => {
          let dayPlusOne = moment(el.day).add(1, 'day');
          const dayPlusOneUTCFalse = dayPlusOne.hour(0).utc(false).valueOf();
          return (
            dayPlusOneUTCFalse === new Date(instanceDate).setHours(0, 0, 0, 0)
          );
        });

        if (dayClone) {
          recurringInstancesClones.push({
            ...workTime,
            holidayColor: dayClone.holidayColor,
            isHoliday: dayClone.isHoliday,
            workTime: dayClone.workTime,
            name: dayClone.name,
            uid: workTime.uid,
            day: new Date(instanceDate).valueOf(),
          });
          continue;
        }

        recurringInstancesClones.push({
          ...workTime,
          isHoliday: workTimeDaysClone.isHoliday,
          holidayColor: workTimeDaysClone.holidayColor,
          workTime: workTimeDaysClone.workTime,
          name: workTimeDaysClone.name,
          uid: workTime.uid,
          day: new Date(instanceDate).valueOf(),
        });
      }
  
    }
  
      
    return ([
      ...recurringInstances,
      ...recurringInstancesClones,
    ]);
  }

  createRRuleSet(workTime: WorkTimeSchema, dtstart: Date) {
    const set = new RRuleSet();

    const rule: RRuleSet | RRule = rrulestr(workTime.recurrence, { dtstart });
    set.rrule(rule);
    set.dtstart = dtstart;

    for (const excludedDate of workTime.excludedDate) {
      set.exdate(new Date(excludedDate));
    }

    return set;
  }

  convertDateToICalFormat(date: Date) {
    const year = date.getUTCFullYear();
    const month = this.padZeroes(date.getUTCMonth() + 1); // Months are zero-based
    const day = this.padZeroes(date.getUTCDate());
    const hours = this.padZeroes(date.getUTCHours());
    const minutes = this.padZeroes(date.getUTCMinutes());
    const seconds = this.padZeroes(date.getUTCSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  padZeroes(number: number) {
    return number < 10 ? `0${number}` : `${number}`;
  }







  async getHolidaysByUserUidsTwo({
    userUids,
    startDate,
    endDate,
  }: GetHolidaysDto) {

    const workTimeSettingsGroups = await this.workTimeGroupRepo
      .createQueryBuilder('workTimeGroup')
      .select([
        'workTimeGroup.userIds',
        'workTimeSettings.uid',
        'workTimeSettings.userIds',
        'workTimeSettings.title',
        'workTimes.day',
        'workTimes.holidayColor',
        'workTimes.recurrence',
        'workTimes.name',
      ])
      .leftJoin('workTimeGroup.workTimeSettings', 'workTimeSettings')
      .leftJoin(
        'workTimeSettings.workTimes',
        'workTimes',
        'workTimes.isHoliday = true',
      )
      .where(':userUids && workTimeGroup.userIds', { userUids })
      .getMany()

    // const workTimeSetting = await this.workTimeSettingRepo
    //   .createQueryBuilder('workTimeSetting')
    //   .select([
    //     'workTimeSetting.uid',
    //     'workTimeSetting.userIds',
    //     'workTimeSetting.title',
    //     'workTimes.day',
    //     'workTimes.holidayColor',
    //     'workTimes.recurrence',
    //     'workTimes.name',
    //   ])
    //   .leftJoin(
    //     'workTimeSetting.workTimes',
    //     'workTimes',
    //     'workTimes.isHoliday = true',
    //   )
    //   .where(':userUids && workTimeSetting.userIds', { userUids })
    //   .getMany();

    console.log("GROUPS ", workTimeSettingsGroups)
    let workTimeSettings: WorkTimeSetting[] = []
    workTimeSettingsGroups.forEach((workTimeSettingsGroup) => {
      workTimeSettings = workTimeSettingsGroup.workTimeSettings.map((wts) => {
        const holidaysWithRecurrence = [];
        wts.workTimes.forEach((event) => {
          if (event.recurrence) {
            const rule = rrulestr(event.recurrence);
            rule.options.dtstart =
              rule.origOptions.until || rule.origOptions.count
                ? new Date(event.day + 10800000)
                : new Date(startDate);
            const recurringDates = rule.between(
              new Date(startDate),
              new Date(endDate),
              true,
            );

            recurringDates.forEach((date) => {
              holidaysWithRecurrence.push({
                day: date.getTime(),
                holidayColor: event.holidayColor,
                name: event.name,
              });
            });
          } else if (event.day >= startDate && event.day <= endDate) {
            const { recurrence, ...eventWithoutRecurrence } = event;
            holidaysWithRecurrence.push(eventWithoutRecurrence);
          }
        });
        wts.workTimes = holidaysWithRecurrence;
        wts.userIds = workTimeSettingsGroup.userIds.filter((userUid) =>
          userUids.includes(userUid),
        );
        return wts
      });
    });

    return workTimeSettings;
  }


  async getAllUserWorkTimeForGant(userUid: string, query: any) {
    let tasks = [];
    let workTimes: WorkTimeSchema[] = [];
    let recurringInstances: WorkTimeSchema[] = [];
    const startDate = new Date(query.startDate)
    const endDate =  new Date(query.endDate)

    
    let events:Event[] = []

    // try {
      // const response = await firstValueFrom(this.http.get(`https://api.calendar.k-portal.ru/api/events/event/${userUid}`, {params:query}))
      // events = response.data as unknown as Event[];
      // 
 
    // } catch (error) {
      // 
    // }
 
    
    const sortedEvents = [
      ...events.filter(
        (event) =>
          moment(event.startDate) >= moment(startDate).subtract(1, 'days') &&
          moment(event.endDate) <= moment(endDate).add(1, 'days'),
      ),
    ];

    const workTimeGroups = await this.workTimeGroupRepo
      .createQueryBuilder('workTimeGroup')
      .where(':userUid  = ANY(workTimeGroup.userIds)', { userUid })
      .leftJoinAndSelect('workTimeGroup.workTimeSettings', 'workTimeSettings')
      .leftJoinAndSelect('workTimeSettings.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getMany();

    const GeneralsWorkTimeSetting = await this.workTimeSettingRepo
      .createQueryBuilder('workTimeSetting')
      .where('workTimeSetting.isGeneral = :isGeneral', { isGeneral: true })
      .leftJoinAndSelect('workTimeSetting.workTimes', 'workTimes')
      .leftJoinAndSelect('workTimes.workTimeDayClones', 'workTimeDayClones')
      .leftJoinAndSelect('workTimes.workTimeDaysClones', 'workTimeDaysClones')
      .getMany();
 

      let workTimeSettings:WorkTimeSetting[] = []

      
      console.log('dadwadada', workTimeGroups);
      workTimeGroups.forEach(el=>{
          const settings = el.workTimeSettings
        el.settingPositions.forEach(sett => {
          const setting = el.workTimeSettings.find(el=>el.uid === sett.uid)
          const index = el.workTimeSettings.findIndex(el=>el.uid === sett.uid)
          if (setting) {
            if (sett.position > el.settingPositions.length) {
              settings.splice(index,1)
              settings.push(setting)
            }else{
              settings.splice(index,1)
              settings.splice(sett.position,0,setting)
            }
  
          }
      });

        workTimeSettings = [...workTimeSettings, ...settings]
      })

    if (workTimeSettings) {
      for (const el of workTimeSettings) {
        if (el.workTimes) {
          workTimes = [...workTimes, ...el.workTimes];
        }
      }
    }

    /*
    if (GeneralsWorkTimeSetting) {
        if (!workTimeSetting) {
          GeneralsWorkTimeSetting.forEach(el=>{
            if(el.workTimes) workTimes = [...workTimes, ...el.workTimes]
           
          })
        }else{
          !workTimeSetting.isGeneral && GeneralsWorkTimeSetting.forEach(el=>{
            if(el.workTimes) workTimes = [...workTimes, ...el.workTimes]
           
          })
        }

    }
*/
    
    
    if (workTimes.length === 0) {
      return {
        workTimes: [],
        tasks,
        events: sortedEvents,
        holidays: [],
      };
    }

    workTimes  = workTimes.filter(el=>el.isHoliday)


    for (const workTime of workTimes) {
      if (!workTime.recurrence) {
        if (
          moment(startDate).subtract(1, 'day').valueOf() <= workTime.day &&
          endDate.valueOf() >= workTime.day
        ) {
          recurringInstances.push(workTime);
        }

        continue;
      }

      const instances: Date[] = this.createInstancess(
        workTime,
        startDate,
        endDate,
      );

 
      
      const dateEnd: null | Date = await this.createEndDateForDaysClones(
        workTime,
        instances,
      );

      if (workTime.workTimeDaysClones.length > 1 && dateEnd) {
        recurringInstances = this.passageThroughDaysClones(
          workTime,
          recurringInstances,
          dateEnd,
          startDate,
        );

        continue;
      }
     
      

      for (const instanceDate of instances) {
        const dayClone = workTime.workTimeDayClones.find((el) => {
          let dayPlusOne = moment(el.day).add(1, 'day');
          const dayPlusOneUTCFalse = dayPlusOne.hour(0).utc(false).valueOf();
          return (
            dayPlusOneUTCFalse === new Date(instanceDate).setHours(0, 0, 0, 0)
          );
        });

        if (dayClone) {
          recurringInstances.push({
            ...workTime,
            holidayColor: dayClone.holidayColor,
            isHoliday: dayClone.isHoliday,
            workTime: dayClone.workTime,
            uid: workTime.uid,
            name: dayClone.name,
            day: new Date(instanceDate).valueOf(),
          });
          continue;
        }

        recurringInstances.push({
          ...workTime,
          uid: workTime.uid,
          day: new Date(instanceDate).valueOf(),
        });
      }


   
      
    }
    const recurringInstancesFiltered:WorkTimeSchema[] = []
   
    
    for(const recurringInstance of recurringInstances){
      if (!recurringInstancesFiltered.find(el=>el.day === recurringInstance.day)) {
        recurringInstancesFiltered.push(recurringInstance)
      }
    }
    
    return {
      workTimes: recurringInstancesFiltered,
      tasks,
      events: sortedEvents,
      holidays: [],
    };
  }



  async getHolidaysByUserUids({
    userUids,
    startDate,
    endDate,
  }: GetHolidaysDto){
    const groups = await this.workTimeGroupService.getWorkTimeGroups()
    const arrayGroupData = []
   
    for(const userUid of  userUids){
      const group = groups.find(el=>el.userIds.includes(userUid))
      if (group) {

        
       const findedGroup =  groups.find(el=>el.userIds.includes(userUid) && arrayGroupData.find(data=>data.uid === el.uid))
       console.log('group', arrayGroupData, group);
       let index = -1 
       if (findedGroup) {

       index =  arrayGroupData.findIndex(el=>el.uid === findedGroup.uid)
       }
      
        if (index !== -1) {
          console.log('arrayGroupData[index]', arrayGroupData[index]);
          
          arrayGroupData[index].userUids.push(userUid)
        }else{
          const workTimes  =await this.getAllUserWorkTimeForGant(userUid,{startDate,endDate})
          const groupData = {
            uid:group.uid,
            userUids:[userUid],
            workTimes:workTimes.workTimes
          }
          arrayGroupData.push(groupData )

        }

      }
    }
    return arrayGroupData 
  } 
}
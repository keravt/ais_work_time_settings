import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { WorkTimeSchema } from 'src/schemas/WorkTime.schema';
import { WorkTimeDayCloneSchema } from 'src/schemas/WorkTimeDayClone.schema';
import { WorkTimeDaysCloneSchema } from 'src/schemas/WorkTimeDaysClone.schema';
import { WorkTimeSetting } from 'src/schemas/WorkTimeSetting.schema';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { AddWorkTimeDto } from './DTO/add-work-time.dto';
import { SaveWorkTimeDto } from './DTO/save-work-time.dto';
import { DeleteWorkTimeDto } from './DTO/delete-work-time.dto';
import { WorkTimeChange, WorkTimeChangeObj } from 'src/interfaces/work-time-change';
@Injectable()
export class WorkTimeService {


    constructor(
        @InjectRepository(WorkTimeSchema)
        private workTimeRepo: Repository<WorkTimeSchema>,
        @InjectRepository(WorkTimeDayCloneSchema)
        private workTimeDayCloneSchema: Repository<WorkTimeDayCloneSchema>,
        @InjectRepository(WorkTimeDaysCloneSchema)
        private workTimeDaysCloneSchema: Repository<WorkTimeDaysCloneSchema>,
        @InjectRepository(WorkTimeSetting)
        private workTimeSettingRepo: Repository<WorkTimeSetting>,
      ) {}



    async getUserWorkTimeById(id: string = '') {


        
    

        console.log('idd', id);
        
          
         if (id === '' || id === 'undefined') {
           return null
         }
       
         
         const workTime = await this.workTimeRepo.findOne({
           where: { uid: id },
           relations: {
             workTimeDayClones:true,
             workTimeDaysClones:true,
             workTimeSetting:true
           },
         });
         console.log('workTime', workTime);
         
         return workTime;
       }

    async getWorkTimeCloneById(id:string){
      console.log('idddddd', id);
      
      return await this.workTimeDayCloneSchema.findOne({
        where: { uid: id },
        relations: {
        workTimeSchema:true
        },
      });
    } 
    
    
    async getWorkTimeClonesById(id:string){
      return await this.workTimeDaysCloneSchema.findOne({
        where: { uid: id },
        relations: {
        workTimeSchema:true
        },
      });
    } 
     
     
     
       async addTime(userId: string, dto: AddWorkTimeDto) {
         let workTime:WorkTimeSchema = null
         if (dto.workTime) {
           workTime = await this.getUserWorkTimeById(dto.workTime.uid)
         }

         if (workTime) {
           if (workTime.workTimeDayClones.find(el=>new Date(el.day).setHours(0).valueOf() === new Date(dto.date).setHours(0).valueOf() )) {
             const time = workTime.workTimeDayClones.find(el=>new Date(el.day).setHours(0).valueOf() === new Date(dto.date).setHours(0).valueOf()  )
             const works = [...dto.workTime.workTime, {id:v4(),start:'00:00',end:'00:30',color:'white'}]
         
             const workTimeDayClone = await this.workTimeDayCloneSchema.update(time.uid,{...time, workTime:works})
             return  {method:'update',schema:'clone',obj:workTimeDayClone}
            
           }
     
           workTime.workTime= [...dto.workTime.workTime, {id:v4(),start:'00:00',end:'00:30',color:'white'}]
           this.workTimeRepo.save(workTime);
           return workTime;
         } 

         const time =[{id:v4(),start:'00:00',end:'00:30',color:'white'}]
         const workTimeSetting = await this.workTimeSettingRepo.findOne({where:{uid:dto.workTimeSettingId}})
         const newWorkTime = this.workTimeRepo.create({ userId, day: new Date(dto.date).valueOf(),workTime:time, workTimeSetting, endDate:new Date(dto.date).valueOf() });
         const workTimeObj = await this.workTimeRepo.save({...newWorkTime, noRepeat:{date:newWorkTime.day,noRepeat:false}});
         return [{
        undo:{method:'create',schema:'main',obj:workTimeObj},
        redo:{method:'delete',schema:'main',obj:workTimeObj}}]
       }
     
       async saveWorkTime(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]> {

        console.log('dto', dto);
        
     
         const {type} = dto
 
         switch(type){
          case 'noRepeat': return await this.updateWorkTimeWithNoRepeat(dto)
          case 'all':      return await this.updateAllWorkTime(dto)
          case 'one':      return await this.updateOneWorkTime(dto)
          case 'next':     return await this.updatePartOfWorkTime(dto)
         }
   
       
       }
     



       async updatePartOfWorkTime(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
        const {changeReccurence, workTime} = dto
  
        const workTimeByUid = await this.getUserWorkTimeById(workTime.uid)
        
        if (!changeReccurence){ 
          return await this.createWorkTimeWithNewReccurence(dto)
        }

        if (workTimeByUid.workTimeDaysClones.length === 0){
          return this.divideWorkTimeIntoClones(dto)
        }

        return this.addCloneToWorkTime(dto)

       }
     
       async updateAllWorkTime(dto:SaveWorkTimeDto ):Promise<WorkTimeChange[]>{
        let workTimeChanges:WorkTimeChange[] = []
         const {
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName,
          never,
        noRepeat} = dto
     
         const workTimeSetting = await this.workTimeSettingRepo.findOne({
           where: { uid: workTime.workTimeSetting.uid },
         });
         const workTimeOne = await this.getUserWorkTimeById(workTime.uid)
        
         const deletedWorkTimes =  await this.deleteWorkTimeClones(workTimeOne)
         workTimeChanges = [...workTimeChanges, ...deletedWorkTimes]
     
         const currentWorkTime = await this.workTimeRepo.findOne({where:{uid:workTime.uid}})
         const saveworkTime =  await this.workTimeRepo.save({ ...workTime,workTimeDayClones:[], workTimeDaysClones:[], holidayColor, isHoliday, workTime:workTimes,  workTimeSetting, name:workTimeName,never, noRepeat });
      
         workTimeChanges.unshift({
          undo:{method:'update',obj:currentWorkTime, schema:'main'},
          redo:{method:'update',obj:saveworkTime, schema:'main'}})

         return workTimeChanges
       }
     
       async updateOneWorkTime(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
     
         const {
           currentDate,
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName} = dto


           const thisWorkTime = await this.workTimeRepo.findOne({
            where: { uid: workTime.uid },
            relations: {
              workTimeDayClones:true
            },
          });

         const workTimeDay = thisWorkTime.workTimeDayClones.find(el=>el.day === currentDate)
         console.error('workTimeDay', workTimeDay, currentDate);
         
     
         if (workTimeDay) {
         
           const updateWorkTimeDay = await this.workTimeDayCloneSchema.save({...workTimeDay,holidayColor:holidayColor,
             isHoliday:isHoliday,
             workTime:workTimes,
             name:workTimeName})

             return [{
              undo:{method:'update', obj:workTimeDay ,schema:'clone'},
              redo:{method:'update', obj:updateWorkTimeDay ,schema:'clone'}
            }]
 
         }

         const createworkTimeDay =  await this.workTimeDayCloneSchema.save({
          day:currentDate,
          holidayColor:holidayColor,
          isHoliday:isHoliday,
          workTime:workTimes,
          workTimeSchema:workTime,
          name:workTimeName
        })

        return [{
          undo:{method:'create', obj:createworkTimeDay,schema:'clone'},
          redo:{method:'delete', obj:createworkTimeDay,schema:'clone'}
        }]
       }


       
     
       async updateWorkTimeWithNoRepeat(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
     
         const {
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName,
          never,
        noRepeat} = dto
     
     
         const workTimeOne = await this.getUserWorkTimeById(workTime.uid)
         if (workTimeOne.recurrence && noRepeat.noRepeat === false) {
           //return await this.updateOneWorkTime(dto)
     
         }
     
         const workTimeSetting = await this.workTimeSettingRepo.findOne({
           where: { uid: workTime.workTimeSetting.uid },
         });
     
          await this.deleteWorkTimeClones(workTimeOne)
         const updateWorkTime = await this.workTimeRepo.save({...workTimeOne, holidayColor, isHoliday, workTime:workTimes, workTimeSetting, name:workTimeName,never, noRepeat });
         return [{
          undo:{method:'update', obj:workTimeOne, schema:'main'},
          redo:{method:'update', obj:updateWorkTime, schema:'main'}
        }]
       }
     
       async createWorkTimeWithNewReccurence(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
        let workTimeChanges:WorkTimeChange[] = []
        
         const {
          beforeReccurence,  
           currentDate,
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName,
          noRepeat} = dto
     
           const workTimeByUid = await this.getUserWorkTimeById(workTime.uid)
           
         const workTimeDaysClones = [...workTimeByUid.workTimeDaysClones.sort((a, b)=>a.day - b.day)]
     
         const workTimeChangesFromDate = await this.deleteWorkTimeClonesFromDate(workTimeDaysClones,workTimeByUid.workTimeDayClones,currentDate)
         workTimeChanges = [...workTimeChanges, ...workTimeChangesFromDate]
     
         const workTimeSetting = await this.workTimeSettingRepo.findOne({
           where: { uid: workTime.workTimeSetting.uid },
         });
         const newRrule = this.modifyRRULE(beforeReccurence, this.convertDateToICalFormat(
           new Date(currentDate)
         ))


         console.log('newRrule', beforeReccurence, newRrule);
         
       
       
         const updateWorkTimeRepo = await this.workTimeRepo.save({...workTimeByUid, recurrence:newRrule, endDate:currentDate})
         workTimeChanges.push({
          undo:{method:'update', obj:workTimeByUid , schema:'main'},
          redo:{method:'update', obj:updateWorkTimeRepo , schema:'main'}
        })
         const workTimeCopy = {...workTime}
         delete workTimeCopy.uid
         delete workTimeCopy.day
         delete workTimeCopy.workTimeDayClones
         delete workTimeCopy.workTimeDaysClones
       
         
         const saveWorkTimeRepo  = await this.workTimeRepo.save({ ...workTimeCopy, uid:v4(),workTimeDayClones:[], workTimeDaysClones:[] , day:currentDate, holidayColor, isHoliday, workTime:workTimes, name:workTimeName, workTimeSetting, endDate: 2306796713694,never:false, noRepeat});
         workTimeChanges.push({
          undo:{method:'create', obj:saveWorkTimeRepo, schema:'main'},
          redo:{method:'delete', obj:saveWorkTimeRepo, schema:'main'}
        })
         return workTimeChanges
       }
     
       async divideWorkTimeIntoClones(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
        let workTimeChanges:WorkTimeChange[] = []
         const {
           currentDate,
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName,
          never} = dto
     
           const workTimeByUid = await this.getUserWorkTimeById(workTime.uid)
         const firstTime = moment(workTime.day).add(1,'day').hours(0).valueOf()
        
         const workTimeChangesFromDate = await this.deleteWorkTimeClonesFromDate(workTimeByUid.workTimeDaysClones,workTimeByUid.workTimeDayClones,currentDate)
         workTimeChanges = [...workTimeChanges, ...workTimeChangesFromDate]
     
           const leftClone = await this.workTimeDaysCloneSchema.save({
             day: firstTime,
             holidayColor:workTime.holidayColor,
             isHoliday:workTime.isHoliday,
             name:workTimeName,
             workTime:workTime.workTime,
             workTimeSchema:workTime,
             recurrence:workTime.recurrence,
             never
            
           })
           workTimeChanges.push({
            undo:{method:'create', obj:leftClone, schema:'clones'},
            redo:{method:'delete', obj:leftClone, schema:'clones'} 
        })
           
           const rightClone = await this.workTimeDaysCloneSchema.save({
             day:moment(currentDate).add(1,'day').hours(0).valueOf(),
             holidayColor,
             isHoliday,
             name:workTimeName,
             workTime:workTimes,
             workTimeSchema:workTime,
             recurrence:workTime.recurrence
           })
           workTimeChanges.push({
            undo:{method:'create', obj:rightClone, schema:'clones' },
            redo:{method:'delete', obj:rightClone, schema:'clones' }
        })
           return  workTimeChanges
     
     
       }
     
     
       async addCloneToWorkTime(dto:SaveWorkTimeDto):Promise<WorkTimeChange[]>{
      

        let workTimeChanges:WorkTimeChange[] = []

         const {
           currentDate,
           workTime, 
           isHoliday, 
           holidayColor, 
           workTimes,
           workTimeName} = dto
     
           const workTimeByUid = await this.getUserWorkTimeById(workTime.uid)
     
         const workTimeDaysClones = [...workTimeByUid.workTimeDaysClones.sort((a, b)=>a.day - b.day)]
     
           const workTimeChangesFromDate = await this.deleteWorkTimeClonesFromDate(workTimeDaysClones,workTimeByUid.workTimeDayClones ,currentDate)

           workTimeChanges = [...workTimeChanges, ...workTimeChangesFromDate]
     
     
         const  workTimeDaysClone = await this.workTimeDaysCloneSchema.save({
           day:moment(currentDate).add(1,'day').hours(0).valueOf(),
           holidayColor,
           isHoliday,
           name:workTimeName,
           workTime:workTimes,
           workTimeSchema:workTime,
           recurrence:workTime.recurrence
         })

         workTimeChanges.push({
          undo:{method:'create',obj:workTimeDaysClone, schema:'clones'},
          redo:{method:'delete',obj:workTimeDaysClone, schema:'clones'}
      })

         return workTimeChanges
       }

       async deleteAllWorkTime(dto:DeleteWorkTimeDto):Promise<WorkTimeChange[]>{
        const {workTime} = dto
        const currentDeleteWorkTime = await this.workTimeRepo.findOne({where:{uid:workTime.uid},relations:{workTimeSetting:true}})
        const  deleteWorkTime = await this.workTimeRepo.delete(workTime.uid)

        return [{
          undo:{method:'delete', obj:currentDeleteWorkTime,schema:'main'},
          redo:{method:'create', obj:currentDeleteWorkTime,schema:'main'}
        }]
       }
     
       async deleteWorkTime(dto:DeleteWorkTimeDto):Promise<WorkTimeChange[]>{

         const { type} = dto
    
         switch(type){
          case 'all' :  return await this.deleteAllWorkTime(dto)
          case 'next' :   return await this.deletePartOfWorkTime(dto)
          case 'one' :   return await this.deleteOneWoktTime(dto)
         }
       }


       async deletePartOfWorkTime(dto:DeleteWorkTimeDto):Promise<WorkTimeChange[]>{
        const {currentDate, workTime} = dto
        let workTimeChanges:WorkTimeChange[] = []

        const newRecurrence = this.modifyRRULE(workTime.recurrence, this.convertDateToICalFormat(
          new Date(currentDate)
        ))
  
        const workTimeChangesFromDate = await this.deleteWorkTimeClonesFromDate(workTime.workTimeDaysClones,workTime.workTimeDayClones, currentDate)
        workTimeChanges = [...workTimeChanges, ...workTimeChangesFromDate]
        const currentWorkTime = await this.workTimeRepo.findOne({where:{uid:workTime.uid}})
        const updateWorkTime = await this.workTimeRepo.save({...workTime, recurrence:newRecurrence, endDate:currentDate})
        workTimeChanges.unshift({
          undo:{method:'update', obj:currentWorkTime,schema:'main'},
          redo:{method:'update', obj:updateWorkTime,schema:'main'}
    })
        return workTimeChanges
       }

       async deleteOneWoktTime(dto:DeleteWorkTimeDto):Promise<WorkTimeChange[]>{
        const {workTime, currentDate} = dto
        const dateToString = moment(currentDate).add(1,'day').hour(0).toDate().toString()
        workTime.excludedDate.push(dateToString)
        const currentWorkTime = await this.workTimeRepo.findOne({where:{uid:workTime.uid}})
        const  updateWorkTime =  await this.workTimeRepo.save({...workTime, excludedDate:workTime.excludedDate})
        return [{
          undo:{method:'update', obj:currentWorkTime, schema:'main'},
          redo:{method:'update', obj:updateWorkTime, schema:'main'}
        }]
       }
     

       async deleteWorkTimeClonesFromDate(workTimeDaysClones:WorkTimeDaysCloneSchema[],workTimeDayClones:WorkTimeDayCloneSchema[],currentDate:number):Promise<WorkTimeChange[]>{
         
        const workTimeChanges:WorkTimeChange[] = []
         
         for (const workTimeDaysClone of workTimeDaysClones){
           if (workTimeDaysClone.day >= currentDate) {
            const workTimeDays = await this.getWorkTimeClonesById(workTimeDaysClone.uid)
            await this.workTimeDaysCloneSchema.delete({uid:workTimeDaysClone.uid})
            workTimeChanges.push({
              undo:{method:'delete',obj:workTimeDays,schema:'clones'},
              redo:{method:'create',obj:workTimeDays,schema:'clones'}
        })
           }
         }
         for (const workTimeDayClone of workTimeDayClones){
           if (workTimeDayClone.day >= currentDate) {
            const workTimeDay = await this.getWorkTimeCloneById(workTimeDayClone.uid)
             await this.workTimeDayCloneSchema.delete({uid:workTimeDayClone.uid})
             workTimeChanges.push({
              undo:{method:'delete',obj:workTimeDay,schema:'clone'},
              redo:{method:'create',obj:workTimeDay,schema:'clone'}
            })
            }
         }

         return workTimeChanges
       }
     
       async deleteWorkTimeClones(workTime:WorkTimeSchema):Promise<WorkTimeChange[]>{

        const workTimeChanges:WorkTimeChange[] = []


         if (workTime.workTimeDayClones.length > 0) {
           for (const  workTimeDay of workTime.workTimeDayClones){
            const currentWorkTimeDay = await this.getWorkTimeCloneById(workTimeDay.uid)
             await this.workTimeDayCloneSchema.delete({uid:workTimeDay.uid})
             workTimeChanges.push({
              undo:{method:'delete',obj:currentWorkTimeDay,schema:'clone'},
              redo:{method:'create',obj:currentWorkTimeDay,schema:'clone'}
            })
           }
         }
     
         if (workTime.workTimeDaysClones.length > 0) {
           for (const  workTimeDay of workTime.workTimeDaysClones){
            const workTimeDays = await this.getWorkTimeClonesById(workTimeDay.uid)
             await this.workTimeDaysCloneSchema.delete({uid:workTimeDay.uid})
             workTimeChanges.push({
              undo:{method:'delete',obj:workTimeDays,schema:'clones'},
              redo:{method:'create',obj:workTimeDays,schema:'clones'}
            })
           }
         }
         return workTimeChanges
       }



       async chooseChangeMethod(changeWorkTime:WorkTimeChangeObj){

        const mainMethods = {
          update:()=>this.workTimeRepo.save(changeWorkTime.obj),
          create:()=> this.workTimeRepo.delete(changeWorkTime.obj.uid),
          delete:()=>this.workTimeRepo.save(changeWorkTime.obj)
        }

        const cloneMethods = {
          update:()=> this.workTimeDayCloneSchema.save(changeWorkTime.obj),
          create:()=> this.workTimeDayCloneSchema.delete(changeWorkTime.obj.uid),
          delete:()=> this.workTimeDayCloneSchema.save(changeWorkTime.obj)
        }

        const clonesMethods = {
          update:()=> this.workTimeDaysCloneSchema.save(changeWorkTime.obj),
          create:()=> this.workTimeDaysCloneSchema.delete(changeWorkTime.obj.uid),
          delete:()=> this.workTimeDaysCloneSchema.save(changeWorkTime.obj)
        }

        switch (changeWorkTime.schema) {
          case 'main':  await mainMethods[changeWorkTime.method]();
          break;
          case 'clone':  await cloneMethods[changeWorkTime.method](); 
          break;
          case 'clones':  await clonesMethods[changeWorkTime.method]();
          break;
         
        }
       }



       async changeWorkTime(WorkTimeChanges:WorkTimeChangeObj[]){
                for (const changeWorkTime of WorkTimeChanges){
                 await this.chooseChangeMethod(changeWorkTime)
                }       
       }

       modifyRRULE(originalRRULE:string, newData:string) {
 
        const untilRegex = /UNTIL=[^;]+/;
        const countRegex = /COUNT=\d+/;
        const hasUntil = untilRegex.test(originalRRULE);
        const hasCount = countRegex.test(originalRRULE);
      
    
        if (hasUntil) {
          return originalRRULE.replace(untilRegex, `UNTIL=${newData}`);
        } else if (hasCount) {
          return originalRRULE.replace(countRegex, `UNTIL=${newData}`);
        }
      
      
        return `${originalRRULE};UNTIL=${newData}`;
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


}

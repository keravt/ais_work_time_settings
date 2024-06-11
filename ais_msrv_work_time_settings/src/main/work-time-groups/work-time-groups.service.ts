import { Injectable } from '@nestjs/common';
import { createWorkTimeGroupDto } from './DTO/create-work-time-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkTimeGroup } from 'src/schemas/WorkTimeGroup.schema';
import { Not, Repository } from 'typeorm';
import { updateWorkTimeGroupDto } from './DTO/update-work-time-group.dto';

import { updateSettingPosition } from './DTO/update-setting-position.dto';
import { Sort } from '../work-time-settings/models/sort.model';
import { GroupChange, GroupChangeObj } from 'src/interfaces/group-change';
import { WorkTimeSetting } from 'src/schemas/WorkTimeSetting.schema';

@Injectable()
export class WorkTimeGroupsService {

    constructor(
  
        @InjectRepository(WorkTimeGroup)
        private workTimeGroupRepo: Repository<WorkTimeGroup>,
        @InjectRepository(WorkTimeSetting)
        private workTimeSettingRepo: Repository<WorkTimeSetting>,


      ) {}

    async createWorkTimeGroup(dto: createWorkTimeGroupDto):Promise<GroupChange[]> {
        const group  = await this.workTimeGroupRepo.save(dto);

        return [{
          undo:{method:'create', schema:'group', obj:group},
          redo:{method:'delete', schema:'group', obj:group}
        }]
      }

      async getWorkTimeGroups() {
        return await this.workTimeGroupRepo.find({relations:{workTimeSettings:true},order:{
          created_at:'DESC'
        }});
 
      }

      async updateWorkTimeGroup(dto: updateWorkTimeGroupDto):Promise<GroupChange[]> {

        const prevGroup = await this.workTimeGroupRepo.findOne({where:{uid:dto.uid}, relations:{workTimeSettings:true}})
  
        const group = await this.workTimeGroupRepo.save(dto);

        return [{
          undo:{method:'update', schema:'group',obj:prevGroup},
          redo:{method:'update', schema:'group',obj:group}
        }]
  
      }


      async updateSettingPosition(dto: updateSettingPosition[]){

        return await this.workTimeGroupRepo.save(dto);
      }

      

      async copyWorkTimeGroup(wtg: WorkTimeGroup):Promise<GroupChange[]>  {

        const thisWth = wtg
        delete thisWth.uid
        thisWth.userIds = []
        thisWth.title = `${thisWth.title} копия`

        const group = await this.workTimeGroupRepo.save(thisWth);

        return [{
          undo:{method:'create', schema:'group',obj:group},
          redo:{method:'delete', schema:'group',obj:group}
        }]
      
      }

      async deleteWorkTimeGroup(uid: string):Promise<GroupChange[]> {
        const group = await this.workTimeGroupRepo.findOne({where:{uid:uid}, relations:{workTimeSettings:true}})
        await this.workTimeGroupRepo.delete({ uid });
        return [{
          undo:{method:'delete', schema:'group',obj:group},
          redo:{method:'create', schema:'group',obj:group}
        }]
        
      }

      async getWorkTimeGroupById(uid: string) {

        const workTimeGroup = await this.workTimeGroupRepo
      .createQueryBuilder('workTimeGroup')
      .where('workTimeGroup.uid = :uid', { uid })
      .leftJoinAndSelect('workTimeGroup.workTimeSettings', 'workTimeSettings')
      .getOne();

      return workTimeGroup
        
      }

      async getUsersUidsInWorkTimeGroups(uid: string): Promise<string[]> {
        let userUids = [];
        const workTimeGroups = await this.workTimeGroupRepo.find({
          where: { uid: Not(uid) },
        });
        workTimeGroups.forEach((wts) => {
          userUids = [...userUids, wts.userIds];
        });
    
        return userUids;
      }


      async chooseChangeMethod(changeGroup:GroupChangeObj){
             console.log('changeGroup', changeGroup);
             






        const groupMethods = {
          update:()=>this.workTimeGroupRepo.save(changeGroup.obj),
          create:()=> this.workTimeGroupRepo.delete(changeGroup.obj.uid),
          delete:()=>this.workTimeGroupRepo.save(changeGroup.obj)
        }

        const settingMethods = {
          update:()=> this.workTimeSettingRepo.save(changeGroup.obj),
          create:()=> this.workTimeSettingRepo.delete(changeGroup.obj.uid),
          delete:()=> this.workTimeSettingRepo.save(changeGroup.obj)
        }

   

        switch (changeGroup.schema) {
          case 'group':  await groupMethods[changeGroup.method]();
          break;
          case 'setting':  await settingMethods [changeGroup.method](); 
          break;
   
         
        }
       }



       async changeGroup(GroupChanges:GroupChangeObj[]){
                for (const changeGroup of GroupChanges){
                 await this.chooseChangeMethod(changeGroup)
                }       
       }


}

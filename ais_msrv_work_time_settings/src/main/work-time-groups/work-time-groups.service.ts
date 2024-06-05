import { Injectable } from '@nestjs/common';
import { createWorkTimeGroupDto } from './DTO/create-work-time-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkTimeGroup } from 'src/schemas/WorkTimeGroup.schema';
import { Not, Repository } from 'typeorm';
import { updateWorkTimeGroupDto } from './DTO/update-work-time-group.dto';

import { updateSettingPosition } from './DTO/update-setting-position.dto';
import { Sort } from '../work-time-settings/models/sort.model';

@Injectable()
export class WorkTimeGroupsService {

    constructor(
  
        @InjectRepository(WorkTimeGroup)
        private workTimeGroupRepo: Repository<WorkTimeGroup>,


      ) {}

    async createWorkTimeGroup(dto: createWorkTimeGroupDto) {
        return await this.workTimeGroupRepo.save(dto);
      }

      async getWorkTimeGroups() {
        return await this.workTimeGroupRepo.find({relations:{workTimeSettings:true},order:{
          created_at:'DESC'
        }});
 
      }

      async updateWorkTimeGroup(dto: updateWorkTimeGroupDto) {
  
        return await this.workTimeGroupRepo.save(dto);
  
      }

      async updateSettingPosition(dto: updateSettingPosition[]){
        return await this.workTimeGroupRepo.save(dto);
      }

      

      async copyWorkTimeGroup(wtg: WorkTimeGroup) {

        const thisWth = wtg
        delete thisWth.uid
        thisWth.userIds = []
        thisWth.title = `${thisWth.title} копия`
        return await this.workTimeGroupRepo.save(thisWth);
      
      }

      async deleteWorkTimeGroup(uid: string) {

        const group =  await this.workTimeGroupRepo.delete({ uid });
        console.log('group', group, uid);
        
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

}

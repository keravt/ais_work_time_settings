import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { createWorkTimeGroupDto } from './DTO/create-work-time-group.dto';
import { WorkTimeGroupsService } from './work-time-groups.service';
import { WorkTimeGroup } from 'src/schemas/WorkTimeGroup.schema';
import { updateWorkTimeGroupDto } from './DTO/update-work-time-group.dto';
import { updateSettingPosition } from './DTO/update-setting-position.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Sort } from '../work-time-settings/models/sort.model';

@Controller('work-time-groups')
export class WorkTimeGroupsController {

    constructor(private workTimeGroupService: WorkTimeGroupsService) {}


    @Post('/create')
    createWorkTimeGroup(@Body() dto: createWorkTimeGroupDto) {
      return this.workTimeGroupService.createWorkTimeGroup(dto);
    }

    @Delete('/delete/:uid')
    delete(@Param('uid') uid: string) {
      return this.workTimeGroupService.deleteWorkTimeGroup(uid);
    }

    @Get('/all')
    getWorkTimeGroups() {
      return this.workTimeGroupService.getWorkTimeGroups();
    }


    @Patch('/update')
   
    updateWorkTimeGroup(@Body() workTimeGroup: updateWorkTimeGroupDto) {
      return this.workTimeGroupService.updateWorkTimeGroup(workTimeGroup);
    }


    @Post('/copyWorkTimeGroup')
    copyWorkTimeGroup(@Body() workTimeGroup: WorkTimeGroup) {
    return this.workTimeGroupService.copyWorkTimeGroup(workTimeGroup);
  }
  
   


    @Get('/user-uids/:uid')
    getUsersUidsInWorkTimeSettings(@Param('uid') uid: string) {
      return this.workTimeGroupService.getUsersUidsInWorkTimeGroups(uid);
    }

    @MessagePattern('getGroupById')
    getWorkTimeGroupById(@Payload() uid: string) {
      return this.workTimeGroupService.getWorkTimeGroupById(uid);
    }

    

}

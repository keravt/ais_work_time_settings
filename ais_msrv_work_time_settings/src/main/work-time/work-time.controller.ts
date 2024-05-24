import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedUser, RoleGuard, Roles } from 'nest-keycloak-connect';

import { WorkTimeService } from './work-time.service';
import { DeleteWorkTimeDto } from './DTO/delete-work-time.dto';
import { SaveWorkTimeDto } from './DTO/save-work-time.dto';
import { WorkTimeSchema } from 'src/schemas/WorkTime.schema';
import { AddWorkTimeDto } from './DTO/add-work-time.dto';
import { WorkTimeChangeObj } from 'src/interfaces/work-time-change';


@Controller('work-time')
@UseGuards(AuthGuard,RoleGuard)
export class WorkTimeController {
    constructor(private workTimeService: WorkTimeService) {}

    @Post('/save')
    @Roles({roles:['realm:calendar_admin']})
  post_workTime_saveWorkTime(
 
    @Body() dto: SaveWorkTimeDto,
  ) {
    return this.workTimeService.saveWorkTime(dto);
  }


  @Post('/delete')
  @Roles({roles:['realm:calendar_admin']})
  post_workTime_deleteWorkTime(

    @Body() dto: DeleteWorkTimeDto,
  ) {
    return this.workTimeService.deleteWorkTime(dto);
  }



  @Post('/change')
  @Roles({roles:['realm:calendar_admin']})
  change_workTime_deleteWorkTime(

    @Body() dto: WorkTimeChangeObj[],
  ) {
    return this.workTimeService.changeWorkTime(dto);
  }

  

 

@ApiOperation({ summary: 'Возвращает рабочее время по ID' })
  @ApiResponse({
    type: WorkTimeSchema,
    status: 200,
    description: 'Возвращает рабочее время по ID',
  })
  @ApiParam({ name: 'userId', description: 'идентификатор пользователя' })
  @Get('/getUserWorkTimeById/:settingId')
  get_workTime_getUserWorkTimeById(
    @Param('settingId') settingId: string
  ) {

    return this.workTimeService.getUserWorkTimeById(settingId);
  }



@ApiOperation({ summary: 'Добавление рабочего времени к дню' })
  @ApiParam({ name: 'userId', description: 'идентификатор пользователя' })
  @ApiBody({ type: AddWorkTimeDto })
  @Post('/add-time/:userId')
  @Roles({roles:['realm:calendar_admin']})
  post_time_addTime(
    @AuthenticatedUser() user: any,
    @Param('userId') userId: string,
    @Body() dto: AddWorkTimeDto,
  ) {
    return this.workTimeService.addTime(userId, dto);
  }




}

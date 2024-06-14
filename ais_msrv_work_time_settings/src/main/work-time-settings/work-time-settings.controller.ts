import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkTimeSettingsService } from './work-time-settings.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard, AuthenticatedUser, RoleGuard, Roles } from 'nest-keycloak-connect';

import { getMetadataArgsStorage } from 'typeorm';
import { MetadataArgsStorage } from 'typeorm/metadata-args/MetadataArgsStorage';
import { createWorkTimeSettingDto } from './DTO/create-work-time-setting.dto';
import { WorkTimeSetting } from 'src/schemas/WorkTimeSetting.schema';
import { createDayTypeDto } from './DTO/create-day-type.dto';
import { WorkTimeSchema } from 'src/schemas/WorkTime.schema';
import { UpdateTitleWorkTimeDto } from './DTO/update-title-work-time.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetHolidaysDto } from './DTO/get-holidays.dto';
import { Sort } from './models/sort.model';


@ApiBearerAuth()
@UseGuards(AuthGuard,RoleGuard)
@Controller('work-time-settings')
export class WorkTimeSettingsController {
  constructor(private workTimeSettingService: WorkTimeSettingsService) {}

  @Get()
  syncResources() {
    let metadata: MetadataArgsStorage = getMetadataArgsStorage();
    let tables: {
      tableName: string;
      properties: {
        name?: string;
        type?: string;
        relationResourceName?: string;
        relationType?: string;
      }[];
    }[] = [];
    let tableName = '';
    let i = 0;

    metadata.columns.forEach((column) => {
      let className = column.target
        .toString()
        .split(' ')[1]
        .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
        .slice(1); // target: [class ClassClass2] преобразуем в строку 'class_class2'
      let typeProperty: string = '';
      if (typeof column.options.type == 'function') {
        typeProperty = column.options.type
          .toString()
          .split(' ')[1]
          .split('(')[0]
          .toLowerCase();
      } else {
        typeProperty = column.options.type;
      }
      if (tableName === '') {
        tables.push({
          tableName: className,
          properties: [{ name: column.propertyName, type: typeProperty }],
        });
        tableName = className;
        return;
      } else if (className === tableName) {
        tables[i].properties.push({
          name: column.propertyName,
          type: typeProperty,
        });
        return;
      } else {
        i += 1;
        tableName = className;
        tables.push({
          tableName: className,
          properties: [{ name: column.propertyName, type: typeProperty }],
        });
        return;
      }
    });
    tableName = '';
    i = 0;
    metadata.relations.forEach((relation) => {
      const relationResourceName = relation.type
        .toString()
        .split('.')[1]
        .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
        .slice(1);
      const className = relation.target
        .toString()
        .split(' ')[1]
        .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
        .slice(1); // target: [class ClassClass2] преобразуем в строку 'class_class2'
      const propertyName = relation.propertyName;
      const relationType = relation.relationType;
      let table = tables.find((table) => table.tableName == className);
      table.properties.push({
        name: propertyName,
        type: 'resource',
        relationResourceName: relationResourceName,
        relationType: relationType,
      });
    });

    return tables;
  }

  @Post()
  @Roles({roles:['realm:calendar_admin']})
  createWorkTimeSetting(@Body() dto: createWorkTimeSettingDto) {
    return this.workTimeSettingService.createWorkTimeSetting(dto);
  }

  @Delete('/deleteWorkTimeSetting/:uid')
  @Roles({roles:['realm:calendar_admin']})
  deleteWorkTimeSetting(@Param('uid') uid: string) {
    return this.workTimeSettingService.deleteWorkTimeSetting(uid);
  }


  @Get('/all')
  getWorkTimeSettings() {
    return this.workTimeSettingService.getWorkTimeSettings();
  }

  @Patch()
  @Roles({roles:['realm:calendar_admin']})
  updateWorkTimeSetting(@AuthenticatedUser() user: any,@Body() workTimeSetting: WorkTimeSetting) {
    return this.workTimeSettingService.updateWorkTimeSetting(user.sub, workTimeSetting);
  }

 @Post('/copyWorkTimeSetting')
  @Roles({roles:['realm:calendar_admin']})
  copyWorkTimeSetting(@Body() workTimeSetting: WorkTimeSetting) {
    return this.workTimeSettingService.copyWorkTimeSetting(workTimeSetting);
  } 

  
  @Get('/user-uids/:uid')
  getUsersUidsInWorkTimeSettings(@Param('uid') uid: string) {
    return this.workTimeSettingService.getUsersUidsInWorkTimeSettings(uid);
  }



 



  @Get('/data/:userId')
  get_report_getData(
    @AuthenticatedUser() user: any,
    @Param('userId') userId,
    @Query() query: any,
  ) {
    console.log('query', query);
  }

 




  // @ApiOperation({summary: "Повтор дня"})
  // @ApiBody({type: RepeatWorkTimeDto})
  // @Post("/repeat/:userId")
  // post_workTime_repeat(@AuthenticatedUser() user: any, @Param("userId") userId: string, @Body() dto: RepeatWorkTimeDto) {
  //     return this.workTimeSettingService.repeat(userId, dto)
  // }

  // @ApiOperation({summary: "создание рабочего дня"})
  // @ApiBody({type: AddWorkTimeDto})
  // @Post("/:userId")
  // post_workTime_addWorkTimeToUser(@AuthenticatedUser() user: any, @Param("userId") userId: string, @Body() dto: AddWorkTimeDto) {
  //     return this.workTimeSettingService.addWorkTimeToUser(userId, dto)
  // }

  @ApiOperation({ summary: 'Получить все дни пользователя по uid' })
  @ApiParam({ name: 'userId', description: 'идентификатор пользователя' })
  @ApiResponse({
    type: WorkTimeSchema,
    isArray: true,
    status: 200,
    description: 'Возвращает массив дней пользователя',
  })


  

  @Get('/work-times')
  get_workTime_getUserWorkTimes(
    @AuthenticatedUser() user: any,
    @Query() query: any,
  ) {
    return this.workTimeSettingService.getAllUserWorkTime(user.sub, query);
  }




  @Patch('/updateSettingTitle')
  @Roles({roles:['realm:calendar_admin']})
  updateSettingTitle(@Body() dto:UpdateTitleWorkTimeDto) {
    return this.workTimeSettingService.updateSettingTitle(dto);
  }











 

  // @EventPattern("work_time_get")
  // async getUserWorkTimeRMQ(@Payload() data: any, @Ctx() context: any) {
  //     console.log(data)
  //     return await this.workTimeSettingService.getAllUserWorkTime(data)
  // }

  @Get('/getByUid')
  getWorkTimeSettingByUid( @Query() query: any) {

    console.log('queryquery', query);
    
    return this.workTimeSettingService.getWorkTimeSettingByUid(query.uid, query.year);
  }


  @Get('/getGroupByUid')
  getWorkTimeGroupByUid( @Query() query: any) {

    console.log('queryquery', query);
    
    return this.workTimeSettingService.getWorkTimeGroupByUid(query.uid, query.year);
  }



  @MessagePattern('get-holidays')
  getHolidaysByUserUids(@Payload() getHolidaysDto: GetHolidaysDto) {
    return this.workTimeSettingService.getHolidaysByUserUids(getHolidaysDto)
  }


  //@Get('get-holidays')
  //getHolidaysByUserUids(@Query() getHolidaysDto: GetHolidaysDto) {
  //  return this.workTimeSettingService.getHolidaysByUserUids(getHolidaysDto)
  //}
  
 
}

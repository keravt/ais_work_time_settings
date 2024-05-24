import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkTimeGroup } from 'src/schemas/WorkTimeGroup.schema';

import { KeycloakModule } from 'src/keycloak/keycloak.module';
import { ClientsModule, Transport } from '@nestjs/microservices';


import { WorkTimeGroupsController } from './work-time-groups/work-time-groups.controller';
import { WorkTimeGroupsService } from './work-time-groups/work-time-groups.service';

import { HttpModule } from '@nestjs/axios';
import { WorkTimeController } from './work-time/work-time.controller';

import { WorkTimeSettingsController } from './work-time-settings/work-time-settings.controller';
import { WorkTimeSettingsService } from './work-time-settings/work-time-settings.service';
import { WorkTimeService } from './work-time/work-time.service';
import { WorkTimeDayCloneSchema } from 'src/schemas/WorkTimeDayClone.schema';
import { WorkTimeDaysCloneSchema } from 'src/schemas/WorkTimeDaysClone.schema';
import { WorkTimeSchema } from 'src/schemas/WorkTime.schema';
import { TimeSchema } from 'src/schemas/Time.schema';
import { WorkTimeSetting } from 'src/schemas/WorkTimeSetting.schema';


@Module({
  controllers: [
    WorkTimeController,
    WorkTimeGroupsController,
    WorkTimeSettingsController,


   ],
  providers: [
  
  WorkTimeGroupsService,
  WorkTimeSettingsService,
  WorkTimeService,
],
    imports: [
      ConfigModule.forRoot({
        envFilePath: process.env.ENV === 'prod' ? '.prod.env' : '.test.env',
      }),
      TypeOrmModule.forFeature([

        WorkTimeDayCloneSchema,
        WorkTimeDaysCloneSchema,
        WorkTimeSchema,
        TimeSchema,
        WorkTimeSetting,
        WorkTimeGroup,
      
   
      ]),
      KeycloakModule,
      HttpModule,
      // ClientsModule.register()
      ClientsModule.register([
        {
          name: "AUTH",
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_ADDRESS],
            queue: process.env.RABBITMQ_AUTH_QUEUE,
            queueOptions: {
              durable: false
            },
          }
        },
        {
          name: "STAFFING_TABLE",
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_ADDRESS],
            queue: process.env.RABBITMQ_STAFFING_TABLE_QUEUE,
            queueOptions: {
              durable: false
            },
          }
        },
      ]),
      
    ],
    exports:[

    ]
})
export class MainModule {}

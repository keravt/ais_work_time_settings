import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeycloakModule } from './keycloak/keycloak.module';

import { WorkTimeGroup } from './schemas/WorkTimeGroup.schema';

import { MainModule } from './main/main.module';
import { WorkTimeSetting } from './schemas/WorkTimeSetting.schema';
import { TimeSchema } from './schemas/Time.schema';
import { WorkTimeSchema } from './schemas/WorkTime.schema';
import { WorkTimeDaysCloneSchema } from './schemas/WorkTimeDaysClone.schema';
import { WorkTimeDayCloneSchema } from './schemas/WorkTimeDayClone.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.ENV === 'prod' ? '.prod.env' : '.test.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST,
      port: parseInt(process.env.POSTGRESQL_USER),
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASS,
      database: process.env.POSTGRESQL_DB,
      entities: [
   
        WorkTimeDayCloneSchema,
        WorkTimeDaysCloneSchema,
        WorkTimeSchema,
        TimeSchema,
        WorkTimeSetting,
        WorkTimeGroup,

      
      ],
      synchronize: true,
      // dropSchema: true
      //autoLoadEntities: true
    }),
    KeycloakModule,
    MainModule
  ],
  providers: [ AppService],
  controllers: [AppController],
})
export class AppModule {}

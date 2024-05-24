import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'nest-keycloak-connect';
import { AppService } from './app.service';

// @ApiBearerAuth()
// @UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()

  getHello(): string {
    return this.appService.getHello();
  }
}

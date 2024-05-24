import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class EventsGuard implements CanActivate {

  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
  
     
   if (request.method === 'GET' || request.user.sub === request.body.userUid || request.user.sub === request.query.userUid) {
    console.log(request);
    
    return true;
   }

    throw new HttpException('Нет доступа', HttpStatus.FORBIDDEN)

  }
}

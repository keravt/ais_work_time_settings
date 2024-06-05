import { Pipe, PipeTransform } from '@angular/core';
import { Person } from '../models/Person.model';


@Pipe({
  name: 'isUserInWorkTimeSetting',
  pure: true
})
export class IsUserInWorkTimeSettingPipe implements PipeTransform {

  transform(userUid: string, wtsUserIds: Person[]): boolean {

    if (!userUid) {
       return false
    }

    if (wtsUserIds.find(el=>el.keycloakUid === userUid)) {
      return true
    }else{
      return  false
    }
    
   
  }

}

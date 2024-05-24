import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'isUserInWorkTimeSetting',
  pure: true
})
export class IsUserInWorkTimeSettingPipe implements PipeTransform {

  transform(userUid: string, wtsUserIds: Set<string>): boolean {

    if (!userUid) {
       return false
    }
    
    return wtsUserIds.has(userUid)
  }

}

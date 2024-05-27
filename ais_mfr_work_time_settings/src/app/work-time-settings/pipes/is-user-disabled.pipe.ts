import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'IsUserDisabledPipe',
  pure: true
})
export class IsUserDisabledPipe implements PipeTransform {

  transform(userUid: string, allWtsUserIds: {userUid:string, groupName:string}[]): {include:boolean, groupName:string} {
    const userIds = allWtsUserIds.map(el=>el.userUid)
    const groupName = allWtsUserIds.find(el=>el.userUid === userUid)?.groupName
    return {include:userIds.includes(userUid), groupName: groupName ? `(группа ${groupName})` :''};
  }

}

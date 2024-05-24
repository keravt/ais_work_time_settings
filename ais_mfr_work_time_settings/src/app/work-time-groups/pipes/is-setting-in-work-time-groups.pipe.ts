import { Pipe, PipeTransform } from '@angular/core';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';
import { WorkTimeGroup } from '../models/WorkTimeGroup.model';

@Pipe({
  name: 'isSettingInWorkTimeGroups',
  pure: true
})
export class isSettingInWorkTimeGroups implements PipeTransform {

  transform(settings:WorkTimeSetting[], setting: WorkTimeSetting): boolean {
    console.log('settings settings', settings, setting);
    
    if (settings.find(el=>el.uid === setting.uid)) {
      return true
    }
    return false
  }

}

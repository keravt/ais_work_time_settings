import { Pipe, PipeTransform } from '@angular/core';
import { WorkTimeSetting } from '../models/WorkTimeSetting.model';

@Pipe({
  name: 'wtsInGroup'
})
export class WtsInGroupPipe implements PipeTransform {

  transform(wts: WorkTimeSetting, checked: WorkTimeSetting[]): boolean {
    if (checked.find(el=>el.uid === wts.uid)) {
      return true
    }else{
      return false
    }
  }

}

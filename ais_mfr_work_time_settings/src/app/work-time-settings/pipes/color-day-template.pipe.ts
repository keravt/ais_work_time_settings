import { Pipe, PipeTransform } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { WorkTimeModel } from '../models/WorkTime.model';
import { Result } from '../models/Result.model';
import { isDarkColor } from '../utils/date-utils';


@Pipe({
  name: 'colorDayTemplate',
  pure: true
})
export class ColorDayTemplatePipe implements PipeTransform {

  transform(value: NgbDateStruct, workTimes: WorkTimeModel[], borderVisible:boolean = false): any {
    let d = new Date(value.year, value.month - 1, value.day)

     
    let result:Partial<Result> = {}
    let wc = workTimes.find(wt => new Date(wt.day).getDate() == d.getDate() && new Date(wt.day).getFullYear() == d.getFullYear() && new Date(wt.day).getMonth() == d.getMonth()  )
    if (wc) {
      let color = "black"
      let backgroundColor = wc.workTime[wc.workTime.length - 1].color
      if (wc.isHoliday) {
        color = !isDarkColor(wc.holidayColor)  ? "black" : "white"
        backgroundColor = wc.holidayColor
      }
      return result = {
        date:wc.day,
        uid:wc.uid,
        backgroundColor,
        color,
        title: "Выходной"
      }
     
    }
    return result
  } 

}

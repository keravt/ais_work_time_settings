import { TranslationWidth } from '@angular/common';
import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';


export const I18N_VALUES = {
  "ru": {
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  },
};

@Injectable()
export class I18n {
  language = "ru";
}

@Injectable({
  providedIn: 'root'
})
export class DatepicketLocalizationService extends NgbDatepickerI18n {
  getWeekdayLabel(weekday: number, width?: TranslationWidth | undefined): string {
    return I18N_VALUES["ru"].weekdays[weekday - 1];
  }
  constructor(private _i18n: I18n) {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES["ru"].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES["ru"].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

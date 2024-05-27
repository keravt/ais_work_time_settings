import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';

import { FormControl } from '@angular/forms';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';



@Component({
  selector: 'app-create-work-time-setting-item',
  templateUrl: './create-work-time-setting-item.component.html',
  styleUrls: ['./create-work-time-setting-item.component.css'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CreateWorkTimeSettingItemComponent implements AfterViewInit {

  isGeneral = false
  newSettingTitle = new FormControl('');
  @Output() onSettingCreate = new EventEmitter<string>()
  @Output() onSettingClose = new EventEmitter<string>()

  constructor(
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private cdr:ChangeDetectorRef,
  ) {}
 

  ngAfterViewInit(): void {
    const createWorkTimeSetting = document.getElementById('createWorkTimeSetting') as HTMLElement
    createWorkTimeSetting.focus()
  }
 
 

  createSetting(event:Event){
event.preventDefault()
 
    
      
    if (this.newSettingTitle.value) {
      this.workTimeSettingsApi.createWorkTimeSettings(
        this.newSettingTitle.value,
        this.isGeneral
      ).subscribe(newWorkTimeSetting => {
        this.newSettingTitle.setValue("")
        this.onSettingCreate.emit()
        this.cdr.markForCheck()
      });
    }
  

   
  }


  inputKeyDown(){
 
    this.onSettingClose.emit()
  }
}

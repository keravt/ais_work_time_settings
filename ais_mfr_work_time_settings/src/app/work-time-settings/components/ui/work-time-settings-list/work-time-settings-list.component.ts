import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';

import { Observable, map, tap } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';




@Component({
  selector: 'app-work-time-settings-list',
  templateUrl: './work-time-settings-list.component.html',
  styleUrls: ['./work-time-settings-list.component.scss'],
})
export class WorkTimeSettingsListComponent   {
  constructor(
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr:ChangeDetectorRef
  ) {}
 



  showSettingCreator = false

  newSettingTitle = new FormControl('');
  isGeneral = false

  changedName:boolean = false
   

  workTimesSettings:  Observable<WorkTimeSetting[]> =
  this.workTimeSettingsApi.getWorkTimeSettings();
    
  closeSettingCreate(){
    this.showSettingCreator = false
  }

 
 

   

  

  backClicked() {
    this.router.navigate([`../../week/${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()}`], { relativeTo: this.route });
  }

 

  filtrSettings(uid:string){
    this.workTimesSettings = this.workTimesSettings.pipe(map(settings=>settings.filter(el=>el.uid !== uid)))
  }

  addCopySettings(wts:WorkTimeSetting){

    
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings();
  }



  changeName(){
    this.changedName = true


  }

 

  showSettingCreate(){
    this.showSettingCreator = true
    const createWorkTimeSetting = document.getElementById('createWorkTimeSetting') 
    console.log('ssssssyyuu', createWorkTimeSetting);
    


  }

  createWorkTimeSetting() {
    this.workTimesSettings =
    this.workTimeSettingsApi.getWorkTimeSettings();
    this.showSettingCreator = false
  }

}

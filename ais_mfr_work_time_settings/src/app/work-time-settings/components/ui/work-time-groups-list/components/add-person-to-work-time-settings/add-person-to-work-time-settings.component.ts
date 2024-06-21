import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Observable, firstValueFrom, map, startWith, switchMap } from 'rxjs';
import { UserApi } from 'src/app/work-time-settings/api/user.api';
import { WorkTimeGroupsApi } from 'src/app/work-time-settings/api/work-time-groups.api';
import { WorkTimeSettingsApi } from 'src/app/work-time-settings/api/work-time-settings.api';
import { DeleteWorkTimeGroupComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-group/delete-work-time-group..component';
import { Division } from 'src/app/work-time-settings/models/Division.model';
import { Person } from 'src/app/work-time-settings/models/Person.model';
import { WorkTimeGroup } from 'src/app/work-time-settings/models/WorkTimeGroup.model';
import { WorkTimeSetting } from 'src/app/work-time-settings/models/WorkTimeSetting.model';
import { WorkTimeSettingStorageService } from 'src/app/work-time-settings/services/work-time-setting-storage.service';
import { AllSettingsComponent } from '../all-settings/all-settings.component';
import { Router } from '@angular/router';
import { DeleteWorkTimeSettingsComponent } from 'src/app/work-time-settings/components/modals/delete-work-time-settings/delete-work-time-settings.component';
import { Sort } from 'src/app/work-time-settings/models/sort.model';
import { MatSort } from '@angular/material/sort';
import { AllUsersComponent } from 'src/app/work-time-settings/components/modals/all-users/all-users.component';
import { CheckedGroupStorageService } from 'src/app/work-time-settings/services/checked-group-storage.service';
import { HistoryGroupService } from 'src/app/work-time-settings/services/history-group.service';
import { WorkTimeInfoComponent } from 'src/app/work-time-settings/components/modals/work-time-info/work-time-info.component';
import { GroupService } from 'src/app/work-time-settings/services/group.service';
import { AllSettingsStorageService } from 'src/app/work-time-settings/services/all-settings-storage.service';
import { SortType } from 'src/app/work-time-settings/models/SortType.model';


@Component({
  selector: 'app-add-person-to-work-time-settings',
  templateUrl: './add-person-to-work-time-settings.component.html',
  styleUrls: ['./add-person-to-work-time-settings.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AddPersonToWorkTimeSettingsComponent implements   OnInit {
  constructor(
    private UserApi: UserApi,
    private workTimeSettingsApi: WorkTimeSettingsApi,
    private workTimeSettingStorageService: WorkTimeSettingStorageService,
    private workTimeGroupsApi: WorkTimeGroupsApi,
    private checkedGroupStorageService: CheckedGroupStorageService,
    private allSettingsStorageService: AllSettingsStorageService,
    private historyGroupService:     HistoryGroupService,
    private groupService:GroupService,

    private snackBar: MatSnackBar,
    private cdr:ChangeDetectorRef,
    private dialog:MatDialog,
    private router:Router,
    


  ) {}


  wtg:WorkTimeGroup | null = null
  @Output() onGroupSave = new EventEmitter()
  @Output() onClose = new EventEmitter()
  @Output() onPreviewVisible = new EventEmitter<boolean>()
  personsControl = new FormControl('');
  checkedUsers:Person[] = []
  checkedSettings:WorkTimeSetting[] = []
  settingsControl = new FormControl('');
  persons: Person[] = [];
  allPersons: Person[] = [];
  
  GroupSettings:WorkTimeSetting[] = []
  filteredPersons: Person[] = [];
  filteredPersonsByDivision: Person[] = [];
  filteredSettings!: WorkTimeSetting[];
  isLoading = false
  isLoadingSettings = false
  isUpdate = false
  checkedWtg:WorkTimeGroup | null = null
  workTimeGroups:WorkTimeGroup[] = []
  divisions:Division[] = []
  fiteredDivisions:Division[] = []
  divionInput = new FormControl()
  selectedDivision:null | Division = null
  settingPositions:{uid:string, position:number}[] = []
  option = 1
  inputValue = ''
  settingValue = ''
  previewVisible = false
  settingVisible = true
  changedName = ''
  year = moment().year()
  checkActive = false

  sort:SortType = {active:'name', direction:''}
  allChecked = false
  allSettingChecked = false

  ngOnInit(): void {


  
  }









 


  chooseOption(option:number){
    if (option === 1) {
      this.previewVisible = false
      this.onPreviewVisible.emit(false)
    }else{
      this.previewVisible = true
      this.onPreviewVisible.emit(true)
    }

  this.option = option
  }
















  close(){
 this.chooseOption(1)
this.onClose.emit()
  }





}

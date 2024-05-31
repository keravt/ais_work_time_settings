import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../material-imports/material-imports.module';
import { SettingsRoutingModule } from './work-time-settings-routing.module';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SettingsComponent } from './components/layouts/settings/settings.component';
import { WorkTimeGroupsListComponent } from './components/ui/work-time-groups-list/work-time-groups-list.component';
import { CreateWorkTimeGroupItemComponent } from './components/ui/work-time-groups-list/components/create-work-time-group-item/create-work-time-group-item.component';
import { AddPersonToWorkTimeSettingsComponent } from './components/ui/work-time-groups-list/components/add-person-to-work-time-settings/add-person-to-work-time-settings.component';
import { SideBarLockedComponent } from './components/ui/work-time-group-preview/components/side-bar-locked/side-bar-locked.component';
import { WorkTimeGroupItemComponent } from './components/ui/work-time-groups-list/components/work-time-group-item/work-time-group-item.component';
import { HeaderComponent } from './components/ui/header/header.component';
import { isSettingInWorkTimeGroups } from './pipes/is-setting-in-work-time-groups.pipe';
import { IsUserInWorkTimeSettingPipe } from './pipes/is-user-in-work-time-setting.pipe';
import { IsUserDisabledPipe } from './pipes/is-user-disabled.pipe';
import { WorkTimeGroupPreviewComponent } from './components/ui/work-time-group-preview/work-time-group-preview.component';
import { YearComponent } from './components/ui/work-time-group-preview/components/year/year.component';
import { ColorDayTemplatePipe } from './pipes/color-day-template.pipe';
import { WorkTimeSettingItemComponent } from './components/ui/work-time-settings-list/components/work-time-setting-item/work-time-setting-item.component';
import { CreateWorkTimeSettingItemComponent } from './components/ui/work-time-settings-list/components/create-work-time-setting-item/create-work-time-setting-item.component';
import { WorkTimeSettingsComponent } from './components/ui/work-time-setting/work-time-settings.component';
import { DeleteWorkTimeSettingsComponent } from './components/modals/delete-work-time-settings/delete-work-time-settings.component';
import { SideBarComponent } from './components/ui/work-time-setting/components/side-bar/side-bar.component';
import { DeleteWorkTimeComponent } from './components/modals/delete-work-time/delete-work-time.component';
import { SaveWorkTimeComponent } from './components/modals/save-work-time/save-work-time.component';
import { TimePeriodComponent } from './components/ui/work-time-setting/components/time-period/time-period.component';
import { WorkTimeSettingsListComponent } from './components/ui/work-time-settings-list/work-time-settings-list.component';
import { DeleteWorkTimeGroupComponent } from './components/modals/delete-work-time-group/delete-work-time-group..component';
import { FilterDropdownComponent } from './components/ui/filter-dropdown/filter-dropdown.component';
import { WtsOptionsComponent } from './components/ui/work-time-settings-list/components/wts-options/wts-options.component';


@NgModule({
  declarations: [
    SideBarLockedComponent,
    AddPersonToWorkTimeSettingsComponent,
    CreateWorkTimeGroupItemComponent,
    WorkTimeGroupsListComponent,
    SettingsComponent,
    WorkTimeGroupItemComponent,
    HeaderComponent,
    isSettingInWorkTimeGroups,
    IsUserInWorkTimeSettingPipe,
    IsUserDisabledPipe,
    WorkTimeGroupPreviewComponent,
    YearComponent,
    ColorDayTemplatePipe,
    WorkTimeSettingItemComponent,
    CreateWorkTimeSettingItemComponent,
    WorkTimeSettingsComponent,
    DeleteWorkTimeSettingsComponent,
    SideBarComponent,
    DeleteWorkTimeComponent,
    DeleteWorkTimeGroupComponent,
    SaveWorkTimeComponent,
    TimePeriodComponent,
    WorkTimeSettingsListComponent,
    FilterDropdownComponent,
    WtsOptionsComponent,
  


  ],
  imports: [
    RouterModule, 
    RouterOutlet,
    CommonModule,
    MaterialImportsModule,
    SettingsRoutingModule,
   
  ]
})
export class WorkTimeSettingsModule { }

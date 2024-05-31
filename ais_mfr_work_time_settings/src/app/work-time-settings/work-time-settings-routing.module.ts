import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './components/layouts/settings/settings.component';
import { WorkTimeGroupsListComponent } from './components/ui/work-time-groups-list/work-time-groups-list.component';
import { WorkTimeGroupPreviewComponent } from './components/ui/work-time-group-preview/work-time-group-preview.component';
import { WorkTimeSettingsListComponent } from './components/ui/work-time-settings-list/work-time-settings-list.component';
import { WorkTimeSettingsComponent } from './components/ui/work-time-setting/work-time-settings.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: `work-time-groups`,
    pathMatch: 'full',
  },
  {
    path: '',
    component: SettingsComponent,

    children: [
      {path: 'work-time-groups', component: WorkTimeGroupsListComponent},
      {path: 'work-time-groups/:uid/:year', component: WorkTimeGroupPreviewComponent},
      {path: 'work-time', component: WorkTimeSettingsListComponent},
      {path: 'work-time/:uid/:year', component: WorkTimeSettingsComponent },
    ],

  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}

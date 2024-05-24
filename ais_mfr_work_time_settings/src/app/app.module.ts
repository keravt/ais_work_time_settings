import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkTimeGroupsModule } from './work-time-groups/work-time-groups.module';
import { initializeKeycloak } from './keycloak/keycloak-init.factory';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    KeycloakAngularModule,
    FormsModule,
    WorkTimeGroupsModule
   

  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

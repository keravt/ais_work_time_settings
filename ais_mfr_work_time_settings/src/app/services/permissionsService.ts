import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot,  CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';


@Injectable({
  providedIn: 'root'
})
class PermissionsService {

  constructor(private keycloakService:KeycloakService) {}

  canActivate(): boolean {
    const roles = this.keycloakService.getUserRoles()
    return roles.includes('calendar_admin')
  }

  async redirect(state: RouterStateSnapshot){
    await this.keycloakService.login({
      redirectUri: window.location.origin + state.url
    });
  }
}

export const WorkTimeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot)=> {
  if (inject(PermissionsService).canActivate()) {

    return  true
  }
  return inject(Router).createUrlTree(['/ais_mfr_work_time_groups/work-time-groups/27auth/login'])

}

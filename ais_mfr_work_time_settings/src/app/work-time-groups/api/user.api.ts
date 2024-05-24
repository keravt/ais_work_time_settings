import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';

import { authUrl, keycloakConfigInfo, mainURL, staffingTableURL } from 'src/environments/environment';
import { Person } from '../models/Person.model';
import { Division } from '../models/Division.model';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  constructor(private http: HttpClient) {}

  fetch(): Observable<Person[]> {
    return this.http.get<Person[]>(
      `${authUrl}/api/auth/authorization-routing`,
      {
        params: {
          path: `api/staffing-table/person/get-all-persons`,
          query: '',
        },
      }
    );

  }

  getAllDivisions():Observable<Division[]>{
   return this.http.get<Division[]>(`${staffingTableURL}/api/staffing-table/tree_division/list`)
  }

 
}

import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { BehaviorSubject, Observable } from 'rxjs';

import { KeycloakService } from 'keycloak-angular';


@Injectable()
export class WebsocketService {

  obser: Observable<Request>;
  public message: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private readonly keycloak: KeycloakService) {
    
        console.log(data)
        this.socket.on(`message`, (data) => {
            this.message$.next(data)
          });


  }

  socket = io('wss://test-shell-api.k-portal.ru');

  public sendMessage(message: any) {
    console.log('sendMessage: ', message)
    this.socket.emit('message', message);
  }
}

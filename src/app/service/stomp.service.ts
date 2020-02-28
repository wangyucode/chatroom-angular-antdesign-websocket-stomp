import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';


@Injectable({
  providedIn: 'root'
})
export class StompService {

  rxStomp: RxStomp;
  initData: any;

  constructor() {
    this.rxStomp = new RxStomp();
  }
}

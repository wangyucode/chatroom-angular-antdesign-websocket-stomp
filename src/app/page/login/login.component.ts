import { Component, OnInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { RxStompState } from '@stomp/rx-stomp';
import { Message } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  code: string;
  error: string;

  constructor(private stompService: StompService, private router: Router) {
  }

  ngOnInit() {
  }

  join() {
    if (!this.code) {
      this.error = '请输入邀请码！';
      return;
    }
    this.stompService.rxStomp.configure({
      brokerURL: 'ws://127.0.0.1:8080/stomp',
      connectHeaders: {
        code: this.code
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 200,
      debug: environment.production ? undefined : (msg: string): void => {
        console.log(new Date(), msg);
      }
    });
    this.stompService.rxStomp.connected$.subscribe(this.connectCallBack);
    this.stompService.rxStomp.activate();
  }

  change() {
    this.error = '';
  }

  connectCallBack = (state: RxStompState) => {
    if (state === RxStompState.OPEN) {
      this.stompService.rxStomp.watch('/user/queue/status').subscribe(this.statusCallBack);
      this.stompService.rxStomp.publish({ destination: '/app/status' });
    }
  };

  statusCallBack = (msg: Message) => {
    const result = JSON.parse(msg.body);
    if (result.error) {
      this.error = result.error;
      this.stompService.rxStomp.deactivate();
    } else {
      if (!environment.production) {
        console.log('statusCallBack', result.data);
      }
      this.stompService.initData = result.data;
      this.router.navigate(['/chat']);
    }
  };
}

import { Component, OnInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { RxStompState, RxStompConfig } from '@stomp/rx-stomp';
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

    const config: RxStompConfig = {
      brokerURL: environment.stompEndpoint,
      connectHeaders: {
        code: this.code
      }
    };
    if (!environment.production) {
      config.debug = console.log;
    }
    this.stompService.rxStomp.configure(config);
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

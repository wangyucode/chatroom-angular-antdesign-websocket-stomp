import { Component, OnDestroy, OnInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { RxStompConfig, RxStompState } from '@stomp/rx-stomp';
import { Message } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';


const noOp = () => {
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {


  code: string;
  error: string;

  connectSub: Subscription;
  statusSub: Subscription;

  constructor(private stompService: StompService, private router: Router) {
  }

  ngOnInit() {
    this.connectSub = this.stompService.rxStomp.connected$.subscribe(this.connectCallBack);
  }

  ngOnDestroy(): void {
    if (this.connectSub) {
      this.connectSub.unsubscribe();
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  join() {
    if (!this.code) {
      this.error = '请输入邀请码！';
      return;
    }

    const config: RxStompConfig = {
      brokerURL: environment.stompEndpoint,
      // brokerURL: 'wss://wycode.cn/web/stomp',
      connectHeaders: {
        code: this.code
      },
      debug: environment.production ? noOp : console.log,
      reconnectDelay: 3000
    };
    this.stompService.rxStomp.configure(config);
    this.stompService.rxStomp.activate();
  }

  change() {
    this.error = '';
  }

  connectCallBack = (state: RxStompState) => {
    if (state === RxStompState.OPEN) {
      this.statusSub = this.stompService.rxStomp.watch('/user/queue/status').subscribe(this.statusCallBack);
      this.stompService.rxStomp.publish({ destination: '/app/status' });
    }
  };

  statusCallBack = (msg: Message) => {
    const result = JSON.parse(msg.body);
    if (result.error) {
      this.error = result.error;
      if (this.statusSub) {
        this.statusSub.unsubscribe();
      }
      this.stompService.rxStomp.deactivate();
    } else {
      if (!environment.production) {
        console.log('statusCallBack', result.data);
      }
      this.stompService.initData = result.data;
      this.router.navigate(['/chat'], { replaceUrl: true });
    }
  };
}

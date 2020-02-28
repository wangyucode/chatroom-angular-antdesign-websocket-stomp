import { Component, OnInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { Router } from '@angular/router';
import { Message } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  names = ['亚瑟',
    '狄仁杰',
    '鲁班七号',
    '妲己',
    '铠',
    '马超',
    '司马懿',
    '猪八戒',
    '姜子牙',
    '刘备'];
  icons = ['https://game.gtimg.cn/images/yxzj/img201606/heroimg/166/166.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/133/133.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/112/112.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/109/109.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/193/193.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/518/518.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/137/137.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/511/511.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/148/148.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/170/170.jpg'];
  content: string;
  messages: any[];
  count: number;
  code: string;
  user: number;
  gen: number;
  remove: number;
  welcomeVisible = true;

  constructor(private stompService: StompService, private router: Router) {
  }

  ngOnInit() {
    if (this.stompService.initData) {
      this.messages = this.stompService.initData.messages;
      this.count = this.stompService.initData.users.length;
      this.code = this.stompService.initData.code;
      this.user = this.stompService.initData.user;
      this.gen = this.stompService.initData.gen;
      this.remove = this.stompService.initData.remove;
      this.stompService.rxStomp.watch('/topic/all').subscribe(this.messageCallBack);
      this.stompService.rxStomp.watch('/topic/system').subscribe(this.messageCallBack);
    } else {
      this.router.navigate(['/']);
    }
  }

  exit() {
    this.stompService.rxStomp.deactivate();
    this.stompService.initData = undefined;
    this.router.navigate(['/']);
  }

  copy() {
  }

  send() {
    this.stompService.rxStomp.publish({ destination: '/app/all', body: this.content });
    this.content = '';
  }

  messageCallBack = (msg: Message) => {
    const result = JSON.parse(msg.body);
    if (!environment.production) {
      console.log('messageCallBack', result.data);
    }
    switch (result.data.type) {
      case 100:
        this.code = result.data.content;
        break;
      case 200:
        this.count += 1;
        break;
      case 201:
        this.count -= 1;
        break;
    }
    this.messages.push(result.data);
  };
}

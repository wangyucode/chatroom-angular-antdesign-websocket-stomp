import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { StompService } from '../../service/stomp.service';
import { Router } from '@angular/router';
import { Message } from '@stomp/stompjs';
import { RxStompState } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  names = ['亚瑟',
    '狄仁杰',
    '鲁班七号',
    '妲己',
    '铠',
    '马超',
    '司马懿',
    '猪八戒',
    '姜子牙',
    '蒙犽',
    '鲁班大师',
    '西施',
    '曜',
    '云中君',
    '瑶',
    '盘古',
    '嫦娥',
    '上官婉儿',
    '李信',
    '沈梦溪',
    '伽罗',
    '盾山',
    '孙策',
    '元歌',
    '米莱狄',
    '狂铁',
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
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/524/524.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/525/525.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/523/523.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/522/522.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/506/506.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/505/505.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/529/529.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/515/515.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/513/513.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/507/507.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/312/312.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/508/508.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/509/509.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/510/510.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/125/125.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/504/504.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/503/503.jpg',
    'https://game.gtimg.cn/images/yxzj/img201606/heroimg/170/170.jpg'];
  content = '';
  messages = [];
  count = 0;
  code = '';
  user = 0;
  id = 0;
  gen = 0;
  remove = 0;
  welcomeVisible = false;

  contentDiv: HTMLElement;

  allSub: Subscription;
  systemSub: Subscription;
  connectSub: Subscription;
  statusSub: Subscription;

  offline = false;

  offlineModal: NzModalRef;

  constructor(private stompService: StompService,
              private router: Router,
              private el: ElementRef,
              private message: NzMessageService,
              private modalService: NzModalService) {
  }

  ngOnInit() {
    this.contentDiv = this.el.nativeElement.querySelector('#chat-content');

    if (!environment.production) {
      this.stompService.rxStomp.stompClient.onWebSocketClose = console.log;
    }
    this.connectSub = this.stompService.rxStomp.connectionState$.subscribe(this.connectCallBack);
    if (this.stompService.initData) {
      this.messages = this.stompService.initData.messages;
      this.count = this.stompService.initData.size;
      this.code = this.stompService.initData.code;
      this.id = this.stompService.initData.user;
      this.user = this.stompService.initData.user % this.names.length;
      this.gen = this.stompService.initData.gen;
      this.remove = this.stompService.initData.remove;
      this.allSub = this.stompService.rxStomp.watch('/topic/all').subscribe(this.messageCallBack);
      this.systemSub = this.stompService.rxStomp.watch('/topic/system').subscribe(this.messageCallBack);
      this.welcomeVisible = true;
    } else {
      this.exit();
    }
  }

  ngOnDestroy(): void {
    if (this.allSub) {
      this.allSub.unsubscribe();
    }
    if (this.systemSub) {
      this.systemSub.unsubscribe();
    }
    if (this.connectSub) {
      this.connectSub.unsubscribe();
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  connectCallBack = (state: RxStompState) => {
    if (state === RxStompState.CLOSED) {
      this.offline = true;
      this.stompService.rxStomp.configure({
        connectHeaders:
          {
            id: this.id.toString(),
            code: this.code
          }
      });
    } else if (state === RxStompState.OPEN && this.offline) {
      this.offline = false;
      this.statusSub = this.stompService.rxStomp.watch('/user/queue/status').subscribe(this.statusCallBack);
      this.stompService.rxStomp.publish({ destination: '/app/status' });
    }
  };

  statusCallBack = (msg: Message) => {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
    const result = JSON.parse(msg.body);
    if (result.error) {
      this.offlineModal = this.modalService.error({
        nzTitle: '重连失败！',
        nzContent: '请重新进入房间...',
        nzOnOk: this.exit
      });
    } else {
      this.message.success('重连成功！');
      if (!environment.production) {
        console.log('statusCallBack', result.data);
      }
      this.stompService.initData = result.data;
      this.messages = this.stompService.initData.messages;
      this.count = this.stompService.initData.size;
      this.code = this.stompService.initData.code;
      this.id = this.stompService.initData.user;
      this.user = this.stompService.initData.user % this.names.length;
      this.gen = this.stompService.initData.gen;
      this.remove = this.stompService.initData.remove;
    }
  };

  exit = () => {
    this.stompService.rxStomp.deactivate();
    this.stompService.initData = undefined;
    this.router.navigate(['/login'], { replaceUrl: true });
  };

  copy() {
  }

  send() {
    if (this.content) {
      this.stompService.rxStomp.publish({ destination: '/app/all', body: this.content });
      this.content = '';
    }
  }

  messageCallBack = (msg: Message) => {
    const result = JSON.parse(msg.body);
    if (!environment.production) {
      console.log('messageCallBack', result.data);
    }
    switch (result.data.type) {
      case 100:
        this.code = result.data.content;
        this.stompService.rxStomp.configure({ connectHeaders: { code: this.code } });
        break;
      case 200:
        this.count += 1;
        break;
      case 201:
        this.count -= 1;
        break;
    }
    this.messages.push(result.data);
    this.scroll();
  };

  scroll() {
    setTimeout(() => {
      this.contentDiv.scrollTop = this.contentDiv.scrollHeight;
    }, 500);
  }
}

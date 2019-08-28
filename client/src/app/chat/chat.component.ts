import { Component, OnInit, ViewChildren, ViewChild, AfterViewInit, QueryList, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatList, MatListItem } from '@angular/material';

import {Action,ChatMessage,Event, User}  from 'chat-typescript-models';
import { SocketService } from './shared/services/socket.service';
import { DialogUserComponent } from './dialog-user/dialog-user.component';
import { DialogUserType } from './dialog-user/dialog-user-type';
import * as uuid from 'uuid/v4';


const AVATAR = 'https://robohash.org/5dd5dde1f66641e177429ba602d29ef7?set=set3&bgset=&size=200x200';

@Component({
  selector: 'typescript-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  action = Action;
  user: User;
  roomChatName: string;
  messages: ChatMessage[] = [];
  messageContent: string;
  ioConnection: any;
  dialogRef: MatDialogRef<DialogUserComponent> | null;
  defaultDialogUserParams: any = {
    disableClose: true,
    data: {
      title: 'Welcome',
      dialogType: DialogUserType.NEW
    }
  };

  @ViewChild(MatList, { read: ElementRef }) matList: ElementRef;
  @ViewChildren(MatListItem, { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private socketService: SocketService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.initModel();
    this.openUserPopup(this.defaultDialogUserParams);
  }

  ngAfterViewInit(): void {
    this.matListItems.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    try {
      this.matList.nativeElement.scrollTop = this.matList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  private initModel(): void {
    this.user = {
      id: uuid(),
      avatar: AVATAR
    };
  }

  private initIoConnection(): void {
    this.socketService.initSocket();


    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: ChatMessage) => {
        this.messages.push(message);
      });

    this.socketService.onMessageBulk()
        .subscribe((message: ChatMessage[]) => {
          message.forEach(singelMessage=>{
            this.messages.push(singelMessage);
          })
        });

    this.socketService.joinChatroom({chatRoomName: this.roomChatName, userID: this.user.name});
    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  private openUserPopup(params): void {
    this.dialogRef = this.dialog.open(DialogUserComponent, params);
    this.dialogRef.afterClosed().subscribe(paramsDialog => {
      if (!paramsDialog) {
        return;
      }

      this.user.name = paramsDialog.username;
      this.roomChatName = paramsDialog.roomChatName;
      console.log('params dialogs', paramsDialog);
      if (paramsDialog.dialogType === DialogUserType.NEW) {
        this.initIoConnection();
        this.sendNotification(paramsDialog, Action.JOINED);
      }
    });
  }

  public sendMessage(message: string): void {
    if (!message) {
      return;
    }
    if (message.includes('/stock')) {
      this.socketService.sendCommand({
        from: this.user,
        message: message,
        chatRoomName: this.roomChatName
      });
    }else {
      this.socketService.send({
        from: this.user,
        message: message,
        chatRoomName: this.roomChatName
      });
    }
    this.messageContent = null;
  }

  public sendNotification(params: any, action: Action): void {
    let message: ChatMessage;

    if (action === Action.JOINED) {
      message = {
        from: this.user,
        action: action,
        message: "",
        chatRoomName: this.roomChatName
      }
    }
    this.socketService.send(message);
  }
}

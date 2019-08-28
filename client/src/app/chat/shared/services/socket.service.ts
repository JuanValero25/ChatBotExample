import { Injectable } from '@angular/core';
import { Observable,  } from 'rxjs/Observable';
import {ChatMessage,Event, JoinChannel}  from 'chat-typescript-models';

import * as socketIo from 'socket.io-client';

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }
    //message_from_bot_to_room
    public send(message: ChatMessage): void {
        this.socket.emit(Event.MESSAGE, message);
    }

  public sendCommand(message: ChatMessage): void {
    this.socket.emit(Event.MESSAGE_COMMAND, message);
  }

    public joinChatroom(chatRoom: JoinChannel) {
      this.socket.emit(Event.JOINCHATROOM, chatRoom)
    }

    public onMessage(): Observable<ChatMessage> {
        return new Observable<ChatMessage>(observer => {
            this.socket.on(Event.MESSAGE, (data: ChatMessage) => observer.next(data));
        });
    }

    public onMessageBulk(): Observable<ChatMessage[]> {
        return new Observable<ChatMessage[]>(observer => {
            this.socket.on(Event.MESSAGE_BULK, (data: ChatMessage[]) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}

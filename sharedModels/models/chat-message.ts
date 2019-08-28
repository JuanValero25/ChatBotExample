import User from 'models/user';
import Action from "models/action";

export default class ChatMessage {
    public from: User;
    public message: string;
    public action?: Action;
    public chatRoomName: string;

    constructor(from: User, content: string, roomChatName: string, action?: Action) {
        this.from = from;
        this.message = content;
        this.chatRoomName = roomChatName;
        this.action = action;
    }
}

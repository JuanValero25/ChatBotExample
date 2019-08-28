"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

class ChatMessage {
    constructor(from, content, roomChatName, action) {
        this.from = from;
        this.message = content;
        this.chatRoomName = roomChatName;
        this.action = action;
    }
}

exports.default = ChatMessage;
//# sourceMappingURL=chat-message.js.map

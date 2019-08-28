"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockRepository {
    constructor() {
        this.mockDB = new Map();
    }
    pushMessageToDB(meesage) {
        if (meesage.action || meesage.from.name === 'CHATBOT') {
            return;
        }
        let messageArray = this.mockDB.get(meesage.chatRoomName);
        if (!messageArray) {
            messageArray = [];
        }
        if (messageArray.length == 50) {
            messageArray = messageArray.slice(2, 50);
        }
        messageArray.push(meesage);
        this.mockDB.set(meesage.chatRoomName, messageArray);
    }
    getMeesagesFromchatRoom(chatRoomName) {
        return this.mockDB.get(chatRoomName);
    }
}
exports.default = MockRepository;
//# sourceMappingURL=mockRepository.js.map
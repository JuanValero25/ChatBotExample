import {ChatMessage} from 'chat-typescript-models';

export default class MockRepository {

    private mockDB: Map<string, ChatMessage[]> = new Map<string, ChatMessage[]>();

    public pushMessageToDB(meesage: ChatMessage) {
        if (meesage.action || meesage.from.name === 'CHATBOT') {
            return;
        }
        let messageArray = this.mockDB.get(meesage.chatRoomName);
        if (!messageArray) {
            messageArray = []
        }
        if (messageArray.length == 50) {
            messageArray = messageArray.slice(2, 50);
        }
        messageArray.push(meesage);
        this.mockDB.set(meesage.chatRoomName, messageArray)
    }

    public getMeesagesFromchatRoom(chatRoomName: string): ChatMessage[] | undefined {
        return this.mockDB.get(chatRoomName);
    }

}

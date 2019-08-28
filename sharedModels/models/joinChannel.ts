export default class JoinChannel {
    userID: string;
    chatRoomName: string;


    constructor(userID: string, chatRoomName: string) {
        this.userID = userID;
        this.chatRoomName = chatRoomName;
    }
}

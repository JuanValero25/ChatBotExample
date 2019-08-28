"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const express_1 = __importDefault(require("express"));
const chat_typescript_models_1 = require("chat-typescript-models");
const callback_api_1 = require("amqplib/callback_api");
const mockRepository_1 = __importDefault(require("./mockRepository"));
class ChatServer {
    constructor() {
        this.QueueNAME = "StockBot";
        this.mockDB = new mockRepository_1.default();
        this.createApp();
        this.listen();
        (async () => {
            await this.initRabitMQCliente();
            return this; // when done
        })();
    }
    getApp() {
        return this.app;
    }
    createApp() {
        this.app = express_1.default();
        this.port = process.env.PORT || ChatServer.PORT;
        this.server = http_1.createServer(this.app);
        this.io = socket_io_1.default(this.server);
    }
    async initRabitMQCliente() {
        await callback_api_1.connect('amqp://localhost', async (error0, connection) => {
            if (error0) {
                throw error0;
            }
            await connection.createChannel(async (error1, channel) => {
                if (error1) {
                    throw error1;
                }
                const queue = this.QueueNAME;
                channel.assertQueue(queue, {
                    durable: false,
                });
                this.channel = channel;
            });
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.io.on('connect', (socket) => {
            console.log('Connected client on port %s.', this.port);
            socket.on(chat_typescript_models_1.Event.JOINCHATROOM, (roomName) => {
                console.log("chanel joined", roomName);
                socket.join(roomName.chatRoomName);
                socket.join(roomName.userID);
                const messages = this.mockDB.getMeesagesFromchatRoom(roomName.chatRoomName);
                if (messages) {
                    this.io.to(roomName.userID).emit(chat_typescript_models_1.Event.MESSAGE_BULK, messages);
                }
            });
            socket.on(chat_typescript_models_1.Event.MESSAGE, (m) => {
                this.mockDB.pushMessageToDB(m);
                this.io.to(m.chatRoomName).emit(chat_typescript_models_1.Event.MESSAGE, m);
            });
            socket.on(chat_typescript_models_1.Event.MESSAGE_COMMAND, (m) => {
                this.channel.sendToQueue(this.QueueNAME, Buffer.from(JSON.stringify(m)));
            });
            socket.on(chat_typescript_models_1.Event.DISCONNECT, () => {
                console.log('Client disconnected');
            });
        });
    }
}
ChatServer.PORT = 8080;
exports.ChatServer = ChatServer;
//# sourceMappingURL=chat-server.js.map
import {createServer, Server as httpServer} from 'http';
import SocketIO from "socket.io";
import express from 'express';
import {ChatMessage, Event, JoinChannel} from 'chat-typescript-models';
import {Channel, connect} from 'amqplib/callback_api';
import MockRepository from "./mockRepository";

export class ChatServer {
    public static readonly PORT: number = 8080;
    private readonly QueueNAME: string = "StockBot";
    private app: express.Application;
    private server: httpServer;
    private io: SocketIO.Server;
    private channel: Channel;
    private port: string | number;
    private mockDB: MockRepository;

    constructor() {
        this.mockDB = new MockRepository();
        this.createApp();
        this.listen();
        (async () => {
            await this.initRabitMQCliente();
            return this; // when done
        })();
    }

    public getApp(): express.Application {
        return this.app;
    }

    private createApp(): void {
        this.app = express();
        this.port = process.env.PORT || ChatServer.PORT;
        this.server = createServer(this.app);
        this.io = SocketIO(this.server);
    }

    private async initRabitMQCliente() {
        await connect('amqp://localhost', async (error0, connection) => {
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

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.io.on('connect', (socket: SocketIO.Socket) => {
            console.log('Connected client on port %s.', this.port);
            socket.on(Event.JOINCHATROOM, (roomName: JoinChannel) => {
                console.log("chanel joined", roomName);
                socket.join(roomName.chatRoomName);
                socket.join(roomName.userID);
                const messages = this.mockDB.getMeesagesFromchatRoom(roomName.chatRoomName);
                if (messages) {
                    this.io.to(roomName.userID).emit(Event.MESSAGE_BULK, messages)
                }

            });

            socket.on(Event.MESSAGE, (m: ChatMessage) => {
                this.mockDB.pushMessageToDB(m);
                this.io.to(m.chatRoomName).emit(Event.MESSAGE, m);
            });
            socket.on(Event.MESSAGE_COMMAND, (m: ChatMessage) => {
                this.channel.sendToQueue(this.QueueNAME, Buffer.from(JSON.stringify(m)));
            });

            socket.on(Event.DISCONNECT, () => {
                console.log('Client disconnected');
            });
        });
    }
}

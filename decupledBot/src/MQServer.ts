import {createServer, IncomingMessage, Server as httpServer} from 'http';
import {connect} from 'amqplib/callback_api';
import {ChatMessage, Event} from 'chat-typescript-models';
import express from 'express';
import io from 'socket.io-client';
import {request} from "https";

export default class MQServer {

    private app: express.Application;
    private server: httpServer;
    private socketClient: any;
    private readonly API_URL: string = "stooq.com";
    private readonly QueueNAME: string = "StockBot";

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.initSocketClient();
        this.initRabitMQCliente();
    }

    public getApp(): express.Application {
        return this.app;
    }


    private initRabitMQCliente() {
        connect('amqp://localhost', (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }
                channel.assertQueue(this.QueueNAME, {
                    durable: false,
                });
                channel.consume(this.QueueNAME, (message) => {
                    // @ts-ignore
                    const chatMessage: ChatMessage = JSON.parse(message.content.toString());
                    const stockName = chatMessage.message.split("=")[1];
                    this.getRequestByStockCode(stockName).then((response) => {
                        // @ts-ignore
                        chatMessage.message = response
                    }).catch(err => {
                        chatMessage.message = err
                    }).finally(() => {
                        chatMessage.from.name = "CHATBOT";
                        this.socketClient.emit(Event.MESSAGE, chatMessage);
                    });

                });
            });
        });
    }

    private initSocketClient() {
        this.socketClient = io("http://localhost:8080");
    }

    private getRequestByStockCode(stockName: string) {
        return new Promise((resolve, reject) => {
            const opts = {
                host: this.API_URL,
                path: `/q/l/?s=${stockName}&f=sd2t2ohlcv`,
                method: "GET"
            };
            let data = '';
            request(opts, (r: IncomingMessage): void => {
                r.on('data', (chunk: string): void => {
                    data += chunk;
                });
                r.on('end', (): void => {
                    data = this.formatResponseForStock(data);
                    resolve(data);
                    return;
                });
                r.on('error', (err): void => {
                    reject("ChatBot cant handler your request or cant understand it")
                });
            }).end();
        })
    }

    private formatResponseForStock(stockResponse: string): string {
        const values = stockResponse.split(',');
        return `${values[0]} quote is $ ${values[6]} per share`;
    }

}

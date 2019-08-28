"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const callback_api_1 = require("amqplib/callback_api");
const chat_typescript_models_1 = require("chat-typescript-models");
const express_1 = __importDefault(require("express"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const https_1 = require("https");
class MQServer {
    constructor() {
        this.API_URL = "stooq.com";
        this.QueueNAME = "StockBot";
        this.app = express_1.default();
        this.server = http_1.createServer(this.app);
        this.initSocketClient();
        this.initRabitMQCliente();
    }
    getApp() {
        return this.app;
    }
    initRabitMQCliente() {
        callback_api_1.connect('amqp://localhost', (error0, connection) => {
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
                    const chatMessage = JSON.parse(message.content.toString());
                    const stockName = chatMessage.message.split("=")[1];
                    this.getRequestByStockCode(stockName).then((response) => {
                        // @ts-ignore
                        chatMessage.message = response;
                    }).catch(err => {
                        chatMessage.message = err;
                    }).finally(() => {
                        chatMessage.from.name = "CHATBOT";
                        this.socketClient.emit(chat_typescript_models_1.Event.MESSAGE, chatMessage);
                    });
                });
            });
        });
    }
    initSocketClient() {
        this.socketClient = socket_io_client_1.default("http://localhost:8080");
    }
    getRequestByStockCode(stockName) {
        return new Promise((resolve, reject) => {
            const opts = {
                host: this.API_URL,
                path: `/q/l/?s=${stockName}&f=sd2t2ohlcv`,
                method: "GET"
            };
            let data = '';
            https_1.request(opts, (r) => {
                r.on('data', (chunk) => {
                    data += chunk;
                });
                r.on('end', () => {
                    data = this.formatResponseForStock(data);
                    resolve(data);
                    return;
                });
                r.on('error', (err) => {
                    reject("ChatBot cant handler your request or cant understand it");
                });
            }).end();
        });
    }
    formatResponseForStock(stockResponse) {
        const values = stockResponse.split(',');
        return `${values[0]} quote is $ ${values[6]} per share`;
    }
}
exports.default = MQServer;
//# sourceMappingURL=MQServer.js.map
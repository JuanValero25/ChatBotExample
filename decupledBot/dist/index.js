"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MQServer_1 = __importDefault(require("./MQServer"));
const app = new MQServer_1.default().getApp();
exports.app = app;
//# sourceMappingURL=index.js.map
import * as WebSocket from "ws";
import { MessageBase } from "../../infotainment-pi-core/core";

export class MessageWithSender {
    constructor(public message: MessageBase, public who: WebSocket) { }
}

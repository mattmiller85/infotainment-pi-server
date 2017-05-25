import { MessageBase } from "../../infotainment-pi-core/core";
import { WebSocket } from "ws";

export class MessageWithSender
{
    constructor(message: MessageBase, who: WebSocket){}

    message: MessageBase;
    who: WebSocket;
}
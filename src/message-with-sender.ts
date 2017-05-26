import { MessageBase } from "../../infotainment-pi-core/core";
import { WebSocket } from "ws";

export class MessageWithSender
{
    constructor(public message: MessageBase, public who: WebSocket){}
}
import { MessageWithSender } from './message-with-sender';
import { Server, WebSocket } from "ws";
import { GreetingMessage, MessageBase, MessageType, MessageReader } from "../../infotainment-pi-core/core";
import { Subject } from "rxjs/Rx";

export class InfotainmentPiServer {
    constructor(private server: Server, private messageReader: MessageReader) {
        server.on("error", (err) => { console.log(err); });
        server.on("connection", (ws) => {
            console.log("blah");
            ws.send(JSON.stringify(new GreetingMessage()));
            ws.on("message", (msg) => {
                console.log("message");
                this.message.next(new MessageWithSender(messageReader.getMessage(msg), ws));
            });
        });
    }

    message: Subject<MessageWithSender> = new Subject<MessageWithSender>();

    sendMessage<T extends MessageBase>(message: T, toWhom: WebSocket){
        toWhom.send(JSON.stringify(message));
    }

    broadcastMessage<T extends MessageBase>(message: T){
        this.server.clients.forEach(c => c.send(message));
    }
}
import { InfotainmentPiServer } from './infotainment-pi-server';
import { Server } from "ws";
import { MessageReader, MessageType, ReturnAllTilesMessage } from "../../infotainment-pi-core/core";

let server = new InfotainmentPiServer(new Server({ port: 12345 }), new MessageReader());
console.log("test");
server.message.subscribe(msg => {
    if(msg.message.type == MessageType.askForAllTiles){
        console.log(msg);
        server.sendMessage(new ReturnAllTilesMessage(), msg.who);
    }
});
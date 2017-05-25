import { InfotainmentPiServer } from './infotainment-pi-server';
import { Server } from "ws";
import { MessageReader, MessageType } from "../../infotainment-pi-core/core";

let server = new InfotainmentPiServer(new Server({ port: 12345 }), new MessageReader());
server.message.subscribe(msg => {
    if(msg.message.type == MessageType.askForAllTiles){
        //server.sendMessage(new )
    }
});
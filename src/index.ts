import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { InfotainmentPiServer } from './infotainment-pi-server';
import { Server } from "ws";
import { MessageReader, MessageType, ReturnAllTilesMessage, SingleAudioFileTile } from "../../infotainment-pi-core/core";

let repo = new InfotainmentPiRepository();
let server = new InfotainmentPiServer(new Server({ port: 12345 }), new MessageReader());
console.log("Listening on port 12345...");
server.message.subscribe(msg => {
    if(msg.message.type == MessageType.askForAllTiles){
        repo.getTiles().then((tiles) => {
            server.sendMessage(new ReturnAllTilesMessage(tiles), msg.who);
        });
    }
});

// repo.getTiles().then((tiles) => { 
//     console.log(tiles) 
// }).catch((reason) => {
//     console.log(reason);
// });

// repo.getNextId().then((next_id) => { 
//     console.log(next_id);
//     let newTile = new SingleAudioFileTile();
//     newTile.description = 'Testing description';
//     newTile.name = "test tile name";
//     newTile.path_to_audio = "/path/to/audio.mp3";
//     repo.addTile(next_id, newTile);
// }).catch((reason) => {
//     console.log(reason);
// });
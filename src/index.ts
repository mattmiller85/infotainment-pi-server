import { InfotainmentPiAudioManager } from './infotainment-pi-audio-manager';
import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { InfotainmentPiServer } from './infotainment-pi-server';
import { Server } from "ws";
import { MessageReader, TileType, MessageType, GetTileByIdMessage, ReturnAllTilesMessage, ReturnTileMessage, SingleAudioFileTile } from "../../infotainment-pi-core/core";

let server = new InfotainmentPiServer(new Server({ port: 12345 }), new MessageReader(), new InfotainmentPiRepository(), new InfotainmentPiAudioManager());
console.log("Listening on port 12345...");

// repo.getTiles().then((tiles) => { 
//     console.log(tiles) 
// }).catch((reason) => {
//     console.log(reason);
// });

//  repo.getNextId().then((next_id) => { 
//      console.log(next_id);
//      let newTile = new SingleAudioFileTile();
//      newTile.id = next_id;
//      newTile.description = 'Testing description';
//      newTile.name = "test tile name";
//      newTile.path_to_audio = "/path/to/audio.mp3";
//      repo.addTile(next_id, newTile);
//  }).catch((reason) => {
//      console.log(reason);
//  });
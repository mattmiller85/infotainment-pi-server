import { Server } from 'ws';

import { MessageReader } from '../../infotainment-pi-core/core';
import { InfotainmentPiAudioManager } from './infotainment-pi-audio-manager';
import { InfotainmentPiOBDIIDataRepository } from './infotainment-pi-obdII-data-repository';
import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { InfotainmentPiServer } from './infotainment-pi-server';

const server = new InfotainmentPiServer(new Server({ port: 12345 }),
    new MessageReader(),
    new InfotainmentPiRepository(),
    new InfotainmentPiAudioManager(),
    new InfotainmentPiOBDIIDataRepository());

console.log("Listening on port 12345...");

// let obdRepo = new InfotainmentPiOBDIIDataRepository();

// obdRepo.pidList.subscribe(lst => {
//     console.log(lst);
// });
// obdRepo.getCodeList();

// let repo = new InfotainmentPiRepository();
// repo.getTiles().then((tiles) => {
//     tiles.forEach(t => {
//         if(t.type == TileType.single_audio_file){
//             (t as SingleAudioFileTile).duration_seconds = 120;
//             repo.addTile(t.id, t);
//         }
//     });
// }).catch((reason) => {
//     console.log(reason);
// });

//  repo.getNextId().then((next_id) => {
//      console.log(next_id);
//      let newTile = new DigitalOBDIISensorTile();
//      newTile.id = next_id;
//      newTile.description = 'Testing OBDII Sensor';
//      newTile.name = "Speed";
//      newTile.sensor_number = 3;
//      newTile.sensor_code = "speed";
//      repo.addTile(next_id, newTile);
//  }).catch((reason) => {
//      console.log(reason);
//  });

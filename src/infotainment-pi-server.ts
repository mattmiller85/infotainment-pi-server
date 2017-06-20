import {
    AddUpdateTileMessage,
    DigitalOBDIISensorTile,
    GetTileByIdMessage,
    GreetingMessage,
    MessageBase,
    MessageReader,
    MessageType,
    OBDReadingMessage,
    PlayAudioFileMessage,
    ReturnAllTilesMessage,
    ReturnTileMessage,
    SingleAudioFileTile,
    SongStatusMessage,
    TileType,
    TileUpdatedMessage
} from '../../infotainment-pi-core/core';
import { InfotainmentPiAudioManager } from './infotainment-pi-audio-manager';
import { InfotainmentPiOBDIIDataRepository } from './infotainment-pi-obdII-data-repository';
import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { MessageWithSender } from './message-with-sender';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Server, WebSocket } from 'ws';

export class InfotainmentPiServer {

    private currentSongSub: Subscription;
    private currentSongTilePlaying: SingleAudioFileTile;

    constructor(private server: Server, private messageReader: MessageReader, private repo: InfotainmentPiRepository, private audioManager: InfotainmentPiAudioManager, private obd2Repo: InfotainmentPiOBDIIDataRepository) {

        server.on("error", console.log);

        repo.getTiles().then((allTiles) => {
            
            let hasOBDTile = false; 
            allTiles.filter(t => t.type == TileType.digital_obd_ii_sensor).forEach(t => {
                hasOBDTile = true;
                let obdTile = t as DigitalOBDIISensorTile;
                this.obd2Repo.startReading(obdTile.sensor_number);
            });

            if(hasOBDTile){
                this.obd2Repo.reading.subscribe(reading => {
                    let tile = allTiles.filter(t => t.type == TileType.digital_obd_ii_sensor).find(t => (t as DigitalOBDIISensorTile).sensor_number == reading.sensor_number) as DigitalOBDIISensorTile;
                    this.broadcastMessage(new OBDReadingMessage(tile, reading.value));
                });
            }

            server.on("connection", (ws) => {
                ws.send(JSON.stringify(new GreetingMessage()));
                console.log(`Received a connection from ${ws}.`);
                ws.on("message", (msg) => {
                    var theMessage = messageReader.getMessage(msg);
                    console.log(`Received a ${MessageType[theMessage.type]} message: ${JSON.stringify(theMessage)}.`);
                    this.message.next(new MessageWithSender(theMessage, ws));
                });
            });

            this.message.subscribe(msg => {
                switch(msg.message.type){
                    case MessageType.askForAllTiles:
                        this.sendMessage(new ReturnAllTilesMessage(allTiles), msg.who);
                        break;
                    case MessageType.getTileById:
                        var tileByIdMessage = msg.message as GetTileByIdMessage;
                        this.sendMessage(new ReturnTileMessage(allTiles.filter((tile) => tile.id == tileByIdMessage.id)[0]), msg.who);
                        break;
                    case MessageType.playAudioFile:
                        let playMessage = msg.message as PlayAudioFileMessage;
                        if(this.currentSongSub != null){
                            this.currentSongTilePlaying = null;                    
                            this.currentSongSub.unsubscribe();//a new song is playing, stop giving updates for the old one
                        }
                        audioManager.playFile(playMessage.tile.path_to_audio).then(() => {
                            this.currentSongTilePlaying = playMessage.tile as SingleAudioFileTile;
                            this.currentSongSub = Observable.timer(0, 1000).subscribe(x => this.broadcastMessage(new SongStatusMessage(playMessage.tile as SingleAudioFileTile, x)));
                        });
                        break;
                    case MessageType.stopAudioFile:
                        if(this.currentSongSub != null){
                            this.currentSongSub.unsubscribe();//song stopped playing, stop giving updates for the old one
                        }
                        audioManager.stopPlaying().then(() => {
                            this.broadcastMessage(new SongStatusMessage(this.currentSongTilePlaying, -1));
                        });
                        break;
                    case MessageType.addUpdateTile:
                        let addUpdate = msg.message as AddUpdateTileMessage;
                        if(addUpdate.tile.id > 0){
                            repo.addTile(addUpdate.tile.id, addUpdate.tile).then((success) => this.broadcastMessage(new TileUpdatedMessage(addUpdate.tile, "updated")));
                        }
                        else{
                            repo.getNextId().then((next_id) => {
                                addUpdate.tile.id = next_id;
                                repo.addTile(addUpdate.tile.id, addUpdate.tile).then((success) => this.broadcastMessage(new TileUpdatedMessage(addUpdate.tile, "added")));
                            }).catch((reason) => {
                                console.log(reason);
                            });
                        }
                        
                        break;
                }
            });
        });
    }

    private message: Subject<MessageWithSender> = new Subject<MessageWithSender>();

    private sendMessage<T extends MessageBase>(message: T, toWhom: WebSocket) {
        toWhom.send(JSON.stringify(message));
    }

    private broadcastMessage<T extends MessageBase>(message: T) {
        this.server.clients.forEach(c => c.send(JSON.stringify(message)));
    }
}
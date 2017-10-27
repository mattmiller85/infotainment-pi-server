// tslint:disable:no-console

import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Server } from 'ws';
// tslint:disable-next-line:no-duplicate-imports
import * as WebSocket from 'ws';
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
    TileBase,
    TileType,
    TileUpdatedMessage,
} from '../../infotainment-pi-core/core';
import { InfotainmentPiAudioManager } from './infotainment-pi-audio-manager';
import { InfotainmentPiOBDIIDataRepository } from './infotainment-pi-obdII-data-repository';
import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { MessageWithSender } from './message-with-sender';

export class InfotainmentPiServer {

    private currentSongSub: Subscription;
    private currentSongTilePlaying: SingleAudioFileTile;
    private message: Subject<MessageWithSender> = new Subject<MessageWithSender>();
    private alreadyReading = new Array<number>();

    constructor(private server: Server, private messageReader: MessageReader,
        private repo: InfotainmentPiRepository, private audioManager: InfotainmentPiAudioManager,
        private obd2Repo: InfotainmentPiOBDIIDataRepository) {

        server.on("error", console.log);

        audioManager.on("stopped", () => {
            this.broadcastMessage(new SongStatusMessage(this.currentSongTilePlaying, -1));
        });

        repo.getTiles().then((allTiles) => {

            this.initOBD2Tiles(allTiles);

            server.on("connection", (ws) => {
                ws.send(JSON.stringify(new GreetingMessage()));

                ws.on("message", (msg) => {
                    const theMessage = messageReader.getMessage(msg);
                    console.log(`Received a ${MessageType[theMessage.type]} message from ` +
                        `${JSON.stringify((ws as any)._sender._socket.address())}: ${JSON.stringify(theMessage)}.`);
                    this.message.next(new MessageWithSender(theMessage, ws));
                });
            });

            this.message.subscribe((msg) => {
                repo.getTiles().then((tiles) => {
                    allTiles = tiles;
                    this.handleMessage(msg, allTiles, audioManager, repo);
                });

            });
        });
    }

    private sendMessage<T extends MessageBase>(message: T, toWhom: WebSocket) {
        toWhom.send(JSON.stringify(message));
    }

    private broadcastMessage<T extends MessageBase>(message: T) {
        this.server.clients.forEach((c) => c.send(JSON.stringify(message)));
    }

    private initOBD2Tiles(allTiles: TileBase[]) {
        let hasOBDTile = false;
        allTiles.filter((tile) => tile.type === TileType.digital_obd_ii_sensor)
            .map((t: DigitalOBDIISensorTile) => t.sensor_number)
            .filter((v, i, a) => a.indexOf(v) === i)
            .forEach((sensorNumber) => {
                hasOBDTile = true;
                if (!this.alreadyReading.some(s => s === sensorNumber)) {
                    this.obd2Repo.startReading(sensorNumber);
                    this.alreadyReading.push(sensorNumber);
                    console.log(`started reading sensor ${sensorNumber}`);
                }
            });
        if (hasOBDTile) {
            this.obd2Repo.reading.subscribe((reading) => {
                const tile = allTiles.filter((t) => t.type === TileType.digital_obd_ii_sensor
                    && (t as DigitalOBDIISensorTile).sensor_number == reading.sensor_number).forEach((t) =>
                        this.broadcastMessage(new OBDReadingMessage((t as DigitalOBDIISensorTile), reading.value)));
            });
        }
    }

    private handleMessage(msg: MessageWithSender, allTiles: TileBase[],
        audioManager: InfotainmentPiAudioManager, repo: InfotainmentPiRepository) {
        switch (msg.message.type) {
            case MessageType.askForAllTiles:
                this.sendMessage(new ReturnAllTilesMessage(allTiles), msg.who);
                break;
            case MessageType.getTileById:
                const tileByIdMessage = msg.message as GetTileByIdMessage;
                this.sendMessage(new ReturnTileMessage(allTiles.filter((tile) => tile.id === tileByIdMessage.id)[0]), msg.who);
                break;
            case MessageType.playAudioFile:
                const playMessage = msg.message as PlayAudioFileMessage;
                if (this.currentSongSub) {
                    this.currentSongTilePlaying = null;
                    this.currentSongSub.unsubscribe(); // a new song is playing, stop giving updates for the old one
                }
                audioManager.playFile(playMessage.tile.path_to_audio).then((duration) => {
                    this.currentSongTilePlaying = playMessage.tile as SingleAudioFileTile;
                    this.currentSongTilePlaying.duration_seconds = duration;
                    this.currentSongSub = Observable.timer(0, 1000).subscribe((x) =>
                        this.broadcastMessage(new SongStatusMessage(playMessage.tile as SingleAudioFileTile, x)));
                });
                break;
            case MessageType.stopAudioFile:
                if (this.currentSongSub) {
                    this.currentSongSub.unsubscribe(); // song stopped playing, stop giving updates for the old one
                }
                this.audioManager.stopPlaying();
                break;
            case MessageType.addUpdateTile:
                const addUpdate = msg.message as AddUpdateTileMessage;
                if (addUpdate.tile.id > 0) {
                    repo.setTile(addUpdate.tile.id, addUpdate.tile).then((success) => {
                        this.broadcastMessage(new TileUpdatedMessage(addUpdate.tile, "updated"));
                        repo.getTiles().then((all) => {
                            allTiles = all;
                            this.broadcastMessage(new ReturnAllTilesMessage(all));
                        });
                    });
                } else {
                    repo.getNextId().then((nextId) => {
                        addUpdate.tile.id = nextId;
                        repo.setTile(addUpdate.tile.id, addUpdate.tile).then((success) => {
                            this.broadcastMessage(new TileUpdatedMessage(addUpdate.tile, "added"));
                            allTiles.push(addUpdate.tile);
                            if (addUpdate.tile.type === TileType.digital_obd_ii_sensor) {
                                this.initOBD2Tiles([addUpdate.tile]);
                            }
                            this.broadcastMessage(new ReturnAllTilesMessage(allTiles));
                        });
                    }).catch((reason) => {
                        console.log(reason);
                    });
                }
                break;
        }
    }
}

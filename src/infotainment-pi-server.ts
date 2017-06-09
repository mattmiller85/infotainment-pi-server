import { InfotainmentPiAudioManager } from './infotainment-pi-audio-manager';
import { InfotainmentPiRepository } from './infotainment-pi-repository';
import { MessageWithSender } from './message-with-sender';
import { Server, WebSocket } from "ws";
import {
    GreetingMessage, MessageBase, MessageType, MessageReader,
    ReturnAllTilesMessage, GetTileByIdMessage, ReturnTileMessage,
    PlayAudioFileMessage, SongStatusMessage, SingleAudioFileTile
} from "../../infotainment-pi-core/core";
import { Observable, Subject, Subscription } from 'rxjs/Rx';

export class InfotainmentPiServer {

    private currentSongSub: Subscription;
    private currentSongTilePlaying: SingleAudioFileTile;

    constructor(private server: Server, private messageReader: MessageReader, private repo: InfotainmentPiRepository, private audioManager: InfotainmentPiAudioManager) {

        server.on("error", console.log);

        server.on("connection", (ws) => {
            ws.send(JSON.stringify(new GreetingMessage()));
            ws.on("message", (msg) => {
                var theMessage = messageReader.getMessage(msg);
                console.log(`Received a ${theMessage.type} message.`);
                this.message.next(new MessageWithSender(theMessage, ws));
            });
        });

        this.message.subscribe(msg => {
            if (msg.message.type == MessageType.askForAllTiles) {
                repo.getTiles().then((tiles) => {
                    this.sendMessage(new ReturnAllTilesMessage(tiles), msg.who);
                });
            }
            if (msg.message.type == MessageType.getTileById) {
                repo.getTiles().then((tiles) => {
                    var tileByIdMessage = msg.message as GetTileByIdMessage;
                    //TODO - Add get tile by id thing to repository
                    this.sendMessage(new ReturnTileMessage(tiles.filter((tile) => tile.id == tileByIdMessage.id)[0]), msg.who);
                });
            }
            if (msg.message.type == MessageType.playAudioFile) {
                var playMessage = msg.message as PlayAudioFileMessage;
                if(this.currentSongSub != null){
                    this.currentSongTilePlaying = null;                    
                    this.currentSongSub.unsubscribe();//a new song is playing, stop giving updates for the old one
                }
                audioManager.playFile(playMessage.tile.path_to_audio).then(() => {
                    this.currentSongTilePlaying = playMessage.tile as SingleAudioFileTile;
                    this.currentSongSub = Observable.timer(0, 1000).subscribe((x) => this.broadcastMessage(new SongStatusMessage(playMessage.tile as SingleAudioFileTile, x)));
                });
            }

            if (msg.message.type == MessageType.stopAudioFile) {
                if(this.currentSongSub != null){
                    this.currentSongSub.unsubscribe();//song stopped playing, stop giving updates for the old one
                }
                audioManager.stopPlaying().then(() => {
                    this.broadcastMessage(new SongStatusMessage(this.currentSongTilePlaying, -1));
                });
            }
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
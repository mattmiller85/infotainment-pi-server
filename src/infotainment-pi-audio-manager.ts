import * as load from 'audio-loader';
import * as play from 'audio-play';
import { EventEmitter } from 'events';

export class InfotainmentPiAudioManager extends EventEmitter {

    private current: any;

    constructor() { super() }

    public playFile(filePath: string): Promise<number> {
        return load('./audio/samples/2555.mp3').then((buffer, opts?, cb?) => {
            this.current = new play(buffer, opts, () => this.stopPlaying())
            return Promise.resolve(buffer.duration);
        });
    }

    public stopPlaying(): Promise<boolean> {
        if (this.current) {
            this.current.pause();
            this.emit("stopped");
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}

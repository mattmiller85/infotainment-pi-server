//import { Player } from "player";

export class InfotainmentPiAudioManager{
    
    constructor() {

    }

    playFile(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try{
                //this._client.set(`tile:${tileId}`, JSON.stringify(tile), (err: any, id: any) => { resolve(true) })
                resolve(true);
            }catch(ex){
                reject(ex);
            }
        });
    }

    stopPlaying(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try{
                //this._client.set(`tile:${tileId}`, JSON.stringify(tile), (err: any, id: any) => { resolve(true) })
                resolve(true);
            }catch(ex){
                reject(ex);
            }
        });
    }
}
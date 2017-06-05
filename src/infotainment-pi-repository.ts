import { tryCatch } from 'rxjs/util/tryCatch';
import * as redis from 'redis';
import { TileBase } from "../../infotainment-pi-core/core"

export class InfotainmentPiRepository{
    private _client: redis.RedisClient;

    constructor() {
        this._client = redis.createClient(6379, "localhost");    
    }

    addTile(tileId: number, tile: TileBase): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try{
                this._client.set(`tile:${tileId}`, JSON.stringify(tile), (err: any, id: any) => { resolve(true) })
            }catch(ex){
                reject(ex);
            }
        });
    }

    getNextId(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try{
                this._client.incr("next_tile_id", (err:any, id: any) => { resolve(id) })
            }catch(ex){
                reject(ex);
            }
        }); 
    }

    getTiles(): Promise<TileBase[]> {
        return new Promise<TileBase[]>((resolve, reject) => {
            try{
                this._client.keys("tile:*", (err:any, keys:any) => {
                    this._client.mget(keys, (err:any, tiles: any) => {
                        for(let i=0; i<keys.length; i++){
                            tiles[i] = JSON.parse(tiles[i]);
                            tiles[i].id = parseInt(keys[i].substring(5))
                        }
                        resolve(tiles);
                    })
                });
            }catch(ex){
                reject(ex);
            }
        });
    }
}
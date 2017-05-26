import * as redis from 'redis';
import { TileBase } from "../../infotainment-pi-core/core"

export class InfotainmentPiRepository{
    private _client: redis.RedisClient;

    constructor() {
        this._client = redis.createClient(6379, "localhost");    
    }

    addTile(tileId: number, tile: TileBase){
        this._client.hset("tiles", tile);
    }

    getTiles(){
        return this._client.get("tiles", (tiles) => {
            console.log(tiles);
        });
    }
}
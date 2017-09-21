import * as redis from 'redis';

import { TileBase } from '../../infotainment-pi-core/core';
import { Config } from './config';

export class InfotainmentPiRepository {
    private client: redis.RedisClient;

    constructor() {
        this.client = redis.createClient(Config.RedisPort, Config.RedisHost);
    }

    public addTile(tileId: number, tile: TileBase): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                tile.id = tileId;
                this.client.set(`tile:${tileId}`, JSON.stringify(tile), (err: any, id: any) => { resolve(true) })
            }catch (ex) {
                reject(ex);
            }
        });
    }

    public getNextId(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                this.client.incr("next_tile_id", (err: any, id: any) => { resolve(id) })
            }catch (ex) {
                reject(ex);
            }
        });
    }

    public getTiles(): Promise<TileBase[]> {
        return new Promise<TileBase[]>((resolve, reject) => {
            try {
                this.client.keys("tile:*", (err: any, keys: any) => {
                    this.client.mget(keys, (e: any, tiles: any) => {
                        for (let i = 0; i < keys.length; i++) {
                            tiles[i] = JSON.parse(tiles[i]);
                            tiles[i].id = parseInt(keys[i].substring(5), 10)
                        }
                        resolve(tiles);
                    })
                });
            }catch (ex) {
                reject(ex);
            }
        });
    }
}

import { InfotainmentPiServer } from './infotainment-pi-server';
import { Server } from "ws";
import { MessageReader } from "../../infotainment-pi-core/core";

let server = new InfotainmentPiServer(new Server({ port: 12345 }), new MessageReader());

import events    = require("events");
export class obd extends events.EventEmitter
{
    // public DTC : _dtc.OBD2.Core.DTC;
    // public PID : _pid.OBD2.Core.PID;
    // public OBD : _obd.OBD2.Core.OBD;
    // public Ticker : _ticker.OBD2.Core.Ticker;
    // public Device : _device.OBD2.Device.Main;
    // public Serial : obd2.OBD2_SerialInterface;

    // private _options : obd2.OBD2_IOptions;

    constructor( options : any )
    start( callback: any )
    sendAT( atCommand : string )
    listPID( callBack : any )
}
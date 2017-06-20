import obd = require('obd2');

import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';

export class InfotainmentPiOBDIIDataRepository{
    private _obd: obd;
    private _obdStarted: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _obdFailed: BehaviorSubject<any> = new BehaviorSubject(false);
    
    reading: Subject<{ sensor_number: number, value: number }> = new Subject();

    pidList: Subject<Array<string>> = new Subject();

    constructor() {
        
        try{
            this._obd = new obd({
                device  : "ELM327", // Device type
                serial  : "fake",   // usb, bluetooth
                port    : "COM6",   // Device COM port / path
                baud    : 38400,    // Device baud rate
                delay   : 50,       // Ticker delay time (ms)
                cleaner : true      // Automatic ticker list cleaner ( ex. PID not supported, no response )
            });
            this._obd.start(() => {
                this._obdStarted.next(true);
            });
        }
        catch(err){
            this._obdFailed.next(err);
        }
    }

    getCodeList(){
        this.pidList.next(this._obd.PID.getListPID());
    }

    startReading(sensor_number: number): void {
        if(!this._obdStarted.getValue())
            return null;
        
        //this._obd.listDTC();
        //faker
        Observable.interval(1000).subscribe(i => {
            this.reading.next({ sensor_number: 3, value: 29 });
        });

        this._obd.on("dataParsed", ( type, elem, data ) =>
        {
            this.reading.next(data);
            //io.emit('obd2', type, elem, data );
        });

        this._obd.on("pid", ( data ) =>
        {
            //io.emit('pid', data );
        });

        this._obd.on("dtc", ( data ) =>
        {
            //io.emit('dtcList', data );
        });

    /* Extra usage code
        OBD.listPID(( pidList ) =>
        {
            // io.emit list
            io.emit('pidList', pidList );
            // io.emit pid
            OBD.readPID( "0C" );
            // io.emit pid & vss
            OBD.readPID( "0D", function( data )
            {
                io.emit('vss', data );
            });
            // Unavailable, auto clean
            OBD.readPID( "99" );
        });
*/
    }
}
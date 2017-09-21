import obd = require('obd2');

import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';

export class InfotainmentPiOBDIIDataRepository {

    public reading: Subject<{ sensor_number: number, value: number }> = new Subject();
    public pidList: Subject<string[]> = new Subject();

    private obd: obd;
    private obdStarted: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private obdFailed: BehaviorSubject<any> = new BehaviorSubject(false);

    constructor() {

        try {
            this.obd = new obd({
                device  : "ELM327", // Device type
                serial  : "fake",   // usb, bluetooth
                // tslint:disable-next-line:object-literal-sort-keys
                port    : "COM6",   // Device COM port / path
                baud    : 38400,    // Device baud rate
                delay   : 50,       // Ticker delay time (ms)
                cleaner : true,      // Automatic ticker list cleaner ( ex. PID not supported, no response )
            });
            this.obd.start(() => {
                this.obdStarted.next(true);
            });
        }catch (err) {
            this.obdFailed.next(err);
        }
    }

    public getCodeList() {
        this.pidList.next(this.obd.PID.getListPID());
    }

    public startReading(sensorNumber: number): void {
        if (!this.obdStarted.getValue()) {
            return null;
        }

        // this._obd.listDTC();
        // faker
        Observable.interval(1000).subscribe((i) => {
            this.reading.next({ sensor_number: 3, value: 29 });
        });

        this.obd.on("dataParsed", (type, elem, data) => {
            this.reading.next(data);
            // io.emit('obd2', type, elem, data );
        });

        this.obd.on("pid", (data) => {
            // io.emit('pid', data );
        });

        this.obd.on("dtc", (data) => {
            // io.emit('dtcList', data );
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

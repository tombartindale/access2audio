"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import 'rpi-oled' -- will only work on linux systems
const mic = require("mic");
const events_1 = require("events");
const express = require("express");
const expressWebSocket = require("express-ws");
const websocketStream = require("websocket-stream/stream");
class Access2Audio extends events_1.EventEmitter {
    constructor() {
        super();
        this.clients = [];
        this.micInputStream = null;
        const app = express();
        app.use('/', express.static('../web/public'));
        // extend express app with app.ws()
        expressWebSocket(app, null, {
            // ws options here
            perMessageDeflate: false,
        });
        app.ws('/live', (ws, req) => {
            // convert ws instance to stream
            const stream = websocketStream(ws, {
                // websocket-stream options here
                binary: true,
            });
            console.log('client connected');
            ws.on('close', () => {
                this.clients = this.clients.filter(o => o !== stream);
                this.updateStats();
            });
            this.clients.push(stream);
            this.micInputStream.pipe(stream);
            this.updateStats();
        });
        app.listen(3000);
        var micInstance = mic({
            rate: '8k',
            channels: '1',
            device: 'hw:0,1',
            // debug: true,
            exitOnSilence: 10000000000
        });
        this.micInputStream = micInstance.getAudioStream();
        // this.emit('hello', 'cheese');
        // var outputFileStream = fs.WriteStream('output.raw');
        // micInputStream.pipe(outputFileStream);
        //pipe directly?
        this.micInputStream.on('data', (data) => {
            console.log("Recieved Input Stream: " + data.length);
            //for each stream, push to pipe:
            // for (let s of this.clients)
            // {
            //     (s as Writable).write(data);
            // }
            //calculate RMS:
            // let rms = 0;
            // for (let d of data)
            // {
            //     rms += Math.pow(d,2);
            // }
            // rms = Math.sqrt(rms / data.length);
            // // 10*log10(P2/P1)
            // console.log(data.length);
            // console.log(rms);
        });
        this.micInputStream.on('error', function (err) {
            console.log("Error in Input Stream: " + err);
        });
        // micInputStream.on('startComplete', function () {
        //     // console.log("Got SIGNAL startComplete");
        //     // setTimeout(function () {
        //     //     micInstance.pause();
        //     // }, 5000);
        // });
        // micInputStream.on('stopComplete', function () {
        //     console.log("Got SIGNAL stopComplete");
        // });
        // micInputStream.on('pauseComplete', function () {
        //     // console.log("Got SIGNAL pauseComplete");
        //     // setTimeout(function () {
        //     //     micInstance.resume();
        //     // }, 5000);
        // });
        // micInputStream.on('resumeComplete', function () {
        //     // console.log("Got SIGNAL resumeComplete");
        //     // setTimeout(function () {
        //     //     micInstance.stop();
        //     // }, 5000);
        // });
        // micInputStream.on('silence', function () {
        //     console.log("Got SIGNAL silence");
        // });
        // micInputStream.on('processExitComplete', function () {
        //     console.log("Got SIGNAL processExitComplete");
        // });
        //open mic:
        micInstance.start();
    }
    updateStats() {
        console.log(`Clients: ${this.clients.length}`);
    }
}
let audio = new Access2Audio();
// while(true);
//# sourceMappingURL=index.js.map
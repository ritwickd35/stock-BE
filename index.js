import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import instruments from "./instruments.js"
import fs from 'fs';
import Piscina from 'piscina';
import cors from 'cors';

// creating express server
const app = express();

// enabling CORS from all origins
app.use(cors())

// creating socket io server
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

// creating a thread pool for the mock data generator
const piscina = new Piscina({
    filename: './mockgenerator.js',
    minThreads: 2,
    idleTimeout: 100,
})

io.on("connection", (socket) => {
    console.log(`Connected to client with ${socket.id}`)
    global.socket = socket;
})

const port = "5555";
const socketPort = "5556";

app.get("/generate-data", (req, res) => {

    const start = new Date().getTime();

    let { interval, totalRecords } = req.query;

    res.type('text/html')

    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send("Invalid interval given. Mock data generation interval can be hourly or daily")
    }

    if (!totalRecords || isNaN(Number(totalRecords)))
        totalRecords = 5000;


    piscina.run({ interval, totalRecords }).then(({ err, success }) => {
        if (err) global.socket.emit("mock-data", { err, success })
        else {
            console.log(`Got task from worker success:${success}. Time taken is ${new Date().getTime() - start} ms for ${totalRecords} records`)
            if (global.socket) {
                console.log("emitting task status to connected socket")
                global.socket.emit("mock-data", { err, success })
            }
        }
    })

    console.log("New worker initialised")

    return void res.status(200).send("Data Generation Started")
})

app.get("/instruments", (req, res) => {
    res.type('json');
    res.status(200).send(instruments)
})

app.get("/search", (req, res) => {
    const { symbol, interval } = req.query;
    res.type('json');
    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send({ status: "failure", data: "Invalid interval given. Mock data generation interval can be hourly or daily" })
    }
    if (!instruments.includes(symbol)) {
        return void res.status(400).send({ status: "failure", data: "Invalid symbol given." })
    }

    // creating a stream from the file and piping the file to the response object
    const fileReadStream = fs.createReadStream(`./stockData/${symbol + interval}.json`);
    fileReadStream.on('error', err => {
        return void res.status(404).send({ status: "failure", data: err.message })

    })
    fileReadStream.pipe(res);
})

app.listen(port)
io.listen(socketPort)

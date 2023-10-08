import express from "express";
import { Worker } from "worker_threads";;
import { Server } from "socket.io";
import { createServer } from "http";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


io.on("connection", (socket) => {
    console.log(`Connected to client with ${socket.id}`)
    global.socket = socket;
})

const port = "5555";
const socketPort = "5556";

app.get("/generate-data", (req, res) => {

    let { interval, totalRecords } = req.query;
    console.log(interval, interval != "hourly" || interval != "daily")
    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send("Invalid interval given. Mock data generation interval can be hourly or daily")
    }

    if (!totalRecords || isNaN(Number(totalRecords)))
        totalRecords = 5000;


    const worker = new Worker("./mockgenerator.js", {
        workerData: {
            interval, totalRecords
        }
    })

    console.log("New worker initialised")

    worker.on('message', (result) => {
        console.log(`Got message from worker ${result}`)
        if (global.socket) global.socket.emit("mock-data", result)
    })

    return void res.status(200).send("Data Generation Started")
})

app.listen(port)
io.listen(socketPort)

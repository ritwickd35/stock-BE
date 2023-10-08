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

    const interval = req.query.interval;
    console.log(interval, interval != "hourly" || interval != "daily")
    if (interval !== "hourly" && interval !== "daily") {
        return void res.status(400).send("Invalid interval given. Mock data generation interval can be hourly or daily")
    }
    const worker = new Worker("./mockgenerator.js", {
        workerData: {
            interval
        }
    })

    console.log("New worker initialised")

    worker.on('message', (result) => {
        console.log(`Got message from worker ${result}`)
        global.socket.emit("mock-data", result)
    })

    return void res.status(200).send("Data Generation Started")
})

app.listen(port)
io.listen(socketPort)

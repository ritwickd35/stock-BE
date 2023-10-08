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

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from 'cors';
import routes from './routes/index.js'

// creating express server
const app = express();

// enabling CORS from all origins
app.use(cors())

// creating socket io server with cors enabled
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

// saving the global socket instance for communication to the frontend
io.on("connection", (socket) => {
    console.log(`Connected to client with ${socket.id}`)
    global.socket = socket;
})

const port = "5555";
const socketPort = "5556";

// registering routes
app.use('/api', routes)


// listening to port
httpServer.listen(port)


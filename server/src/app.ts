import express from "express";
import "dotenv/config";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (data) => {
    console.log('Message received: ', data);
    socket.emit('message', `Echo: ${data}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.json());
app.use(pinoHttp({ logger, useLevel: "trace" }));

let switchIsOn = false

app.get("/switch/state", (req, res) => {
  res.status(200).send(switchIsOn)
})

export default server;

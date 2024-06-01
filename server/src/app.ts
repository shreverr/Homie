import express from "express";
import "dotenv/config";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import { createServer } from "http";
import { Server } from "socket.io";
import EventEmitter from "events";
import cors from 'cors'

const app = express();
const server = createServer(app);
const io = new Server(server);
const eventEmmiter = new EventEmitter();

app.use(cors())

let switchIsOn = false

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('logs', (data) => {
    logger.info(`ESP8266: ${data}`)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  eventEmmiter.on('SwitchStateChange', () => {
    logger.info(`Sending new state to esp8266`)
    socket.emit('SwitchStateChange', switchIsOn)
  })
});

app.use(express.json());
app.use(pinoHttp({ logger, useLevel: "trace" }));

app.get("/switch/state", (req, res) => {
  try {
    logger.info("GET switch state")
    res.status(200).json({
      state: switchIsOn,
      status: 'success'
    })
  } catch (err) {
    logger.error(err)

  }
})

app.post("/switch/state", (req, res) => {
  try {
    const newState = req.body.state
    logger.info(`POST switch state: ${newState}`)
    switchIsOn = newState
    eventEmmiter.emit('SwitchStateChange')
    res.status(200).json({
      state: switchIsOn,
      status: 'success'
    })
  } catch (err) {
    logger.error(err)
  }
})

export default server;

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
const eventEmitter = new EventEmitter();

app.use(cors())

let switchIsOn = false;
let timerInterval: NodeJS.Timeout | null = null;
let isTimerActive = false;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('logs', (data) => {
    logger.info(`ESP8266: ${data}`)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  eventEmitter.on('SwitchStateChange', () => {
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
    eventEmitter.emit('SwitchStateChange')
    res.status(200).json({
      state: switchIsOn,
      status: 'success'
    })
  } catch (err) {
    logger.error(err)
  }
})

app.post("/timer", (req, res) => {
  try {
    const { duration, Active } = req.body;
    isTimerActive = Active;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (duration > 0 && isTimerActive) {
      timerInterval = setInterval(() => {
        if (switchIsOn == true) switchIsOn = false;
        else switchIsOn = true;
        logger.info(`Timer expired, new state: ${switchIsOn}`);
        eventEmitter.emit('SwitchStateChange');
      }, duration * 60 * 1000);
    }

    res.status(200).json({
      status: 'success',
      isTimerActive: isTimerActive
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
})


export default server;

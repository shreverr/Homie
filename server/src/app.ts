import express from "express";
import "dotenv/config";
import pinoHttp from "pino-http";
import logger from "./config/logger";

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger, useLevel: "trace" }));

export default app;

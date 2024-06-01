import { createServer } from "http";
import server from "./app";
import logger from "./config/logger";

logger.info("/////////////////////////////////////////////");
logger.info("/////////////////////////////////////////////");
logger.info("//                                         //");
logger.info("//            Homie Web Server             //");
logger.info("//                                         //");
logger.info("/////////////////////////////////////////////");
logger.info("/////////////////////////////////////////////");

const port = Number(process.env.PORT ?? 3000);

server.listen(port,
  process.env.ENVIRONMENT === 'dev' ?
    process.env.LOCAL_IP : 'localhost',
  () => {
    logger.info(
      `Server listening at http://${process.env.ENVIRONMENT === 'dev'
        ? process.env.LOCAL_IP : 'localhost'
      }:${port}`);
  });

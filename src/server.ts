import cluster from "cluster";
import { cpus } from "os";

import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import log from "./logger";
import database from "./database";
import router from "./router";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

const port = <number>(<unknown>process.env.PORT);
const host = <string>process.env.HOST;
const envState = <string>process.env.NODE_ENV;

if (envState === "development") {
   app.listen(port, host, () => {
      log.info(`Server listening at http://${host}:${port}`);
      database();
      router(app);
   });
} else if (envState === "production") {
   const numCPU = cpus().length;
   // can't use cluster.isPrimary but that is only available in node v16+ and i have v14. Could do cluster.isMaster but i don't like the deprecation warning.
   if (!cluster.isWorker) {
      for (let i = 0; i < numCPU; i++) {
         cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
         log.error(`Worker ${worker.process.pid} died. Starting a new worker...`);
         cluster.fork();
      });
   } else {
      app.listen(port, host, () => {
         log.info(`Server ${process.pid} listening at http://${host}:${port}`);
         database();
         router(app);
      });
   }
}

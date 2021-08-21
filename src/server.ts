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

app.listen(port, host, () => {
   log.info(`Server listening at http://${host}:${port}`);
   database();
   router(app);
});

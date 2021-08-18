import mongoose from "mongoose";
import log from "./logger";

const connect = () => {
   const uri = <string>process.env.MONGO_URI;

   return mongoose
      .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
      .then(() => {
         log.info("MongoDB Connected...");
      })
      .catch((e) => {
         log.error(e);
         process.exit(1);
      });
};

export default connect;

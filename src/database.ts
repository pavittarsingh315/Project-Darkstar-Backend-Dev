import mongoose from "mongoose";
import log from "./logger";

async function connect() {
   try {
      const uri = <string>process.env.MONGO_URI;
      mongoose.set("useNewUrlParser", true);
      mongoose.set("useUnifiedTopology", true);
      mongoose.set("useCreateIndex", true);
      mongoose.set("useFindAndModify", false);
      await mongoose.connect(uri);
      log.info("MongoDB Connected...");
      return;
   } catch (err) {
      log.error(err);
      process.exit(1);
   }
}

export default connect;

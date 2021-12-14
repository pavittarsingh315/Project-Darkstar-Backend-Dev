import mongoose from "mongoose";

export interface WhitelistInterface extends mongoose.Document {
   ownerId: string;
   allowedId: string;
}

const WhitelistSchema = new mongoose.Schema(
   {
      ownerId: {
         type: String,
         required: true,
         immutable: true,
      },
      allowedId: {
         type: String,
         required: true,
         immutable: true,
      },
   },
   { timestamps: false }
);

const db = mongoose.connection.useDb("Profiles");
const Whitelist = db.model<WhitelistInterface>("Whitelists", WhitelistSchema);
export default Whitelist;

import mongoose from "mongoose";

export interface WhitelistInterface extends mongoose.Document {
   profileId: string;
   blacklistMsg: string;
   whitelist: Array<string>;
}

const WhitelistSchema = new mongoose.Schema(
   {
      profileId: {
         type: String,
         unique: true,
         required: true,
         immutable: true,
      },
      blacklistMsg: {
         type: String,
         default: "You do not have permission to view these posts!",
         trim: true,
         maxLength: 100,
      },
      whitelist: {
         type: Array,
         default: [],
      },
   },
   { timestamps: false }
);

const db = mongoose.connection.useDb("Profiles");
const Whitelist = db.model<WhitelistInterface>("Whitelists", WhitelistSchema);
export default Whitelist;

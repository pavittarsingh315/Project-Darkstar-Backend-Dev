import mongoose from "mongoose";

export interface SearchInterface extends mongoose.Document {
   profileId: string;
   queries: Array<string>;
}

const SearchSchema = new mongoose.Schema(
   {
      profileId: {
         type: String,
         unique: true,
         required: true,
         immutable: true,
      },
      queries: {
         type: Array,
         default: [],
      },
   },
   { timestamps: false }
);

const db = mongoose.connection.useDb("Profiles");
const Searches = db.model<SearchInterface>("Searche", SearchSchema);
export default Searches;

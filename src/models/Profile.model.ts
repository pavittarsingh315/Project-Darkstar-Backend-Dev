import mongoose from "mongoose";

export interface ProfileInterface extends mongoose.Document {
   userId: string;
   username: string;
   name: string;
   portrait: string;
   bio: string;
   blacklistMsg: string;
   whitelist: Array<string>;
   numFollowers: number;
   numFollowing: number;
   numPrivateFollowing: number;
   createdAt: Date;
   updatedAt: Date;
}

const ProfileSchema = new mongoose.Schema(
   {
      userId: {
         type: String,
         unique: true,
         required: true,
         immutable: true,
      },
      username: {
         type: String,
         required: true,
         unique: true,
      },
      name: {
         type: String,
         trim: true,
         max: [30, "Name too long."],
      },
      portrait: {
         type: String,
         default: "https://nerajima.s3.us-west-1.amazonaws.com/default.png",
      },
      bio: {
         type: String,
         trim: true,
         maxLength: 150,
         default: "🚀🚀🚀🚀🚀🚀🚀🚀",
      },
      blacklistMsg: {
         type: String,
         default: "",
         trim: true,
         maxLength: 100,
      },
      whitelist: {
         type: Array,
         default: [],
      },
      numFollowers: {
         type: Number,
         default: 0,
      },
      numFollowing: {
         type: Number,
         default: 0,
      },
      numPrivateFollowing: {
         type: Number,
         default: 0,
      },
   },
   { timestamps: true }
);

const db = mongoose.connection.useDb("Profiles");
const Profile = db.model<ProfileInterface>("Profile", ProfileSchema);
export default Profile;

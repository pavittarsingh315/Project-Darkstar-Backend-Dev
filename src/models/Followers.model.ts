import mongoose from "mongoose";

export interface FollowsInterface extends mongoose.Document {
   followedId: string;
   followerId: string;
   isPrivateFollow: boolean;
}

// get a profile's followings: get all the objects where the followerId is that of the profile and isPrivateFollow is false.
// get a profile's private following: get all the objects where the followerId is that of the profile and isPrivateFollow is true.
// get a profile's followers: get all the objects where the followedId is that of the profile and isPrivateFollow is false (for people who are not the owners of that profile) and blank (if the person is the owner of the profile).
const FollowsScehma = new mongoose.Schema(
   {
      followedId: {
         type: String,
         required: true,
         immutable: true,
      },
      followerId: {
         type: String,
         required: true,
         immutable: true,
      },
      isPrivateFollow: {
         type: Boolean,
         required: true,
         immutable: true,
      },
   },
   { timestamps: false }
);

const db = mongoose.connection.useDb("Profiles");
const Follows = db.model<FollowsInterface>("Follows", FollowsScehma);
export default Follows;

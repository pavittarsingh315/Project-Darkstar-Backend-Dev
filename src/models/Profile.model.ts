import mongoose from "mongoose";

export interface ProfileInterface extends mongoose.Document {
   userId: string;
   username: string;
   name: string;
   portrait: string;
   bio: string;
   followers: Array<string>;
   following: Array<string>;
   privateFollowing: Array<string>;
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
         maxLength: 225,
         default: "🚀🚀🚀🚀🚀🚀🚀🚀",
      },
      followers: {
         type: Array,
         default: [],
      },
      following: {
         type: Array,
         default: [],
      },
      privateFollowing: {
         type: Array,
         default: [],
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

ProfileSchema.pre("save", async function (next: mongoose.HookNextFunction) {
   const profile = <ProfileInterface>this;

   if (profile.isModified("followers")) {
      profile.numFollowers = profile.followers.length;
   }

   if (profile.isModified("following")) {
      profile.numFollowing = profile.following.length;
   }

   if (profile.isModified("privateFollowing")) {
      profile.numPrivateFollowing = profile.privateFollowing.length;
   }

   return next();
});

const db = mongoose.connection.useDb("Profiles");
const Profile = db.model<ProfileInterface>("Profile", ProfileSchema);
export default Profile;

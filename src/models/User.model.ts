import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Profile from "./Profile.model";
import { deleteObject } from "../aws";

export interface UserInterface extends mongoose.Document {
   name: string;
   contact: string;
   username: string;
   password: string;
   userType: string;
   strikes: number;
   banTill: Date | null;
   lastLogin: Date;
   createdAt: Date;
   updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         trim: true,
         required: true,
         max: [30, "Name too long."],
      },
      contact: {
         type: String,
         immutable: true,
         unique: true,
         required: true,
         lowercase: true,
         trim: true,
         max: [50, "Contact too long."],
      },
      username: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         minLength: [6, "Username too short."],
         maxLength: [30, "Username too long."],
      },
      password: {
         type: String,
         required: true,
         minLength: [10, "Password too short."],
      },
      strikes: {
         type: Number,
         default: 0,
      },
      userType: {
         type: String,
         enum: ["user", "staff", "admin", "superuser"],
         default: "user",
      },
      banTill: {
         type: Date,
         default: null,
      },
      lastLogin: {
         type: Date,
         default: Date.now(),
      },
   },
   { timestamps: true }
);

// runs when we do .save()
UserSchema.pre("save", async function (next: mongoose.HookNextFunction) {
   const user = <UserInterface>this;

   // Only hash password if it is new or modified
   if (!user.isModified("password")) return next();

   const salt = await bcrypt.genSalt(10);
   const hash = await bcrypt.hash(user.password, salt);
   user.password = hash;

   return next();
});

UserSchema.pre("deleteOne", { document: true, query: false }, async function (next: mongoose.HookNextFunction) {
   const profile = await Profile.findOne({ userId: this._id });

   if (profile?.portrait !== "https://nerajima.s3.us-west-1.amazonaws.com/default.png") {
      const imgName = profile?.portrait.split("?")[0].split("/")[6];
      await deleteObject(`resized/profilePics/200x200/${imgName}`);
      await deleteObject(`resized/profilePics/1000x1000/${imgName}`);
   }

   await profile?.deleteOne();

   next();
});

const db = mongoose.connection.useDb("Authentication");
const User = db.model<UserInterface>("User", UserSchema);
export default User;

import mongoose from "mongoose";
import { genSalt, hash as bcryptHash } from "bcryptjs";

export interface UserInterface extends mongoose.Document {
   name: string;
   phone: string;
   username: string;
   password: string;
   isActive: boolean;
   banDate: Date;
   createdAt: Date;
   updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         trim: true,
         required: true,
      },
      phone: {
         type: String,
         unique: true,
         required: true,
         trim: true,
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
         trim: true,
         required: true,
         minLength: [8, "Password too short."],
      },
      isActive: {
         type: Boolean,
         default: false,
         required: true,
      },
      banDate: {
         type: Date,
         default: null,
      },
   },
   { timestamps: true }
);

UserSchema.pre("save", async function (next: mongoose.HookNextFunction) {
   let user = <UserInterface>this;

   // Only hash password if it is new or modified
   if (!user.isModified("password")) return next();

   const salt = await genSalt(10);
   const hash = await bcryptHash(user.password, salt);
   user.password = hash;

   return next();
});

const User = mongoose.model<UserInterface>("User", UserSchema);
export default User;

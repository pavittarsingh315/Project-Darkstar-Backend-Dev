import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface UserInterface extends mongoose.Document {
   name: string;
   contact: string;
   username: string;
   password: string;
   strikes: number;
   banTill: Date | null;
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
      contact: {
         type: String,
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
         trim: true,
         required: true,
         minLength: [8, "Password too short."],
      },
      strikes: {
         type: Number,
         default: 0,
      },
      banTill: {
         type: Date,
         default: null,
      },
   },
   { timestamps: true }
);

UserSchema.pre("save", async function (next: mongoose.HookNextFunction) {
   const user = <UserInterface>this;

   // Only hash password if it is new or modified
   if (!user.isModified("password")) return next();

   const salt = await bcrypt.genSalt(10);
   const hash = await bcrypt.hash(user.password, salt);
   user.password = hash;

   return next();
});

const User = mongoose.model<UserInterface>("User", UserSchema);
export default User;

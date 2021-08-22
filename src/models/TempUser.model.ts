import mongoose from "mongoose";

export interface TempUserInterface {
   verification_code: number;
   contact: string;
   expires_at: Date;
}

const TemporaryUserSchema = new mongoose.Schema(
   {
      verification_code: {
         type: Number,
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
      expires_at: {
         type: Date,
         default: Date.now,
         expires: 300, // # of seconds
      },
   },
   { timestamps: false }
);

const TemporaryUser = mongoose.model<TempUserInterface>("TemporaryUser", TemporaryUserSchema);
export default TemporaryUser;

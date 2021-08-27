import mongoose from "mongoose";

export interface TempObjInterface extends mongoose.Document {
   verification_code: number;
   contact: string;
   expires_at: Date;
}

const TemporaryObjectSchema = new mongoose.Schema(
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
         expires: 120, // # of seconds
      },
   },
   { timestamps: false }
);

const TemporaryObject = mongoose.model<TempObjInterface>("TemporaryObject", TemporaryObjectSchema);
export default TemporaryObject;

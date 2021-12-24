import mongoose from "mongoose";

export interface PostInterface extends mongoose.Document {
   ownerId: string;
   isPrivatePost: boolean;
   isArchived: boolean;
   media: string;
   thumbnail: string;
   audio: string;
   caption: string;
   title: string;
   numLikes: number;
   numDislikes: number;
   numComments: number;
   createdAt: Date;
   updatedAt: Date;
}

const PostSchema = new mongoose.Schema(
   {
      ownerId: {
         type: String,
         required: true,
         immutable: true,
      },
      isPrivatePost: {
         type: Boolean,
         required: true,
      },
      isArchived: {
         type: Boolean,
         required: true,
         default: false,
      },
      media: {
         type: String,
         required: true,
         immutable: true,
      },
      thumbnail: {
         type: String,
         required: true,
         immutable: true,
      },
      audio: {
         type: String,
         immutable: true,
      },
      caption: {
         type: String,
         trim: true,
         maxLength: 150,
         required: true,
      },
      title: {
         type: String,
         trim: true,
         maxLength: 150,
         required: true,
      },
      numLikes: {
         type: Number,
         default: 0,
      },
      numDislikes: {
         type: Number,
         default: 0,
      },
      numComments: {
         type: Number,
         default: 0,
      },
   },
   { timestamps: true }
);

const db = mongoose.connection.useDb("Content");
const Post = db.model<PostInterface>("Posts", PostSchema);
export default Post;

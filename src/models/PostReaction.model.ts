// create the schema with an ownerId, postId, and isLike field. use this to determine logic for numLikes and numDislikes.

// create the object when liking or disliking.

// when you like a post, set isLike to true and increment the numLikes

// when you remove a like, delete the object and decrement the numLikes

// when you dislike a post, set isLike to false and increment numDislikes

// when you remove a dislike, delete object and decrement numDislikes

// if you like a post but then click dislike, change isLike to false and decrement numLikes and increment numDislikes

// if you dislike a post but then click like, change isLike to true and decrement numDislikes and increment numLikes

import mongoose from "mongoose";

export interface PostReactionInterface extends mongoose.Document {
   ownerId: string;
   postId: string;
   isLike: boolean;
   createdAt: Date;
   updatedAt: Date;
}

const PostReactionSchema = new mongoose.Schema(
   {
      ownerId: {
         type: String,
         required: true,
         immutable: true,
      },
      postId: {
         type: String,
         required: true,
         immutable: true,
      },
      isLike: {
         type: Boolean,
         required: true,
      },
   },
   { timestamps: true }
);

const db = mongoose.connection.useDb("Content");
const PostReaction = db.model<PostReactionInterface>("PostReactions", PostReactionSchema);
export default PostReaction;

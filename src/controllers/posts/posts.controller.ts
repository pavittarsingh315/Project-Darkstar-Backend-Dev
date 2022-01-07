import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Post from "../../models/Post.model";
import Profile from "../../models/Profile.model";
import PostReaction from "../../models/PostReaction.model";
import Whitelist from "../../models/Whitelist.model";
import { omit, merge } from "lodash";
import log from "../../logger";

export async function createPost(req: RequestInterface, res: Response) {
   try {
      if (req.body.isPrivatePost == null || !req.body.thumbnail || !req.body.caption || !req.body.title) {
         return res.status(400).json({ error: { msg: "Please include all fields." } });
      }

      const { isPrivatePost, media, thumbnail, caption, title, audio }: { isPrivatePost: boolean; media: string; thumbnail: string; caption: string; title: string; audio: string } = req.body; // prettier-ignore

      const newPost = new Post({
         ownerId: req.profile!._id,
         isPrivatePost,
         media: media ? media : null,
         thumbnail,
         caption,
         title,
         audio: audio ? audio : null,
      });

      const savedNewPost = await newPost.save();

      return res.status(200).json({
         success: {
            post: merge(omit(savedNewPost.toJSON(), ["isArchived", "thumbnail", "createdAt", "updatedAt", "__v"]), {
               ownerUsername: req.profile!.username,
               ownerProfilePic: req.profile!.miniPortrait,
               haveLiked: false,
               haveDisliked: false,
            }),
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getPost(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not retrieve post" } });

      if (post.isArchived && post.ownerId != req.profile!._id) {
         return res.status(400).json({ error: { msg: "You are not allowed to see this post." } });
      }

      if (post.isPrivatePost) {
         if (post.ownerId != req.profile!._id) {
            const areWhitelisted = await Whitelist.findOne({ ownerId: post.ownerId, allowedId: req.profile!._id });
            if (!areWhitelisted) {
               return res.status(400).json({ error: { msg: "You are not allowed to see this post." } });
            }
         }
      }

      const postOwnerProfile = await Profile.findOne({ _id: post.ownerId }).select([
         "username",
         "miniPortrait",
         "-_id",
      ]);
      if (!postOwnerProfile) {
         return res.status(400).json({ error: { msg: "Could not retrieve the owner of the post." } });
      }

      const reactionObj = await PostReaction.findOne({ ownerId: req.profile!._id, postId: post._id });

      return res.status(200).json({
         success: {
            post: merge(omit(post.toJSON(), ["isArchived", "thumbnail", "createdAt", "updatedAt", "__v"]), {
               ownerUsername: postOwnerProfile.username,
               ownerProfilePic: postOwnerProfile.miniPortrait,
               haveLiked: reactionObj == null ? false : reactionObj!.isLike,
               haveDisliked: reactionObj == null ? false : !reactionObj!.isLike,
            }),
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not retrieve post" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editPost(req: RequestInterface, res: Response) {
   try {
      if (req.body.isPrivatePost == null || req.body.isArchived == null || !req.body.caption || !req.body.title) {
         return res.status(400).json({ error: { msg: "Please include all fields." } });
      }
      const { isPrivatePost, isArchived, caption, title }: { isPrivatePost: boolean; isArchived: boolean; caption: string; title: string } = req.body; // prettier-ignore

      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not edit post" } });

      if (post.ownerId != req.profile!._id) {
         return res.status(400).json({ error: { msg: "You cannot edit a post that isn't yours!" } });
      }

      post.caption = caption;
      post.title = title;
      post.isPrivatePost = isPrivatePost;
      post.isArchived = isArchived;
      await post.save();

      return res.status(200).json({ success: { msg: "Post updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not edit post" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function deletePost(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not delete post" } });

      if (post.ownerId != req.profile!._id) {
         return res.status(400).json({ error: { msg: "You are not allowed to delete a post that isn't yours!" } });
      }

      await post.deleteOne();

      return res.status(200).json({ success: { msg: "Post deleted." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not delete post" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function likePost(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not like post" } });

      const reactionObj = await PostReaction.findOne({ ownerId: req.profile!._id, postId: post._id });

      if (reactionObj) {
         if (reactionObj.isLike) {
            return res.status(400).json({ error: { msg: "Post already liked" } });
         } else {
            reactionObj.isLike = true;
            post.numDislikes -= 1;
            post.numLikes += 1;

            await post.save();
            await reactionObj.save();

            return res.status(200).json({ success: { msg: "Post liked." } });
         }
      } else {
         post.numLikes += 1;
         const newReaction = new PostReaction({
            ownerId: req.profile!._id,
            postId: post._id,
            isLike: true,
         });

         await post.save();
         await newReaction.save();

         return res.status(200).json({ success: { msg: "Post liked." } });
      }
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not like post" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function dislikePost(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not dislike post" } });

      const reactionObj = await PostReaction.findOne({ ownerId: req.profile!._id, postId: post._id });

      if (reactionObj) {
         if (!reactionObj.isLike) {
            return res.status(400).json({ error: { msg: "Post already disliked" } });
         } else {
            reactionObj.isLike = false;
            post.numDislikes += 1;
            post.numLikes -= 1;

            await post.save();
            await reactionObj.save();

            return res.status(200).json({ success: { msg: "Post disliked." } });
         }
      } else {
         post.numDislikes += 1;
         const newReaction = new PostReaction({
            ownerId: req.profile!._id,
            postId: post._id,
            isLike: false,
         });

         await post.save();
         await newReaction.save();

         return res.status(200).json({ success: { msg: "Post disliked." } });
      }
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not dislike post" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeLike(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not remove like" } });

      const reactionObj = await PostReaction.findOne({ ownerId: req.profile!._id, postId: post._id, isLike: true });
      if (!reactionObj) return res.status(400).json({ error: { msg: "You haven't liked this post" } });

      post.numLikes -= 1;

      await post.save();
      await reactionObj.deleteOne();

      return res.status(200).json({ success: { msg: "Like removed" } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not remove like" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeDislike(req: RequestInterface, res: Response) {
   try {
      const post = await Post.findOne({ _id: req.params.postId });
      if (!post) return res.status(400).json({ error: { msg: "Could not remove dislike" } });

      const reactionObj = await PostReaction.findOne({ ownerId: req.profile!._id, postId: post._id, isLike: false });
      if (!reactionObj) return res.status(400).json({ error: { msg: "You haven't disliked this post" } });

      post.numDislikes -= 1;

      await post.save();
      await reactionObj.deleteOne();

      return res.status(200).json({ success: { msg: "Dislike removed" } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not remove dislike" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

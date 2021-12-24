import express, { Router } from "express";
import {
   createPost,
   editPost,
   getPost,
   deletePost,
   likePost,
   dislikePost,
   removeLike,
   removeDislike,
} from "../controllers/posts/posts.controller";
import userPermissionHandler from "../middleware/userPermissionHandler";

const router: Router = express.Router();

router.post("/createPost", userPermissionHandler, createPost);
router.get("/get/:postId", userPermissionHandler, getPost);
router.put("/edit/:postId", userPermissionHandler, editPost);
router.delete("/delete/:postId", userPermissionHandler, deletePost);
router.put("/like/:postId", userPermissionHandler, likePost);
router.put("/dislike/:postId", userPermissionHandler, dislikePost);
router.delete("/like/remove/:postId", userPermissionHandler, removeLike);
router.delete("/dislike/remove/:postId", userPermissionHandler, removeDislike);

// TODO: check all the routes that use the userPermissionHandler and make sure they don't make db queries for the profile/user object that belongs to the user making the request.

export default router;

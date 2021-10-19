import express, { Router } from "express";
import userPermissionHandler from "../middleware/userPermissionHandler";
import {
   editUsername,
   editName,
   editBio,
   editProfilePortrait,
   editBlacklistMsg,
} from "../controllers/users/edits.controller";
import { followUser, unfollowUser } from "../controllers/users/users.controllers";

const router: Router = express.Router();

router.put("/editUsername", userPermissionHandler, editUsername);
router.put("/editName", userPermissionHandler, editName);
router.put("/editBio", userPermissionHandler, editBio);
router.put("/editPortrait", userPermissionHandler, editProfilePortrait);
router.put("/editBlacklistMsg", userPermissionHandler, editBlacklistMsg);

router.put("/profile/follow/:id", userPermissionHandler, followUser);
router.put("/profile/unfollow/:id", userPermissionHandler, unfollowUser);

export default router;

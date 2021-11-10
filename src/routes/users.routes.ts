import express, { Router } from "express";
import userPermissionHandler from "../middleware/userPermissionHandler";
import {
   editUsername,
   editName,
   editBio,
   editProfilePortrait,
   editBlacklistMsg,
} from "../controllers/users/edits.controller";
import {
   followUser,
   unfollowUser,
   getProfileFollowers,
   getProfileFollowing,
} from "../controllers/users/relationships.controller";
import { searchUser, getUserProfile } from "../controllers/users/profiles.controller";

const router: Router = express.Router();

router.put("/editUsername", userPermissionHandler, editUsername);
router.put("/editName", userPermissionHandler, editName);
router.put("/editBio", userPermissionHandler, editBio);
router.put("/editPortrait", userPermissionHandler, editProfilePortrait);
router.put("/editBlacklistMsg", userPermissionHandler, editBlacklistMsg);

router.put("/profile/follow/:id", userPermissionHandler, followUser);
router.put("/profile/unfollow/:id", userPermissionHandler, unfollowUser);
router.post("/profile/followers/:id", userPermissionHandler, getProfileFollowers);
router.post("/profile/following/:id", userPermissionHandler, getProfileFollowing);

router.post("/profile/search/:username", userPermissionHandler, searchUser);
router.post("/profile/:userId", userPermissionHandler, getUserProfile);

export default router;

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
import {
   makeSearch,
   getUserProfile,
   getUserSearches,
   removeSearch,
   removeAllSearches,
} from "../controllers/users/profiles.controller";

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

router.post("/profile/search/:query", userPermissionHandler, makeSearch);
router.post("/profile/:userId", userPermissionHandler, getUserProfile);
router.post("/profile/searches/history", userPermissionHandler, getUserSearches);
router.post("/profile/searches/remove/:index", userPermissionHandler, removeSearch);
router.post("/profile/searches/removeAll", userPermissionHandler, removeAllSearches);

export default router;

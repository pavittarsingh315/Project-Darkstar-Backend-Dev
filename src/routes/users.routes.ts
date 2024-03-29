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
   removeFollower,
   getProfileFollowers,
   getProfileFollowing,
} from "../controllers/users/relationships.controller";
import {
   makeSearch,
   getUserProfile,
   getUserSearches,
   addRecentSearch,
   removeSearch,
   removeAllSearches,
   addToWhitelist,
   removeFromWhitelist,
   getWhitelist,
} from "../controllers/users/profiles.controller";

const router: Router = express.Router();

router.put("/editUsername", userPermissionHandler, editUsername);
router.put("/editName", userPermissionHandler, editName);
router.put("/editBio", userPermissionHandler, editBio);
router.put("/editPortrait", userPermissionHandler, editProfilePortrait);
router.put("/editBlacklistMsg", userPermissionHandler, editBlacklistMsg);

router.put("/profile/follow/:id", userPermissionHandler, followUser);
router.put("/profile/unfollow/:id", userPermissionHandler, unfollowUser);
router.put("/profile/followers/remove/:id", userPermissionHandler, removeFollower);
router.get("/profile/followers/:id", userPermissionHandler, getProfileFollowers);
router.get("/profile/following/:id", userPermissionHandler, getProfileFollowing);

router.get("/profile/:profileId", userPermissionHandler, getUserProfile);

router.get("/profile/search/:query", userPermissionHandler, makeSearch);
router.get("/profile/searches/history", userPermissionHandler, getUserSearches);
router.put("/profile/searches/add/:query", userPermissionHandler, addRecentSearch);
router.put("/profile/searches/remove/:index", userPermissionHandler, removeSearch);
router.put("/profile/searches/removeAll", userPermissionHandler, removeAllSearches);

router.put("/profile/whitelist/add/:profileId", userPermissionHandler, addToWhitelist);
router.put("/profile/whitelist/remove/:profileId", userPermissionHandler, removeFromWhitelist);
router.get("/profile/whitelist/get", userPermissionHandler, getWhitelist);
// TODO implement route to refresh profile.
// TODO update profile schema to hold two urls for the profile pic, one minified to like 100x100 and the other the larger one.

export default router;

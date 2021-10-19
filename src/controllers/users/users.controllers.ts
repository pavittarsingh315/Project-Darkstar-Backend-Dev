import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Follows from "../../models/Followers.model";
import Profile from "../../models/Profile.model";
import log from "../../logger";

export async function followUser(req: RequestInterface, res: Response) {
   try {
      const toBeFollowedID = req.params.id;
      if(toBeFollowedID == req.profile!._id) return res.status(400).json({ error: { msg: "Cannot follow yourself." } }); // prettier-ignore
      const privately = <string>(<unknown>req.query.privately);
      if (privately !== "true" && privately !== "false") return res.status(400).json({ error: { msg: "Could not follow user." } }); //prettier-ignore

      const alreadyFollowing = await Follows.findOne({ followedId: toBeFollowedID, followerId: req.profile!._id });
      if (alreadyFollowing) return res.status(400).json({ error: { msg: "Already following user." } });

      const toBeFollowedProfile = await Profile.findById(toBeFollowedID);
      if (!toBeFollowedProfile) return res.status(400).json({ error: { msg: "Could not follow user." } });

      let newFollows;
      if (privately === "true") {
         toBeFollowedProfile.numFollowers += 1;
         req.profile!.numPrivateFollowing += 1;
         newFollows = new Follows({
            followedId: toBeFollowedID,
            followerId: req.profile!._id,
            isPrivateFollow: true,
         });
      } else {
         toBeFollowedProfile.numFollowers += 1;
         req.profile!.numFollowing += 1;
         newFollows = new Follows({
            followedId: toBeFollowedID,
            followerId: req.profile!._id,
            isPrivateFollow: false,
         });
      }

      await toBeFollowedProfile.save();
      await req.profile!.save();
      await newFollows.save();

      return res.status(200).json({ success: { msg: "User followed." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not follow user." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function unfollowUser(req: RequestInterface, res: Response) {
   try {
      const toBeUnfollowedId = req.params.id;
      if(toBeUnfollowedId == req.profile!._id) return res.status(400).json({ error: { msg: "Cannot unfollow yourself." } }); // prettier-ignore

      const followsObj = await Follows.findOne({ followedId: toBeUnfollowedId, followerId: req.profile!._id });
      if (!followsObj) return res.status(400).json({ error: { msg: "Not following user." } });
      const isPrivateFollow = followsObj.isPrivateFollow;

      const toBeUnfollowedProfile = await Profile.findById(toBeUnfollowedId);
      if (!toBeUnfollowedProfile) return res.status(400).json({ error: { msg: "Could not follow user." } });

      toBeUnfollowedProfile.numFollowers -= 1;
      if (isPrivateFollow) {
         req.profile!.numPrivateFollowing -= 1;
      } else {
         req.profile!.numFollowing -= 1;
      }

      await toBeUnfollowedProfile.save();
      await req.profile!.save();
      await followsObj.deleteOne();

      return res.status(200).json({ success: { msg: "User unfollowed." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not unfollow user." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

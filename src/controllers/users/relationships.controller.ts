import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Follows from "../../models/Followers.model";
import Profile from "../../models/Profile.model";
import Whitelist from "../../models/Whitelist.model";
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

      const whitelistObj = await Whitelist.findOne({ ownerId: toBeUnfollowedProfile._id, allowedId: req.profile!._id });
      if (whitelistObj) {
         await whitelistObj.deleteOne();
      }

      toBeUnfollowedProfile.numFollowers -= 1;
      if (isPrivateFollow) {
         req.profile!.numPrivateFollowing -= 1;
      } else {
         req.profile!.numFollowing -= 1;
      }

      await toBeUnfollowedProfile.save();
      await req.profile!.save();
      await followsObj.deleteOne();

      return res.status(200).json({ success: { wasPrivateFollow: isPrivateFollow } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not unfollow user." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeFollower(req: RequestInterface, res: Response) {
   try {
      const toBeRemovedId = req.params.id;
      if(toBeRemovedId == req.profile!._id) return res.status(400).json({ error: { msg: "Cannot remove yourself." } }); // prettier-ignore

      const followsObj = await Follows.findOne({ followedId: req.profile!._id, followerId: toBeRemovedId });
      if (!followsObj) return res.status(400).json({ error: { msg: "User is not following you." } });
      const isPrivateFollow = followsObj.isPrivateFollow;

      const toBeRemovedProfile = await Profile.findById(toBeRemovedId);
      if (!toBeRemovedProfile) return res.status(400).json({ error: { msg: "Could not remove follower." } });

      req.profile!.numFollowers -= 1;
      if (isPrivateFollow) {
         toBeRemovedProfile.numPrivateFollowing -= 1;
      } else {
         toBeRemovedProfile.numFollowing -= 1;
      }

      await toBeRemovedProfile.save();
      await req.profile!.save();
      await followsObj.deleteOne();

      return res.status(200).json({ success: { msg: "Follower removed." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not remove follower." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getProfileFollowers(req: RequestInterface, res: Response) {
   try {
      const profileId = req.params.id;
      const profile = await Profile.findById(profileId);
      if (!profile) return res.status(400).json({ error: { msg: "Could not get followers." } });

      let followersId: Array<{ followerId: string }> = [];
      if (profileId == req.profile!._id) {
         const allFollowers = await Follows.find({ followedId: profileId }).select(["followerId", "-_id"]); // prettier-ignore
         followersId = allFollowers;
      } else {
         const allFollowers = await Follows.find({ followedId: profileId, isPrivateFollow: false }).select(["followerId", "-_id"]); // prettier-ignore
         followersId = allFollowers;
      }

      let followers: Array<{ portrait: string; username: string; name: string }> = [];
      if (followersId.length) {
         followers = await Profile.find({ _id: { $in: followersId.map((e) => e.followerId) } }).select(["portrait", "username", "name"]); // prettier-ignore
      }

      return res.status(200).json({ success: { followers } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not get followers." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getProfileFollowing(req: RequestInterface, res: Response) {
   try {
      const profileId = req.params.id;
      const privately = <string>(<unknown>req.query.privately);
      if (privately !== "true" && privately !== "false") return res.status(400).json({ error: { msg: "Could not get following." } }); //prettier-ignore

      const profile = await Profile.findById(profileId);
      if (!profile) return res.status(400).json({ error: { msg: "Could not get following." } });

      let followingId: Array<{ followedId: string }> = [];
      if (privately === "true") {
         if(!profile._id.equals(req.profile!._id)) return res.status(400).json({ error: { msg: "You can only view your private following." } }); // prettier-ignore
         followingId = await Follows.find({ followerId: profileId, isPrivateFollow: true }).select(["followedId", "-_id"]); // prettier-ignore
      } else {
         followingId = await Follows.find({ followerId: profileId, isPrivateFollow: false }).select(["followedId", "-_id"]); // prettier-ignore
      }

      let following: Array<{ portrait: string; username: string; name: string }> = [];
      if (followingId.length) {
         following = await Profile.find({ _id: { $in: followingId.map((e) => e.followedId) } }).select(["portrait", "username", "name"]); // prettier-ignore
      }

      return res.status(200).json({ success: { following } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not get following." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

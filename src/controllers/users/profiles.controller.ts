import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Profile from "../../models/Profile.model";
import Follows from "../../models/Followers.model";
import { merge } from "lodash";
import log from "../../logger";

export async function searchUser(req: RequestInterface, res: Response) {
   try {
      const searchResults = await Profile.find({
         username: { $regex: `^${req.params.username}`, $options: "i" },
      }).select(["username", "portrait", "name"]);
      return res.status(200).json({ success: { searchResults } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getUserProfile(req: RequestInterface, res: Response) {
   try {
      const profile = await Profile.findOne({ _id: req.params.userId }).select([
         "-whitelist",
         "-createdAt",
         "-updatedAt",
         "-userId",
         "-__v",
      ]);
      if (!profile) return res.status(400).json({ error: { msg: "Could not retrieve profile." } });
      const areFollowing = await Follows.findOne({ followedId: profile._id, followerId: req.profile!._id });
      return res
         .status(200)
         .json({ success: { profile: merge(profile.toJSON(), { areFollowing: areFollowing ? true : false }) } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed.")
         return res.status(400).json({ error: { msg: "Could not retrieve profile" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Profile from "../../models/Profile.model";
import Follows from "../../models/Followers.model";
import Searches from "../../models/Searches.model";
import { merge } from "lodash";
import log from "../../logger";

export async function makeSearch(req: RequestInterface, res: Response) {
   try {
      const searchResults = await Profile.find({
         username: { $regex: `^${req.params.query}`, $options: "i" },
      }).select(["username", "portrait", "name"]);
      const searches = await Searches.findOne({ userId: req.profile!._id });
      if (!searches) {
         const newSearches = new Searches({
            userId: req.profile!._id,
            queries: [`${req.params.query}`],
         });
         await newSearches.save();
      } else {
         let prevSearches = searches.queries;
         if (prevSearches.includes(req.params.query)) {
            prevSearches.splice(prevSearches.indexOf(req.params.query), 1);
         }
         prevSearches = [...[`${req.params.query}`], ...prevSearches];
         if (prevSearches.length > 10) {
            prevSearches.pop();
         }
         searches.queries = prevSearches;
         await searches.save();
      }
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

export async function getUserSearches(req: RequestInterface, res: Response) {
   try {
      const searches = await Searches.findOne({ userId: req.profile!._id });
      const searchHistory = searches ? searches.queries : [];
      return res.status(200).json({ success: { searchHistory } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeSearch(req: RequestInterface, res: Response) {
   try {
      const index = <number>(<unknown>req.params.index);
      if (index < 0 || index > 9) return res.status(400).json({ error: { msg: "Search out of range." } });
      const searches = await Searches.findOne({ userId: req.profile!._id });
      if (!searches) return res.status(400).json({ error: { msg: "Searches not found." } });
      searches.queries.splice(index, 1);
      await searches.save();
      return res.status(200).json({ success: { msg: "Search deleted." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeAllSearches(req: RequestInterface, res: Response) {
   try {
      const searches = await Searches.findOne({ userId: req.profile!._id });
      if (!searches) return res.status(400).json({ error: { msg: "Searches not found." } });
      searches.queries = [];
      await searches.save();
      return res.status(200).json({ success: { msg: "Done" } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

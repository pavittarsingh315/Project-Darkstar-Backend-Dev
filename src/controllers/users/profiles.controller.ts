import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Profile from "../../models/Profile.model";
import Follows from "../../models/Followers.model";
import Searches from "../../models/Searches.model";
import Whitelist from "../../models/Whitelist.model";
import { merge } from "lodash";
import log from "../../logger";

export async function makeSearch(req: RequestInterface, res: Response) {
   try {
      const searchResults = await Profile.find({
         username: { $regex: `^${req.params.query}`, $options: "i" },
      }).select(["username", "miniPortrait", "name"]);
      return res.status(200).json({ success: { searchResults } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getUserProfile(req: RequestInterface, res: Response) {
   try {
      const profile = await Profile.findOne({ _id: req.params.profileId }).select([
         "-numWhitelisted",
         "-createdAt",
         "-updatedAt",
         "-userId",
         "-__v",
      ]);
      if (!profile) return res.status(400).json({ error: { msg: "Could not retrieve profile." } });
      const areFollowing = await Follows.findOne({ followedId: profile._id, followerId: req.profile!._id });
      const areWhitelisted = await Whitelist.findOne({ ownerId: profile._id, allowedId: req.profile!._id });
      const profileIsMine = profile._id.equals(req.profile!._id);
      return res.status(200).json({
         success: {
            profile: merge(
               profile.toJSON(),
               { areFollowing: areFollowing ? true : false },
               { areWhitelisted: areWhitelisted || profileIsMine ? true : false },
               { profileIsMine }
            ),
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not retrieve profile" } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getUserSearches(req: RequestInterface, res: Response) {
   try {
      const searches = await Searches.findOne({ profileId: req.profile!._id });
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
      const searches = await Searches.findOne({ profileId: req.profile!._id });
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
      const searches = await Searches.findOne({ profileId: req.profile!._id });
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

export async function addRecentSearch(req: RequestInterface, res: Response) {
   try {
      const searches = await Searches.findOne({ profileId: req.profile!._id });
      if (!searches) {
         const newSearches = new Searches({
            profileId: req.profile!._id,
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
      return res.status(200).json({ success: { msg: "Search added." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function addToWhitelist(req: RequestInterface, res: Response) {
   try {
      const toBeAdded = req.params.profileId;
      if(toBeAdded == req.profile!._id) return res.status(400).json({ error: { msg: "Cannot add yourself to your whitelist." } }); // prettier-ignore

      const alreadyWhitelisted = await Whitelist.findOne({ ownerId: req.profile!._id, allowedId: toBeAdded });
      if (alreadyWhitelisted) return res.status(400).json({ error: { msg: "User is already whitelisted." } });

      const doesUserFollow = await Follows.findOne({ followedId: req.profile!._id, followerId: toBeAdded });
      if (!doesUserFollow) return res.status(400).json({ error: { msg: "Cannot whitelist user who doesn't follow you." } }); // prettier-ignore

      const profileExists = await Profile.findOne({ _id: toBeAdded });
      if (!profileExists) return res.status(400).json({ error: { msg: "Could not add user to your whitelist." } });

      const newWhitelistObj = new Whitelist({ ownerId: req.profile!._id, allowedId: toBeAdded });
      req.profile!.numWhitelisted += 1;

      await newWhitelistObj.save();
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "User added to whitelist." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not add user to your whitelist." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function removeFromWhitelist(req: RequestInterface, res: Response) {
   try {
      const toBeRemoved = req.params.profileId;
      if(toBeRemoved == req.profile!._id) return res.status(400).json({ error: { msg: "Cannot remove yourself from your whitelist." } }); // prettier-ignore

      const whitelistObj = await Whitelist.findOne({ ownerId: req.profile!._id, allowedId: toBeRemoved });
      if (!whitelistObj) return res.status(400).json({ error: { msg: "User is already not whitelisted." } });

      req.profile!.numWhitelisted -= 1;

      await whitelistObj.deleteOne();
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "User removed from whitelist." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not remove user from your whitelist." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getWhitelist(req: RequestInterface, res: Response) {
   try {
      const whitelistId: Array<{ allowedId: string }> = await Whitelist.find({ ownerId: req.profile!._id }).select([
         "allowedId",
         "-_id",
      ]);

      let whitelist: Array<{ miniPortrait: string; username: string; name: string }> = [];
      if (whitelistId.length) {
         whitelist = await Profile.find({ _id: { $in: whitelistId.map((e) => e.allowedId) } }).select(["miniPortrait", "username", "name"]); // prettier-ignore
      }

      return res.status(200).json({ success: { whitelist } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

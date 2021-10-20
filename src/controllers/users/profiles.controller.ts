import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import Profile from "../../models/Profile.model";
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

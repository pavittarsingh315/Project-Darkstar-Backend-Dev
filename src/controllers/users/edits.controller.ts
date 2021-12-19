import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import User from "../../models/User.model";
import { deleteObject } from "../../aws";
import log from "../../logger";

export async function editUsername(req: RequestInterface, res: Response) {
   try {
      if (!req.body.username) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      const { username }: { username: string } = req.body;

      if (username.length < 6) return res.status(400).json({ error: { msg: "Username too short." } });
      if (username.length > 30) return res.status(400).json({ error: { msg: "Username too long." } });

      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) return res.status(400).json({ error: { msg: "Username taken" } });

      req.user!.username = username;
      req.profile!.username = username;
      await req.user!.save();
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "Username updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editName(req: RequestInterface, res: Response) {
   try {
      if (!req.body.name) req.body.name = "";
      const { name }: { name: string } = req.body;

      if (name.length > 30) return res.status(400).json({ error: { msg: "Name too long." } });

      req.profile!.name = name;
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "Name updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editBio(req: RequestInterface, res: Response) {
   try {
      if (!req.body.bio) req.body.bio = "";
      const { bio }: { bio: string } = req.body;

      if (bio.length > 150) return res.status(400).json({ error: { msg: "Bio too long." } });
      if(bio.split("\n").length > 5) return res.status(400).json({ error: { msg: "Line limit exceeded." } }); // prettier-ignore

      req.profile!.bio = bio;
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "Bio updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editProfilePortrait(req: RequestInterface, res: Response) {
   try {
      if(!req.body.oldPortrait || !req.body.newPortrait) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      const { oldPortrait, newPortrait }: { oldPortrait: string; newPortrait: string } = req.body;

      if (oldPortrait !== "https://nerajima.s3.us-west-1.amazonaws.com/default.png") {
         const imgName = oldPortrait.split("?")[0].split("/")[6];
         await deleteObject(`resized/profilePics/700x700/${imgName}`);
      }

      req.profile!.portrait = newPortrait;
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "Portrait updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editBlacklistMsg(req: RequestInterface, res: Response) {
   try {
      if (!req.body.newMsg) req.body.newMsg = "";
      const { newMsg }: { newMsg: string } = req.body;

      if (newMsg.length > 100) return res.status(400).json({ error: { msg: "Message is too long." } });
      if(newMsg.split("\n").length > 5) return res.status(400).json({ error: { msg: "Line limit exceeded." } }); // prettier-ignore

      req.profile!.blacklistMsg = newMsg;
      await req.profile!.save();

      return res.status(200).json({ success: { msg: "Message updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

import { Response } from "express";
import { RequestInterface } from "../../middleware/userPermissionHandler";
import User, { UserInterface } from "../../models/User.model";
import Profile, { ProfileInterface } from "../../models/Profile.model";
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

      const userExists = await User.findOne({ _id: req.user_id });
      if (!userExists) return res.status(400).json({ error: { msg: "Could not find your account." } });
      const user = <UserInterface>userExists;

      const profileExists = await Profile.findOne({ userId: req.user_id }).select(["-followers", "-following", "-privateFollowing", "-whitelist"]); // prettier-ignore
      if (!profileExists) return res.status(400).json({ error: { msg: "Could not find your profile." } });
      const profile = <ProfileInterface>profileExists;

      user.username = username;
      profile.username = username;
      await user.save();
      await profile.save();

      return res.status(200).json({ success: { msg: "Username updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not update your username." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editName(req: RequestInterface, res: Response) {
   try {
      if (!req.body.name) req.body.name = "";
      const { name }: { name: string } = req.body;

      if (name.length > 30) return res.status(400).json({ error: { msg: "Name too long." } });

      const profileExists = await Profile.findOne({ userId: req.user_id }).select(["-followers", "-following", "-privateFollowing", "-whitelist"]); // prettier-ignore
      if (!profileExists) return res.status(400).json({ error: { msg: "Could not find your profile." } });
      const profile = <ProfileInterface>profileExists;

      profile.name = name;
      await profile.save();

      return res.status(200).json({ success: { msg: "Name updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not update your name." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function editBio(req: RequestInterface, res: Response) {
   try {
      if (!req.body.bio) req.body.bio = "";
      const { bio }: { bio: string } = req.body;

      if (bio.length > 225) return res.status(400).json({ error: { msg: "Bio too long." } });
      if(bio.split("\n").length > 5) return res.status(400).json({ error: { msg: "Line limit exceeded." } }); // prettier-ignore

      const profileExists = await Profile.findOne({ userId: req.user_id }).select(["-followers", "-following", "-privateFollowing", "-whitelist"]); // prettier-ignore
      if (!profileExists) return res.status(400).json({ error: { msg: "Could not find your profile." } });
      const profile = <ProfileInterface>profileExists;

      profile.bio = bio;
      await profile.save();

      return res.status(200).json({ success: { msg: "Bio updated." } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "Could not update your bio." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

import { Request, Response, NextFunction } from "express";
import User, { UserInterface } from "../models/User.model";
import Profile, { ProfileInterface } from "../models/Profile.model";
import jwt from "jsonwebtoken";
import TokenInterface from "../interfaces/tokens";
import log from "../logger";

export interface RequestInterface extends Request {
   user?: UserInterface;
   profile?: ProfileInterface;
}

async function userPermissionHandler(req: RequestInterface, res: Response, next: NextFunction) {
   try {
      if(!req.header("Authorization")) return res.status(400).json({ error: { msg: "Could not authorize action." } }) // prettier-ignore
      if (!req.body.userId) return res.status(400).json({ error: { msg: "Id not found." } });
      const token = <string>req.header("Authorization")?.split(" ")[1];
      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const decoded = <TokenInterface>(<unknown>jwt.verify(token, accessSecret, { ignoreExpiration: true }));

      if (Date.now() < decoded.exp * 1000) {
         if (decoded.userId != req.body.userId) return res.status(403).json({ error: { msg: "Invalid id." } });
         const user = await User.findOne({ _id: decoded.userId });
         if (!user) return res.status(403).json({ error: { msg: "Invalid token." } });
         const profile = await Profile.findOne({ userId: user._id }).select(["-whitelist"]); // prettier-ignore
         if (!profile) return res.status(403).json({ error: { msg: "Invalid token." } });
         req.user = user;
         req.profile = profile;
         next();
      } else {
         return res.status(403).json({ error: { msg: "Permission denied." } });
      }

      return;
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export default userPermissionHandler;

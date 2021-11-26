import { Request, Response } from "express";
import User, { UserInterface } from "../../models/User.model";
import Profile, { ProfileInterface } from "../../models/Profile.model";
import Whitelist from "../../models/Whitelist.models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import log from "../../logger";
import { omit, merge } from "lodash";
import TokenInterface from "../../interfaces/tokens";
import millisecondsToTimeLeft from "../../utils/msToTimeLeft";

export async function login(req: Request, res: Response) {
   try {
      if (!req.body.identifier || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.identifier = req.body.identifier.replace(/\s+/g, "").toLowerCase();
      const { identifier, password }: { identifier: string; password: string } = req.body;

      const userExists = await User.findOne({ contact: identifier });
      if (!userExists) return res.status(400).json({ error: { msg: "Account not found." } });
      const user = <UserInterface>userExists;

      if (user.banTill) {
         const timeNowInString = new Date().getTime();
         const banTimeInString = user.banTill.getTime();
         if (timeNowInString <= banTimeInString) {
            const timeTillUnBan = millisecondsToTimeLeft(banTimeInString - timeNowInString);
            return res.status(400).json({ error: { msg: `You are banned for ${timeTillUnBan}.` } });
         } else if (timeNowInString > banTimeInString) {
            user.banTill = null;
            await user.save();
         }
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) return res.status(400).json({ error: { msg: "Incorrect password." } });

      const profileExists = await Profile.findOne({ userId: user._id });
      if (!profileExists) return res.status(400).json({ error: { msg: "Profile not found." } });
      const profile = <ProfileInterface>profileExists;

      const whitelist = await Whitelist.findOne({ profileId: profile._id });
      if (!whitelist) return res.status(400).json({ error: { msg: "Whitelist not found." } });

      user.lastLogin = new Date(new Date().getTime());
      await user.save();

      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = <string>process.env.REFRESH_TOKEN_SECRET;
      const access = jwt.sign({ token_type: "access", userId: user._id, user_type: user.userType }, accessSecret, { expiresIn: "30d" }); // prettier-ignore
      const refresh = jwt.sign({ token_type: "refresh", userId: user._id, user_type: user.userType }, refreshSecret, { expiresIn: "2y" }); // prettier-ignore

      return res.status(200).json({
         success: {
            access,
            refresh,
            profile: merge(omit(profile.toJSON(), ["createdAt", "updatedAt", "__v"]), {
               blacklistMsg: whitelist.blacklistMsg,
            }),
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function tokenLogin(req: Request, res: Response) {
   try {
      if (!req.body.access || !req.body.refresh) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.access = req.body.access.split(" ")[1];
      req.body.refresh = req.body.refresh.split(" ")[1];
      let { access, refresh }: { access: string; refresh: string } = req.body;

      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = <string>process.env.REFRESH_TOKEN_SECRET;
      const accessDecoded = <TokenInterface>(<unknown>jwt.verify(access, accessSecret, { ignoreExpiration: true }));
      const refreshDecoded = <TokenInterface>(<unknown>jwt.verify(refresh, refreshSecret)); // by not ignoring refresh expiration, it'll return an error cause refresh is critical

      if (accessDecoded.userId !== refreshDecoded.userId) throw Error("Token pair are a mismatch.");

      if (Date.now() >= accessDecoded.exp * 1000) {
         // create new access token if access is expired.
         access = jwt.sign({ token_type: "access", userId: refreshDecoded.userId, user_type: refreshDecoded.user_type }, accessSecret, { expiresIn: "30d" }); // prettier-ignore
      }

      const user = await User.findById(accessDecoded.userId);
      if (!user) throw Error("User does not exist.");

      if (user.banTill) {
         const timeNowInString = new Date().getTime();
         const banTimeInString = user.banTill.getTime();
         if (timeNowInString <= banTimeInString) {
            const timeTillUnBan = millisecondsToTimeLeft(banTimeInString - timeNowInString);
            return res.status(400).json({ error: { msg: `You are banned for ${timeTillUnBan}.` } });
         } else if (timeNowInString > banTimeInString) {
            user.banTill = null;
            await user.save();
         }
      }

      const profileExists = await Profile.findOne({ userId: user._id });
      if (!profileExists) return res.status(400).json({ error: { msg: "Profile not found." } });
      const profile = <ProfileInterface>profileExists;

      const whitelist = await Whitelist.findOne({ profileId: profile._id });
      if (!whitelist) return res.status(400).json({ error: { msg: "Whitelist not found." } });

      user.lastLogin = new Date(new Date().getTime());
      await user.save();

      return res.status(200).json({
         success: {
            access,
            refresh,
            profile: merge(omit(profile.toJSON(), ["createdAt", "updatedAt", "__v"]), {
               blacklistMsg: whitelist.blacklistMsg,
            }),
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

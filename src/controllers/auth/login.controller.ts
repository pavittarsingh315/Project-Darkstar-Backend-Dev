import { Request, Response } from "express";
import User from "../../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ValidateEmail from "../../utils/emailValidator";
import log from "../../logger";
import { omit } from "lodash";
import TokenInterface from "../../interfaces/tokens";
import millisecondsToTimeLeft from "../../utils/msToTimeLeft";

export async function login(req: Request, res: Response) {
   try {
      if (!req.body.identifier || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.identifier = req.body.identifier.replace(/\s+/g, "").toLowerCase();
      const { identifier, password }: { identifier: string; password: string } = req.body;

      const isEmail = ValidateEmail(identifier);
      let user;
      if (isEmail) {
         const userWithEmail = await User.findOne({ contact: identifier });
         if (!userWithEmail) return res.status(400).json({ error: { msg: "No user with this email." } });
         user = userWithEmail;
      } else {
         const userWithPhone = await User.findOne({ contact: identifier });
         if (!userWithPhone) return res.status(400).json({ error: { msg: "No user with this phone." } });
         user = userWithPhone;
      }

      if (user.banTill) {
         const timeNowInString = new Date().getTime();
         const banTimeInString = user.banTill.getTime();
         if (timeNowInString <= banTimeInString) {
            const timeTillUnBan = millisecondsToTimeLeft(banTimeInString - timeNowInString);
            return res.status(400).json({ error: { msg: `You are banned for ${timeTillUnBan}.` } });
         } else if (timeNowInString > banTimeInString) {
            await user.updateOne({ banTill: null });
         }
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) return res.status(400).json({ error: { msg: "Incorrect password." } });

      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = <string>process.env.REFRESH_TOKEN_SECRET;
      const access = jwt.sign({ token_type: "access", userId: user._id }, accessSecret, { expiresIn: "30d" });
      const refresh = jwt.sign({ token_type: "refresh", userId: user._id }, refreshSecret, { expiresIn: "2y" });

      return res.status(200).json({
         success: {
            access,
            refresh,
            user: omit(user.toJSON(), ["banTill", "password", "createdAt", "updatedAt", "strikes"]),
         },
      });
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function tokenLogin(req: Request, res: Response) {
   try {
      if (!req.body.access || !req.body.refresh) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      let { access, refresh }: { access: string; refresh: string } = req.body;

      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = <string>process.env.REFRESH_TOKEN_SECRET;
      const accessDecoded = <TokenInterface>(<unknown>jwt.verify(access, accessSecret, { ignoreExpiration: true }));
      const refreshDecoded = <TokenInterface>(<unknown>jwt.verify(refresh, refreshSecret)); // by not ignoring refresh expiration, it'll return an error cause refresh is critical

      if (accessDecoded.userId !== refreshDecoded.userId) throw Error("Token pair are a mismatch.");

      if (Date.now() >= accessDecoded.exp * 1000) {
         // create new access token if access is expired.
         access = jwt.sign({ token_type: "access", userId: refreshDecoded.userId }, accessSecret, { expiresIn: "30d" });
      }

      const user = await User.findById(accessDecoded.userId);
      if (!user) throw Error("User does not exist.");

      return res.status(200).json({
         success: {
            access,
            refresh,
            user: omit(user.toJSON(), ["banTill", "password", "createdAt", "updatedAt", "strikes"]),
         },
      });
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

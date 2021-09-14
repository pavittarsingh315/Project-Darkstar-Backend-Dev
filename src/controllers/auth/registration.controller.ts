import { Request, Response } from "express";
import User from "../../models/User.model";
import Profile from "../../models/Profile.model";
import TemporaryObject from "../../models/TempObj.model";
import ValidateEmail from "../../utils/emailValidator";
import jwt from "jsonwebtoken";
import { SendRegistrationMail } from "../../utils/sendEmail";
import { SendRegistrationText } from "../../utils/sendText";
import log from "../../logger";
import { omit } from "lodash";

export async function initiateRegistration(req: Request, res: Response) {
   try {
      if (!req.body.contact || !req.body.username || !req.body.name || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      let { contact, username, name, password }: { contact: string; username: string; name: string, password: string } = req.body; // prettier-ignore

      if (username.length < 6) return res.status(400).json({ error: { msg: "Username too short." } });
      if (username.length > 30) return res.status(400).json({ error: { msg: "Username too long." } });
      if (contact.length > 50) return res.status(400).json({ error: { msg: "Contact too long." } });
      if (password.length < 10) return res.status(400).json({ error: { msg: "Password too short." } });

      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) return res.status(400).json({ error: { msg: "Username taken" } });

      const registrationAlreadyInitialized = await TemporaryObject.findOne({ contact: contact });
      if (registrationAlreadyInitialized) return res.status(400).json({ error: { msg: "Registration process already started. Try again in a few minutes." } }); // prettier-ignore

      const contactIsEmail = ValidateEmail(contact);
      const contactTaken = await User.findOne({ contact: contact });
      if (contactTaken) {
         if (contactIsEmail) {
            return res.status(400).json({ error: { msg: "Email address already in use." } });
         } else {
            return res.status(400).json({ error: { msg: "Contact already in use." } });
         }
      }

      const verification_code: number = Math.floor(100000 + Math.random() * 900000);
      const newTempObj = new TemporaryObject({ contact, verification_code });
      const savedTempObj = await newTempObj.save();
      if (!savedTempObj) throw Error("Something went wrong.");

      if (contactIsEmail) {
         await SendRegistrationMail(contact, name, verification_code);
         return res.status(200).json({ success: { msg: "An email as been sent with a verification code." } });
      } else {
         await SendRegistrationText(verification_code, contact);
         return res.status(200).json({ success: { msg: "A text as been sent with a verification code." } });
      }
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function finializeRegistration(req: Request, res: Response) {
   try {
      if (!req.body.code || !req.body.contact || !req.body.username || !req.body.name || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      req.body.code = Number(req.body.code);
      let { code, contact }: { code: number; contact: string } = req.body;

      const tempObj = await TemporaryObject.findOne({ contact });
      if(!tempObj) return res.status(400).json({ error: { msg: "Code has expired and your registration process has been terminated. Restart the registration process." } }); // prettier-ignore

      if (tempObj.verification_code !== code) return res.status(400).json({ error: { msg: "Incorrect Code." } });

      const newUser = new User(omit(req.body, ["code"]));
      const savedUser = await newUser.save();
      if (!savedUser) throw Error("Something went wrong.");

      const newProfile = new Profile({ userId: savedUser._id, username: savedUser.username, name: savedUser.name });
      const savedProfile = await newProfile.save();
      if (!savedProfile) throw Error("Something went wrong.");

      await tempObj.deleteOne();

      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = <string>process.env.REFRESH_TOKEN_SECRET;
      const access = jwt.sign({ token_type: "access", userId: savedUser._id, user_type: savedUser.userType }, accessSecret, { expiresIn: "30d" }); // prettier-ignore
      const refresh = jwt.sign({ token_type: "refresh", userId: savedUser._id, user_type: savedUser.userType }, refreshSecret, { expiresIn: "2y" }); // prettier-ignore

      return res.status(200).json({
         success: {
            access,
            refresh,
            profile: omit(savedProfile.toJSON(), ["userId", "username", "name", "followers", "following", "privateFollowing", "whitelist", "createdAt", "updatedAt", "__v"]), // prettier-ignore
            user: omit(savedUser.toJSON(), ["banTill", "password", "strikes", "userType", "lastLogin", "createdAt", "updatedAt", "__v"]), // prettier-ignore
         },
      });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

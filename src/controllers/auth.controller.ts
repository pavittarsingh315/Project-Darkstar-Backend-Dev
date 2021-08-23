import { Request, Response } from "express";
import User from "../models/User.model";
import TemporaryUser from "../models/TempUser.model";
import ValidateEmail from "../utils/emailValidator";
import SendMail from "../utils/sendEmail";
import SendText from "../utils/sendText";
import log from "../logger";
import { omit } from "lodash";

export async function initiateRegistration(req: Request, res: Response) {
   try {
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      let { contact, username, name }: { contact: string; username: string; name: string } = req.body;
      if (!contact || !username || !name) throw Error("Please include all fields.");

      if (username.length < 6) throw Error("Username too short.");
      if (username.length > 30) throw Error("Username too long.");

      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) throw Error("Username taken.");

      const registrationAlreadyInitialized = await TemporaryUser.findOne({ contact: contact });
      if (registrationAlreadyInitialized) throw Error("Registration process already started.");

      const contactIsEmail = ValidateEmail(contact);
      const contactTaken = await User.findOne({ contact: contact });
      if (contactTaken) {
         if (contactIsEmail) {
            throw Error("Email address already in use.");
         } else {
            throw Error("Phone number already in use.");
         }
      }

      const verification_code: number = Math.floor(100000 + Math.random() * 900000);
      const newTempUser = new TemporaryUser({ contact, verification_code });
      const savedTempUser = await newTempUser.save();
      if (!savedTempUser) throw Error("Something went wrong.");

      if (contactIsEmail) {
         await SendMail(contact, name, verification_code);
         return res.status(200).json({ success: { msg: "An email as been sent with a verification code." } });
      } else {
         await SendText(verification_code, contact);
         return res.status(200).json({ success: { msg: "A text as been sent with a verification code." } });
      }
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function finializeRegistration(req: Request, res: Response) {
   try {
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      req.body.code = Number(req.body.code);
      let { code, contact, username, name, password }: { code: number; contact: string; username: string; name: string; password: string } = req.body; // prettier-ignore
      if (!code || !contact || !username || !name || !password) throw Error("Please include all fields.");

      const tempUser = await TemporaryUser.findOne({ contact });
      if(!tempUser) throw Error("Code has expired and your registration process has been terminated. Restart the registration process.") // prettier-ignore

      if (tempUser.verification_code !== code) throw Error("Incorrect Code.");

      const newUser = new User(omit(req.body, ["code"]));
      const savedUser = await newUser.save();
      if (!savedUser) throw Error("Something went wrong.");

      await tempUser.deleteOne();

      return res.status(201).json({ success: { msg: "Account Created Successfully!" } });
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

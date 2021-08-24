import { Request, Response } from "express";
import User from "../../models/User.model";
import TemporaryUser from "../../models/TempUser.model";
import ValidateEmail from "../../utils/emailValidator";
import SendMail from "../../utils/sendEmail";
import SendText from "../../utils/sendText";
import log from "../../logger";
import { omit } from "lodash";

export async function initiateRegistration(req: Request, res: Response) {
   try {
      if (!req.body.contact || !req.body.username || !req.body.name) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      let { contact, username, name }: { contact: string; username: string; name: string } = req.body;

      if (username.length < 6) return res.status(400).json({ error: { msg: "Username too short." } });
      if (username.length > 30) return res.status(400).json({ error: { msg: "Username too long." } });

      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) return res.status(400).json({ error: { msg: "Username taken" } });

      const registrationAlreadyInitialized = await TemporaryUser.findOne({ contact: contact });
      if (registrationAlreadyInitialized) return res.status(400).json({ error: { msg: "Registration process already started." } }); // prettier-ignore

      const contactIsEmail = ValidateEmail(contact);
      const contactTaken = await User.findOne({ contact: contact });
      if (contactTaken) {
         if (contactIsEmail) {
            return res.status(400).json({ error: { msg: "Email address already in use." } });
         } else {
            return res.status(400).json({ error: { msg: "Phone number already in use." } });
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
      if (!req.body.code || !req.body.contact || !req.body.username || !req.body.name || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.username = req.body.username.replace(/\s+/g, "").toLowerCase();
      req.body.code = Number(req.body.code);
      let { code, contact }: { code: number; contact: string } = req.body;

      const tempUser = await TemporaryUser.findOne({ contact });
      if(!tempUser) return res.status(400).json({ error: { msg: "Code has expired and your registration process has been terminated. Restart the registration process." } }); // prettier-ignore

      if (tempUser.verification_code !== code) return res.status(400).json({ error: { msg: "Incorrect Code." } });

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

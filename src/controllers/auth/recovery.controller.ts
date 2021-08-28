import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import TemporaryObject from "../../models/TempObj.model";
import User, { UserInterface } from "../../models/User.model";
import ValidateEmail from "../../utils/emailValidator";
import findUserByContact from "../../helpers/findUserByContact";
import { SendPasswordResetMail } from "../../utils/sendEmail";
import { SendPasswordResetText } from "../../utils/sendText";
import log from "../../logger";

export async function requestPasswordReset(req: Request, res: Response) {
   try {
      if (!req.body.contact) return res.status(400).json({ error: { msg: "Please include all fields." } });
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      const { contact }: { contact: string } = req.body;
      const isEmail = ValidateEmail(contact);

      const response = await findUserByContact(contact);
      if (response.error) return res.status(400).json({ error: { msg: response.error } });
      const user = <UserInterface>response.success;

      const verification_code: number = Math.floor(100000 + Math.random() * 900000);
      const newTempObj = new TemporaryObject({ contact: user.contact, verification_code });
      const savedTempObj = await newTempObj.save();
      if (!savedTempObj) throw Error("Something went wrong.");

      if (isEmail) {
         await SendPasswordResetMail(user.contact, verification_code);
         return res.status(200).json({ success: { msg: "An email as been sent with a verification code." } });
      } else {
         await SendPasswordResetText(verification_code, user.contact);
         return res.status(200).json({ success: { msg: "A text as been sent with a verification code." } });
      }
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function confirmPasswordReset(req: Request, res: Response) {
   try {
      if (!req.body.code|| !req.body.contact || !req.body.password) return res.status(400).json({ error: { msg: "Please include all fields." } }); // prettier-ignore
      req.body.contact = req.body.contact.replace(/\s+/g, "").toLowerCase();
      req.body.code = Number(req.body.code);
      const { code, contact, password }: { code: number; contact: string; password: string } = req.body;

      const tempObj = await TemporaryObject.findOne({ contact });
      if(!tempObj) return res.status(400).json({ error: { msg: "Code has expired. Request another password reset." } }); // prettier-ignore

      if (tempObj.verification_code !== code) return res.status(400).json({ error: { msg: "Incorrect Code." } });

      const user = await User.findOne({ contact });
      if (!user) return res.status(400).json({ error: { msg: "No user with this contact." } });

      const samePass = await bcrypt.compare(password, user.password);
      if (samePass) return res.status(400).json({ error: { msg: "This is your old password...💀" } });

      user.password = password;
      await user.save();

      await tempObj.deleteOne();

      return res.status(200).json({ success: { msg: "Password successfully updated." } });
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

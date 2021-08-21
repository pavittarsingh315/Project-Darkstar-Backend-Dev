import { DocumentDefinition } from "mongoose";
import User, { UserInterface } from "../models/User.model";
import ValidateEmail from "../utils/emailValidator";
import SendMail from "../utils/sendEmail";

export async function createUser(input: DocumentDefinition<UserInterface>) {
   try {
      input.username = input.username.replace(/\s+/g, "");
      input.contact = input.contact.replace(/\s+/g, "");

      const usernameTaken = await User.findOne({ username: input.username });
      if (usernameTaken) throw Error("Username taken.");

      const isEmail: boolean = ValidateEmail(input.contact);
      if (isEmail) {
         const emailTaken = await User.findOne({ contact: input.contact });
         if (emailTaken) throw Error("Email address already in use.");
      } else {
         const phoneTaken = await User.findOne({ contact: input.contact });
         if (phoneTaken) throw Error("Phone number already in use.");
      }

      const newUser = new User(input);
      const savedUser = await newUser.save();
      if (!savedUser) throw Error("Something went wrong...");

      if (isEmail) {
         await SendMail(input.contact, input.name);
         return "Account created successfully! An activation link has been sent to your email. Link expires in 1 hour!";
      } else {
         // Send Text
         return "We have sent you an activation code. Enter it here.";
      }
   } catch (err) {
      throw Error(err.message);
   }
}

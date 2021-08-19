import { DocumentDefinition } from "mongoose";
import User, { UserInterface } from "../models/User.model";
import { omit } from "lodash";

export async function createUser(input: DocumentDefinition<UserInterface>) {
   try {
      input.username = input.username.replace(/\s+/g, "");
      input.phone = input.phone.replace(/\s+/g, "");

      let usernameTaken = await User.findOne({ username: input.username });
      if (usernameTaken) throw Error("Username taken.");

      let phoneTaken = await User.findOne({ phone: input.phone });
      if (phoneTaken) throw Error("Phone number already in use.");

      let newUser = new User(input);
      let savedUser = await newUser.save();
      if (!savedUser) throw Error("Something went wrong...");

      // Send Text Message

      return omit(savedUser.toJSON(), ["password"]);
   } catch (err) {
      console.log(err);
      throw Error(err.message);
   }
}

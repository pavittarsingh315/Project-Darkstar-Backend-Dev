import User from "../models/User.model";
import ValidateEmail from "../utils/emailValidator";

async function findUserByContact(contact: string) {
   const isEmail = ValidateEmail(contact);
   let user;
   if (isEmail) {
      const userWithEmail = await User.findOne({ contact });
      if (!userWithEmail) return { error: "No user with this email." };
      user = userWithEmail;
   } else {
      const userWithPhone = await User.findOne({ contact });
      if (!userWithPhone) return { error: "No user with this phone." };
      user = userWithPhone;
   }

   return { success: user };
}

export default findUserByContact;

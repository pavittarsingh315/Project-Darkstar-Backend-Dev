import { Request, Response } from "express";
import User from "../../models/User.model";
import { RequestInterface } from "../../middleware/staffPermissionHandler";
import log from "../../logger";

export async function banUser(req: Request, res: Response) {
   try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(400).json({ error: { msg: "User does not exist." } });

      if (user.banTill) return res.status(400).json({ error: { msg: "User is already under a ban." } });

      if (user.userType === "staff" || user.userType === "admin") {
         return res.status(400).json({ error: { msg: `You can't ban this user they're a(n) ${user.userType} member. Suggested action is to demote or delete the user.` } }); // prettier-ignore
      }

      let banLength;
      let maxStrikesReached = false;
      switch (user.strikes) {
         case 0:
            const oneDayBan = new Date(new Date().getTime() + 24 * 3600 * 1000); // 24 * 3600 * 1000 = 1 day in milliseconds
            await user.updateOne({ strikes: 1, banTill: oneDayBan });
            banLength = "one day";
            break;
         case 1:
            const oneWeekBan = new Date(new Date().getTime() + 7 * 24 * 3600 * 1000); // 7 * 24 * 3600 * 1000 = 1 week in milliseconds
            await user.updateOne({ strikes: 2, banTill: oneWeekBan });
            banLength = "one week";
            break;
         case 2:
            const oneMonthBan = new Date(new Date().getTime() + 30 * 24 * 3600 * 1000); // 30 * 24 * 3600 * 1000 = 1 month in milliseconds
            await user.updateOne({ strikes: 3, banTill: oneMonthBan });
            banLength = "one month";
            break;
         case 3:
            maxStrikesReached = true;
            break;
         default:
            break;
      }

      if (maxStrikesReached)
         return res.status(207).json({
            success: {
               msg: "This user has exceeded the maximum number of strikes. Suggested Action: Delete the user's account.",
            },
         });

      return res.status(200).json({ success: { msg: `User has been ban for ${banLength}.` } });
   } catch (err) {
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "User does not exist." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function deleteUser(req: RequestInterface, res: Response) {
   try {
      const toBeDeletedUser = await User.findById(req.params.id);
      if (!toBeDeletedUser) return res.status(400).json({ error: { msg: "User does not exist." } });

      // You cannot delete a superuser
      if (toBeDeletedUser.userType === "superuser") {
         return res.status(400).json({ error: { msg: "You can't delete a superuser." } });
      }

      // Only superuser can delete admin
      if (toBeDeletedUser.userType === "admin" && req.user_type !== "superuser") {
         return res.status(400).json({ error: { msg: "You do not have permission to delete an admin." } });
      }

      // Only superusers and admins can delete staff member.
      if (toBeDeletedUser.userType === "staff" && req.user_type === "staff") {
         return res.status(400).json({ error: { msg: "You cannot delete other staff." } });
      }

      // Superuser, admin, and staff can delete normal user. Logic is done in the middleware
      await toBeDeletedUser.deleteOne();

      return res.status(200).json({ success: { msg: "User successfully deleted." } });
   } catch (err) {
      log.error(err.message);
      if (err.message.substring(0, 23) === "Cast to ObjectId failed")
         return res.status(400).json({ error: { msg: "User does not exist." } });
      return res.status(500).json({ error: { msg: err.message } });
   }
}

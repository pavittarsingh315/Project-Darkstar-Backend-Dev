import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import TokenInterface from "../interfaces/tokens";
import log from "../logger";

export interface RequestInterface extends Request {
   user_type?: string;
}

async function staffPermissionHandler(req: RequestInterface, res: Response, next: NextFunction) {
   try {
      if(!req.header("Authorization")) return res.status(400).json({ error: { msg: "No authorization token found." } }) // prettier-ignore
      const token = <string>req.header("Authorization")?.split(" ")[1];
      const accessSecret = <string>process.env.ACCESS_TOKEN_SECRET;
      const decoded = <TokenInterface>(<unknown>jwt.verify(token, accessSecret));

      if (decoded.user_type === "staff" || decoded.user_type === "admin" || decoded.user_type === "superuser") {
         req.user_type = decoded.user_type;
         next();
      } else {
         return res.status(403).json({ error: { msg: "Permission denied." } });
      }

      return;
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export default staffPermissionHandler;

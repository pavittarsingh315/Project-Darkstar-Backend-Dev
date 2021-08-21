import { Request, Response } from "express";
import { createUser } from "../helpers/auth.helpers";
import log from "../logger";

export async function registerUser(req: Request, res: Response) {
   try {
      const { contact, name, username, password } = req.body;
      if (!contact || !name || !username || !password) throw Error("Please include all fields.");
      const msg = await createUser(req.body);
      return res.status(201).json({ success: { msg } });
   } catch (err) {
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

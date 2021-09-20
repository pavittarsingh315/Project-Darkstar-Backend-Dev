import { Request, Response } from "express";
import { generateUploadUrl, deleteObject } from "../../aws";
import log from "../../logger";
import { RequestInterface } from "../../middleware/userPermissionHandler";

export async function getUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl();
      const imgUrl = url.split("?")[0];
      const imgName = `profilePics/${url.split("/")[4].split("?")[0]}`;
      return res.status(200).json({ success: { url, imgUrl, imgName } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function deleteS3Object(req: Request, res: Response) {
   try {
      await deleteObject(req.body.imgName);
      return res.status(200).json({ success: { msg: "done" } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

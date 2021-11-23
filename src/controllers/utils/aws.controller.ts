import { Response } from "express";
import { generateUploadUrl } from "../../aws";
import log from "../../logger";
import { RequestInterface } from "../../middleware/userPermissionHandler";

export async function getUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl();
      const imgUrl1 = url.split("?")[0].split("/");
      imgUrl1.splice(3, 0, "resized");
      imgUrl1.splice(5, 0, "300x300");
      const imgUrl = imgUrl1.toString().replace(/,/g, "/");

      return res.status(200).json({ success: { url, imgUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

import { Response } from "express";
import { generateUploadUrl } from "../../aws";
import log from "../../logger";
import { RequestInterface } from "../../middleware/userPermissionHandler";

export async function getProfilePicUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl("profilePics");
      const imgUrl1 = url.split("?")[0].split("/");
      imgUrl1.splice(3, 0, "resized");
      imgUrl1.splice(5, 0, "1000x1000");
      const imgUrl = imgUrl1.toString().replace(/,/g, "/");

      return res.status(200).json({ success: { url, imgUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getPostImageUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl("postImages");
      const imgUrl1 = url.split("?")[0].split("/");
      imgUrl1.splice(3, 0, "resized");
      imgUrl1.splice(5, 0, "1000x1000");
      const imgUrl = imgUrl1.toString().replace(/,/g, "/");

      return res.status(200).json({ success: { url, imgUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getPostVideoUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl("postVideos");
      const videoUrl = url.split("?")[0];

      return res.status(200).json({ success: { url, videoUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getPostThumbnailUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl("postThumbnails");
      const thumbnailUrl1 = url.split("?")[0].split("/");
      thumbnailUrl1.splice(3, 0, "resized");
      thumbnailUrl1.splice(5, 0, "300x300");
      const thumbnailUrl = thumbnailUrl1.toString().replace(/,/g, "/");

      return res.status(200).json({ success: { url, thumbnailUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

export async function getPostAudioUploadUrl(req: RequestInterface, res: Response) {
   try {
      const url = await generateUploadUrl("postAudios");
      const audioUrl = url.split("?")[0];

      return res.status(200).json({ success: { url, audioUrl } });
   } catch (e) {
      let err = <Error>e;
      log.error(err.message);
      return res.status(500).json({ error: { msg: err.message } });
   }
}

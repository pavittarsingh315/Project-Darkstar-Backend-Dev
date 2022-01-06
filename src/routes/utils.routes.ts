import express, { Router } from "express";
import {
   getProfilePicUploadUrl,
   getPostImageUploadUrl,
   getPostVideoUploadUrl,
   getPostThumbnailUploadUrl,
   getPostAudioUploadUrl,
} from "../controllers/utils/aws.controller";
import userPermissionHandler from "../middleware/userPermissionHandler";

const router: Router = express.Router();

router.get("/getProfilePicUploadUrl", userPermissionHandler, getProfilePicUploadUrl);
router.get("/getPostImageUploadUrl", userPermissionHandler, getPostImageUploadUrl);
router.get("/getPostVideoUploadUrl", userPermissionHandler, getPostVideoUploadUrl);
router.get("/getPostThumbnailUploadUrl", userPermissionHandler, getPostThumbnailUploadUrl);
router.get("/getPostAudioUploadUrl", userPermissionHandler, getPostAudioUploadUrl);

export default router;

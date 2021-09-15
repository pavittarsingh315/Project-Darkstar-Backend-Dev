import express, { Router } from "express";
import { getUploadUrl, deleteS3Object } from "../controllers/utils/aws.controller";
import userPermissionHandler from "../middleware/userPermissionHandler";

const router: Router = express.Router();

router.get("/getUploadUrl", userPermissionHandler, getUploadUrl);

router.delete("/deleteObject", userPermissionHandler, deleteS3Object);

export default router;

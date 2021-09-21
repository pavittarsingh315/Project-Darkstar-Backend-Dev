import express, { Router } from "express";
import { getUploadUrl } from "../controllers/utils/aws.controller";
import userPermissionHandler from "../middleware/userPermissionHandler";

const router: Router = express.Router();

router.post("/getUploadUrl", userPermissionHandler, getUploadUrl);

export default router;

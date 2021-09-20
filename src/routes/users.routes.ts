import express, { Router } from "express";
import userPermissionHandler from "../middleware/userPermissionHandler";
import { editUsername, editName, editBio } from "../controllers/users/edits.controller";

const router: Router = express.Router();

router.get("/editUsername", userPermissionHandler, editUsername);
router.get("/editName", userPermissionHandler, editName);
router.get("/editBio", userPermissionHandler, editBio);

export default router;

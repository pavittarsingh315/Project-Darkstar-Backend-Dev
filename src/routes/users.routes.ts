import express, { Router } from "express";
import userPermissionHandler from "../middleware/userPermissionHandler";
import { editUsername, editName, editBio, editProfilePortrait } from "../controllers/users/edits.controller";

const router: Router = express.Router();

router.put("/editUsername", userPermissionHandler, editUsername);
router.put("/editName", userPermissionHandler, editName);
router.put("/editBio", userPermissionHandler, editBio);
router.put("/editPortrait", userPermissionHandler, editProfilePortrait);

export default router;

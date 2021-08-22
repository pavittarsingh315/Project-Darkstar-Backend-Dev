import express, { Router } from "express";
import { initiateRegistration, finializeRegistration } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/initiateRegistration", initiateRegistration);
router.post("/finalizeRegistration", finializeRegistration);

export default router;

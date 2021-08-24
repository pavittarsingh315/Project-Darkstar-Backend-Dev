import express, { Router } from "express";
import { initiateRegistration, finializeRegistration } from "../controllers/auth/registration.controller";
import { login, tokenLogin } from "../controllers/auth/login.controller";

const router: Router = express.Router();

router.post("/initiateRegistration", initiateRegistration);
router.post("/finalizeRegistration", finializeRegistration);
router.post("/login", login);
router.post("/tokenLogin", tokenLogin);

export default router;

import express, { Router } from "express";
import { banUser } from "../controllers/admin/admin.controller";

const router: Router = express.Router();

router.post("/ban/:id", banUser);

export default router;

import express, { Router } from "express";
import { banUser } from "../controllers/admin/admin.controller";
import staffPermissionHandler from "../middleware/staffPermissionHandler";

const router: Router = express.Router();

/**
 * @swagger
 * /api/admin/ban/{userId}:
 *   post:
 *     description: Ban a user using by their document id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: Id of the user who will be banned.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User has ban or deleted.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/ban/:id", staffPermissionHandler, banUser);

export default router;

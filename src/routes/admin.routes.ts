import express, { Router } from "express";
import { banUser, deleteUser } from "../controllers/admin/admin.controller";
import staffPermissionHandler from "../middleware/staffPermissionHandler";

const router: Router = express.Router();

/**
 * @swagger
 * /api/admin/ban/{userId}:
 *   post:
 *     security:
 *       - auth: []
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
 *         description: User has been ban.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/ban/:id", staffPermissionHandler, banUser);

/**
 * @swagger
 * /api/admin/delete/{userId}:
 *   post:
 *     security:
 *       - auth: []
 *     description: Delete a user using by their document id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: Id of the user who will be deleted.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User has been deleted.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/delete/:id", staffPermissionHandler, deleteUser);

export default router;

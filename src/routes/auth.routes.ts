import express, { Router } from "express";
import { initiateRegistration, finializeRegistration } from "../controllers/auth/registration.controller";
import { login, tokenLogin } from "../controllers/auth/login.controller";
import { requestPasswordReset, confirmPasswordReset } from "../controllers/auth/recovery.controller";

const router: Router = express.Router();

/**
 * @swagger
 *
 * /api/auth/initiateRegistration:
 *   post:
 *     description: Start the first half of the registration process by creating a temporary object that auto deletes in 5 minutes. Use the finalize route to create real user.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: contact
 *         description: The email or phone of the registerer.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: The username the registerer chooses.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: The full name of the registerer.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Temporary object has been created and email or text has been sent, depending on what the contact was, with a verification code inside. This code is used in the finalizeRegistration route.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/initiateRegistration", initiateRegistration);

/**
 * @swagger
 *
 * /api/auth/finalizeRegistration:
 *   post:
 *     description: Second half of the registration process. Verify the registerer's contact using the verification code. Create the actual user.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         description: The verification code received from the initiateRegistration response.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: contact
 *         description: The email or phone of the registerer. Same value as the one from initiateRegistration.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: The username the registerer chooses. Same value as the one from initiateRegistration.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: name
 *         description: The full name of the registerer. Same value as the one from initiateRegistration.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: The password of the registerer.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: User has been successfully created.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/finalizeRegistration", finializeRegistration);

/**
 * @swagger
 *
 * /api/auth/login:
 *   post:
 *     description: Get authenticted using good old identifier and password.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: identifier
 *         description: The contact of the user. Either an email or phone number.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: The password of the user.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Login successfully. An access and refresh token are received along with the instance of the user.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 *
 * /api/auth/tokenLogin:
 *   post:
 *     description: Get authenticted using access and refresh tokens.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: access
 *         description: Access token belonging to the user being logged in.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: refresh
 *         description: Refresh token belonging to the user being logged in.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Login successfully. An access and refresh token are received along with the instance of the user.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/tokenLogin", tokenLogin);

/**
 * @swagger
 *
 * /api/auth/passwordreset/request:
 *   post:
 *     description: Request a recovery code so that it can be used to reset an account password.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: contact
 *         description: The email or phone number that the user signed up with. This is used to find the user's account.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Request successfully processed and recovery code has been sent.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/passwordreset/request", requestPasswordReset);

/**
 * @swagger
 *
 * /api/auth/passwordreset/confirm:
 *   post:
 *     description: Takes the recovery code sent during the reset request and the new password to update the user's password.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         description: The recovery code received when requesting the password reset.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: The new password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Password has been successfully updated.
 *       400:
 *         description: A bad request was sent. Read the return for more details.
 *       500:
 *          description: Server error
 */
router.post("/passwordreset/confirm", confirmPasswordReset);

export default router;

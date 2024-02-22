import express from "express";
import { registerUser, loginUser, revokeSession, refreshToken, changePassword } from "./authController";

const router: express.Router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', revokeSession);
router.post('/token', refreshToken);
router.post('/change-password', changePassword);

export default router;
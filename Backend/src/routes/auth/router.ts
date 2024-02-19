import express from "express";
import { registerUser, loginUser, revokeSession, refreshToken } from "./authController";

const router: express.Router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', revokeSession);
router.post('/token', refreshToken);

export default router;
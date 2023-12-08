import express from "express";

// Routes
import apiV1 from "./api_v1/router";
import { loginUser, registerUser, revokeSession, refreshToken } from "./auth";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/revoke', revokeSession);
router.post('/refresh', refreshToken);

export default router;
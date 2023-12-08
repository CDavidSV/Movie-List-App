import express from "express";

// Routes
import apiV1 from "./api_v1/router";
import { loginUser, registerUser, revokeSession, refreshToken } from "./auth";
import { authenticateAccessToken } from "../middlewares/auth-controller";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);

router.post('/oauth2/register', registerUser);
router.post('/oauth2/login', loginUser);
router.post('/oauth2/revoke', revokeSession);
router.post('/oauth2/refresh', refreshToken);

export default router;
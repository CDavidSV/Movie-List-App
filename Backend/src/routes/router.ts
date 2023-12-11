import express from "express";

// Routes
import apiV1 from "./api_v1/router";
import { loginUser, registerUser, revokeSession } from "./auth";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);

router.post('/oauth2/register', registerUser);
router.post('/oauth2/login', loginUser);
router.post('/oauth2/revoke', revokeSession);

export default router;
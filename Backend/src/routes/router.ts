import express from "express";

// Routes
import apiV1 from "./api_v1/router";
import { loginUser, registerUser, revokeSession } from "./auth";

const router: express.Router = express.Router();

router.use('/api/v1', apiV1);

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', revokeSession);

export default router;
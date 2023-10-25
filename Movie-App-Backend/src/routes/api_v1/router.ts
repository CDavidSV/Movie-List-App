import express from "express";

// Routes
import favorites from "./favorites";

const router: express.Router = express.Router();

router.use("/favorites", favorites);

export default router;
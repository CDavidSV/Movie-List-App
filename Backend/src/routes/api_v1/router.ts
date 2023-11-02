import express from "express";

// Routes
import favorites from "./favorites";
import watchlist from "./watchlist";

const router: express.Router = express.Router();

router.use("/favorites", favorites);
router.use("/watchlist", watchlist);

export default router;
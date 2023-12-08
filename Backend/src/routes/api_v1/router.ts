import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist } from "./watchlist";
import { authenticateAccessToken } from "../../middlewares/auth-controller";

const router: express.Router = express.Router();

router.get("/favorites", authenticateAccessToken, getFavorites);
router.post("/favorites/add", authenticateAccessToken, addFavorite);
router.delete("/favorites/remove", authenticateAccessToken, removeFavorite);
router.post("/favorites/reorder", authenticateAccessToken, reorderFavorites);

router.get("/watchlist", authenticateAccessToken, getWatchlist);

export default router;
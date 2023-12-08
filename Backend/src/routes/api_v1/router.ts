import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist } from "./watchlist";

const router: express.Router = express.Router();

router.get("/favorites", getFavorites);
router.post("/favorites/add", addFavorite);
router.delete("/favorites/remove", removeFavorite);
router.post("/favorites/reorder", reorderFavorites);

router.get("/watchlist", getWatchlist);

export default router;
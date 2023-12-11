import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist } from "./watchlist";
import requireUser from "../../middlewares/requireUser";

const router: express.Router = express.Router();

router.get("/favorites", requireUser, getFavorites);
router.post("/favorites/add", requireUser, addFavorite);
router.delete("/favorites/remove", requireUser, removeFavorite);
router.post("/favorites/reorder", requireUser, reorderFavorites);

router.get("/watchlist", requireUser, getWatchlist);

export default router;
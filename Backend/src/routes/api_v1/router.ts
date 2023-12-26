import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist, updateWatchlist, getWatchlistItem } from "./watchlist";
import requireUser from "../../middlewares/requireUser";

const router: express.Router = express.Router();

// Favorites routes
router.get("/favorites", requireUser, getFavorites);
router.post("/favorites/add", requireUser, addFavorite);
router.delete("/favorites/remove", requireUser, removeFavorite);
router.post("/favorites/reorder", requireUser, reorderFavorites);

// Watchlist routes
router.get("/watchlist", requireUser, getWatchlist);
router.get("/watchlist", requireUser, getWatchlistItem);
router.post("/watchlist/update", requireUser, updateWatchlist);
router.delete("/watchlist/remove", requireUser, updateWatchlist);

// List routes
router.post('list/create', requireUser, () => { });
router.get('list/:id', requireUser, () => { });
router.post('list/:id/add', requireUser, () => { });
router.delete('list/:id/remove', requireUser, () => { });
router.post('list/:id/reorder', requireUser, () => { });

// User routes
router.get("/user", requireUser, () => { });
router.post("/user/update", requireUser, () => { });
router.post("/user/password-update", requireUser, () => { });

// Media routes
router.get('/media/movies/popular', requireUser, () => { });
router.get('/media/movies/trending', requireUser, () => { });
router.get('/media/movies/top-rated', requireUser, () => { });
router.get('/media/movies/upcoming', requireUser, () => { });
router.get('/media/shows/popular', requireUser, () => { });
router.get('/media/shows/trending', requireUser, () => { });
router.get('/media/shows/top-rated', requireUser, () => { });
router.get('/media/shows/upcoming', requireUser, () => { });
router.get("/media/search", requireUser, () => { });

export default router;
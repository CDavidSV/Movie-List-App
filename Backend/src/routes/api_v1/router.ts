import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites, itemInFavorites } from "./favorites";
import { getWatchlist, updateWatchlist, itemInWatchlist } from "./watchlist";
import requireUser from "../../middlewares/requireUser";
import { getPopularMovies } from "./media";

const router: express.Router = express.Router();

// Favorites routes
router.get("/favorites", requireUser, getFavorites);
router.get("/favorites/has", requireUser, itemInFavorites);
router.post("/favorites/add", requireUser, addFavorite);
router.delete("/favorites/remove", requireUser, removeFavorite);
router.post("/favorites/reorder", requireUser, reorderFavorites);

// Watchlist routes
router.get("/watchlist", requireUser, getWatchlist);
router.get("/watchlist/has", requireUser, itemInWatchlist);
router.post("/watchlist/update", requireUser, updateWatchlist);
router.delete("/watchlist/remove", requireUser, updateWatchlist);

// List routes
router.post('list/create', requireUser, () => { });
router.get('list/:id', requireUser, () => { });
router.post('list/:id/add', requireUser, () => { });
router.delete('list/:id/remove', requireUser, () => { });
router.post('list/:id/reorder', requireUser, () => { });

// User routes
router.get("/me", requireUser, () => { });
router.get("/user", requireUser, () => { });
router.post("/user/change-profile-picture", requireUser, () => { });
router.post("/user/update", requireUser, () => { });
router.post("/user/password-update", requireUser, () => { });

// Media routes
router.get('/media/movies/popular', getPopularMovies);
router.get('/media/movies/trending', () => { });
router.get('/media/movies/top-rated', () => { });
router.get('/media/movies/upcoming', () => { });
router.get('/media/shows/popular', () => { });
router.get('/media/shows/trending', () => { });
router.get('/media/shows/top-rated', () => { });
router.get('/media/shows/upcoming', () => { });
router.get("/media/search", () => { });

export default router;
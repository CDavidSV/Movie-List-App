import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist, removeItemFromWatchlist, updateWatchlist } from "./watchlist";
import requireUser from "../../middlewares/requireUser";
import { getPopularMovies, getUpcomingMovies, searchByTitle } from "./media";
import { hasMedia } from "./user";

const router: express.Router = express.Router();

// Favorites routes
router.get("/favorites", requireUser, getFavorites);
router.post("/favorites/add", requireUser, addFavorite);
router.delete("/favorites/remove", requireUser, removeFavorite);
router.post("/favorites/reorder", requireUser, reorderFavorites);

// Watchlist routes
router.get("/watchlist", requireUser, getWatchlist);
router.post("/watchlist/update", requireUser, updateWatchlist);
router.delete("/watchlist/remove", requireUser, removeItemFromWatchlist);

// List routes
router.post('list/create', requireUser, () => { });
router.get('list/:id', requireUser, () => { });
router.post('list/:id/add', requireUser, () => { });
router.delete('list/:id/remove', requireUser, () => { });
router.post('list/:id/reorder', requireUser, () => { });

// User routes
router.get("/me", requireUser, () => { });
router.get("/user", requireUser, () => { });
router.get("/user/hasMedia", requireUser, hasMedia);
router.post("/user/change-profile-picture", requireUser, () => { });
router.post("/user/update", requireUser, () => { });
router.post("/user/password-update", requireUser, () => { });

// Media routes
router.get('/media/movies/popular', getPopularMovies);
router.get('/media/movies/trending', () => { });
router.get('/media/movies/top-rated', () => { });
router.get('/media/movies/upcoming', getUpcomingMovies);
router.get('/media/shows/popular', () => { });
router.get('/media/shows/trending', () => { });
router.get('/media/shows/top-rated', () => { });
router.get('/media/shows/upcoming', () => { });
router.get("/media/search", searchByTitle);

export default router;
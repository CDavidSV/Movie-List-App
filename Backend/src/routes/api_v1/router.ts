import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getStatusOfWatchlistItem, getWatchlist, removeItemFromWatchlist, updateWatchlist } from "./watchlist";
import { getHistory, addHistory, removeHistory, clearHistory } from "./history";
import { getMediaById, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getUpcomingMovies, searchByTitle } from "./media";
import requireUser from "../../middlewares/requireUser";
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
router.get("/watchlist/status-of-watchlist-item", requireUser, getStatusOfWatchlistItem);

// List routes
router.post('list/create', requireUser, () => { });
router.get('list/:id', requireUser, () => { });
router.post('list/:id/add', requireUser, () => { });
router.delete('list/:id/remove', requireUser, () => { });
router.post('list/:id/reorder', requireUser, () => { });

// User routes
router.get("/me", requireUser, () => { });
router.get("/user", requireUser, () => { });
router.post("/user/inPersonalLists", requireUser, hasMedia);
router.post("/user/change-profile-picture", requireUser, () => { });
router.post("/user/update", requireUser, () => { });
router.post("/user/password-update", requireUser, () => { });

// Media routes
router.get('/media/movies/popular', getPopularMovies);
router.get('/media/movies/now-playing', getNowPlayingMovies);
router.get('/media/movies/top-rated', getTopRatedMovies);
router.get('/media/movies/upcoming', getUpcomingMovies);
router.get('/media/fetch-by-id', getMediaById);
router.get('/media/shows/popular', () => { });
router.get('/media/shows/top-rated', () => { });
router.get('/media/shows/upcoming', () => { });
router.get("/media/search", searchByTitle);

// History routes
router.get("/history", requireUser, getHistory);
router.post("/history/add", requireUser, addHistory);
router.delete("/history/remove", requireUser, removeHistory);
router.delete("/history/clear", requireUser, clearHistory);

export default router;
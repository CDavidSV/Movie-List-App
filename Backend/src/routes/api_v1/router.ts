import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist, removeItemFromWatchlist, updateWatchlist } from "./watchlist";
import { getHistory, addHistory, removeHistory, clearHistory } from "./history";
import { getMediaById, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getUpcomingMovies, searchByTitle, getPopularSeries, getMoviesByGenre } from "./media";
import requireUser from "../../middlewares/requireUser";
import { hasMedia, getStatusInPersonalLists } from "./user";

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
router.post("/user/in-personal-lists", requireUser, hasMedia);
router.get("/user/status-in-personal-lists", getStatusInPersonalLists);
router.post("/user/change-profile-picture", requireUser, () => { });
router.post("/user/update", requireUser, () => { });
router.post("/user/password-update", requireUser, () => { });

// Media routes
router.get('/media/movies/popular', getPopularMovies);
router.get('/media/movies/now-playing', getNowPlayingMovies);
router.get('/media/movies/top-rated', getTopRatedMovies);
router.get('/media/movies/upcoming', getUpcomingMovies);
router.get('/media/fetch-by-id', getMediaById);
router.get('/media/series/popular', getPopularSeries);
router.get('/media/series/top-rated', () => { });
router.get('/media/series/upcoming', () => { });
router.get("/media/search", searchByTitle);
router.get("/media/movies/genres", getMoviesByGenre);

// History routes
router.get("/history", requireUser, getHistory);
router.post("/history/add", requireUser, addHistory);
router.delete("/history/remove", requireUser, removeHistory);
router.delete("/history/clear", requireUser, clearHistory);

export default router;
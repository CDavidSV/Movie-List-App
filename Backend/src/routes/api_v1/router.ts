import express from "express";

// Routes
import { addFavorite, getFavorites, removeFavorite, reorderFavorites } from "./favorites";
import { getWatchlist, removeItemFromWatchlist, updateWatchlist } from "./watchlist";
import { getHistory, addHistory, removeHistory, clearHistory } from "./history";
import { getMediaById, getNowPlayingMovies, getPopularMovies, getTopRatedMovies, getUpcomingMovies, searchByTitle, getPopularSeries, getMoviesByGenre, getTopRatedSeries, getUpcomingSeries, getCast, getCrew, getImages, getVideos, getMoviesHomeCarousel } from "./media";
import { hasMedia, getStatusInPersonalLists, getMeUserInfo, uploadProfilePicture, changeUsername, deleteAccount, getuserInfo, uploadBannerPicture } from "./user";
import requireUser from "../../middlewares/requireUser";
import createMulterInstance from "../../config/multer.config";

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
// TODO: Implement list routes
router.post('list/create', requireUser, () => { });
router.get('list/:id', requireUser, () => { });
router.post('list/:id/add', requireUser, () => { });
router.delete('list/:id/remove', requireUser, () => { });
router.post('list/:id/reorder', requireUser, () => { });

// User routes
router.get("/me", requireUser, getMeUserInfo);
router.post("/user/in-personal-lists", requireUser, hasMedia);
router.post("/user/status-in-personal-lists", requireUser, getStatusInPersonalLists);
router.post("/user/change-profile-picture", requireUser, createMulterInstance(8).single('image'), uploadProfilePicture);
router.post("/user/change-profile-banner", requireUser, createMulterInstance(16).single('image'), uploadBannerPicture);
router.post("/user/change-username", requireUser, changeUsername);
router.delete("/user/delete-account", requireUser, deleteAccount);
router.get("/user/:id", requireUser, getuserInfo);

// Media routes
router.get('/media/movies/popular', getPopularMovies);
router.get('/media/movies/now-playing', getNowPlayingMovies);
router.get('/media/movies/top-rated', getTopRatedMovies);
router.get('/media/movies/upcoming', getUpcomingMovies);
router.get('/media/movies/home-carousel', getMoviesHomeCarousel);
router.get('/media/fetch-by-id', getMediaById);
router.get('/media/series/popular', getPopularSeries);
router.get('/media/series/top-rated', getTopRatedSeries);
router.get('/media/series/upcoming', getUpcomingSeries);
router.get("/media/search", searchByTitle);
router.get("/media/movies/genres", getMoviesByGenre);
router.get("/media/:type/:id/cast", getCast);
router.get("/media/:type/:id/crew", getCrew);
router.get("/media/:type/:id/images", getImages);
router.get("/media/:type/:id/videos", getVideos);

// History routes
router.get("/history", requireUser, getHistory);
router.post("/history/add", requireUser, addHistory);
router.delete("/history/remove", requireUser, removeHistory);
router.delete("/history/clear", requireUser, clearHistory);

export default router;
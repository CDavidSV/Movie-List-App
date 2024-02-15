import express from 'express';
import { sendResponse } from '../../util/apiHandler';
import { findMediaById, isValidMediaType, fetchMedia, findMediaByTitle, makeTMDBRequest, fetchMoviesByGenre } from '../../util/TMDB';
import Movie from '../../Models/Movie';
import Series from '../../Models/Series';
import config from '../../config/config';

interface MovieResponse extends Movie {
    watchlist?: any;
    favorites?: boolean;
}

interface SeriesResponse extends Series {
    watchlist?: any;
    favorites?: boolean;
}

const getPopularMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    fetchMedia("movie", "popular", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getUpcomingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    fetchMedia("movie", "upcoming", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getTopRatedMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    fetchMedia("movie", "top_rated", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getNowPlayingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    fetchMedia("movie", "now_playing", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getPopularSeries = async (req: express.Request, res: express.Response) => {
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    fetchMedia("tv", "popular", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching shows" });

        sendResponse(res, { status: 200, message: "Shows fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching shows" });
    });
};

const searchByTitle = async (req: express.Request, res: express.Response) => {
    const title = req.query.title;

    if (!title) {
        sendResponse(res, { status: 400, message: "Missing query parameter" });
        return;
    }

    findMediaByTitle(title as string).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching media" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching media" });
    });
};

const getMediaById = async (req: express.Request, res: express.Response) => {
    const { media_id, type } = req.query;

    if (!media_id || !type) return sendResponse(res, { status: 400, message: "Missing query parameters" });
    if (!isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });
    
    try {
        const mediaData: MovieResponse | SeriesResponse | null = await findMediaById(media_id as string, type as string, ['videos', 'credits', 'recommendations']);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        // Replace poster and backdrop paths with full URLs.
        mediaData.posterPath ? mediaData.posterPath = `${config.tmdbPosterUrl}${mediaData.posterPath}` : "https://via.placeholder.com/300x450.png?text=No+Poster";
        mediaData.backdropPath ? mediaData.backdropPath = `${config.tmbdFullBackdropUrl}${mediaData.backdropPath}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop";
    
        sendResponse(res, { status: 200, message: "Media fetched successfully", responsePayload: mediaData });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching media" });
    }
};

const getMoviesByGenre = async (req: express.Request, res: express.Response) => {
    const { name } = req.query;
    const page = req.query.page && !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;

    if (!name) return sendResponse(res, { status: 400, message: "Missing query parameters" });

    // First get the genre id based on the type of media
    let genreObj;
    try {
        const genreResponse = await makeTMDBRequest(`/genre/movie/list`);

        genreObj = genreResponse.genres.find((genre: any) => {
            if (typeof name === 'string') {
                return genre.name.toLowerCase() === name.toLowerCase();
            }
        });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching genres" });
    }

    if (!genreObj) return sendResponse(res, { status: 404, message: "Genre not found" });
    const genreId = genreObj.id;

    // Get list of media by genre
    const mediaResponse = await fetchMoviesByGenre(genreId, page as number);
    if (!mediaResponse) return sendResponse(res, { status: 500, message: "Error fetching media" });

    sendResponse(res, { status: 200, message: "Media fetched successfully", responsePayload: mediaResponse });
};

export { 
    getPopularMovies, 
    getUpcomingMovies, 
    searchByTitle, 
    getTopRatedMovies, 
    getNowPlayingMovies, 
    getMediaById,
    getPopularSeries,
    getMoviesByGenre
};
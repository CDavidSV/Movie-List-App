import express from 'express';
import axios from 'axios';
import { sendResponse } from '../../util/apiHandler';
import config from '../../config/config';
import { findMediaById, isValidMediaType, fetchMedia, findMediaByTitle } from '../../util/TMDB';
import watchlistSchema from '../../scheemas/watchlistSchema';
import Movie from '../../Models/Movie';
import favoritesSchema from '../../scheemas/favoritesSchema';
import Series from '../../Models/Series';

const tmdb_access_token = process.env.TMDB_ACCESS_TOKEN;

interface MovieResponse extends Movie {
    watchlist?: any;
    favorites?: boolean;
}

interface SeriesResponse extends Series {
    watchlist?: any;
    favorites?: boolean;
}

interface CustomMediaResponse {
    id: number;
    title: string;
    description: string;
    poster_url: string;
    backdrop_url: string;
    type: string;
    release_date: string;
    vote_average: number;
    votes: number;
}

const getPopularMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    fetchMedia("movie", "popular", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getUpcomingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    fetchMedia("movie", "upcoming", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getTopRatedMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    fetchMedia("movie", "top_rated", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getNowPlayingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    fetchMedia("movie", "now_playing", page as number).then((response) => {
        if (!response) return sendResponse(res, { status: 500, message: "Error fetching movies" });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
}

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
    const { media_id, type, include } = req.query;

    if (!media_id || !type) return sendResponse(res, { status: 400, message: "Missing query parameter" });
    if (!isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });
    
    try {
        const mediaData: MovieResponse | SeriesResponse | null = await findMediaById(media_id as string, type as string);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        if (include === 'user_personal_lists' && req.user) {
            const [ watchlistItem, favoritesItem ] = await Promise.all([
                watchlistSchema.findOne({ user_id: req.user.id, media_id: mediaData.id, type }),
                favoritesSchema.findOne({ user_id: req.user.id, media_id: mediaData.id, type })
            ]);

            mediaData.watchlist = null;
            if (watchlistItem)  mediaData.watchlist = { 
                id: watchlistItem._id, 
                updated_date: watchlistItem.updated_date, 
                progress: watchlistItem.progress,
                status: watchlistItem.status,
                totalProgress: mediaData instanceof Series ? mediaData.numberOfEpisodes : 1
            };
            
            favoritesItem ? mediaData.favorites = true : mediaData.favorites = false;
        }
    
        sendResponse(res, { status: 200, message: "Media fetched successfully", responsePayload: mediaData });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching media" });
    }
};

export { getPopularMovies, getUpcomingMovies, searchByTitle, getTopRatedMovies, getNowPlayingMovies, getMediaById };
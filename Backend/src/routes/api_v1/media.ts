import express from 'express';
import axios from 'axios';
import { sendResponse } from '../../util/apiHandler';
import config from '../../config/config';

const tmdb_access_token = process.env.TMDB_ACCESS_TOKEN;

const getPopularMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        const movieArray: any[] = [];
        response.data.results.forEach((movie: any) => {
            movieArray.push({
                id: movie.id,
                title: movie.title,
                description: movie.overview,
                poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: movieArray });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getUpcomingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        const movieArray: any[] = [];
        response.data.results.forEach((movie: any) => {
            movieArray.push({
                id: movie.id,
                title: movie.title || movie.original_title,
                description: movie.overview,
                poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: movieArray });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getTopRatedMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        const movieArray: any[] = [];
        response.data.results.forEach((movie: any) => {
            movieArray.push({
                id: movie.id,
                title: movie.title,
                description: movie.overview,
                poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: movieArray });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching movies" });
    });
};

const getNowPlayingMovies = async (req: express.Request, res: express.Response) => {
    const page = req.query.page || 1;

    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${page}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        const movieArray: any[] = [];
        response.data.results.forEach((movie: any) => {
            movieArray.push({
                id: movie.id,
                title: movie.title,
                description: movie.overview,
                poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        });

        sendResponse(res, { status: 200, message: "Movies fetched successfully", responsePayload: movieArray });
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
    const mediaArray: any[] = [];

    await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        response.data.results.forEach((movie: any) => {
            if (movie.poster_path && movie.title) {
                mediaArray.push({
                    id: movie.id,
                    title: movie.title,
                    description: movie.overview,
                    poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                    backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                    type: "movie",
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    votes: movie.vote_count
                });
            };
        });
    }).catch((err) => {
        console.error(err);
    });

    await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/search/tv?query=${title}&include_adult=false&language=en-US&page=1`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tmdb_access_token}`
        }
    }).then((response) => {
        response.data.results.forEach((movie: any) => {
            if (movie.poster_path && movie.name) {
                mediaArray.push({
                    id: movie.id,
                    title: movie.name,
                    description: movie.overview,
                    poster_url: `${config.tmbdImageBaseUrl}${movie.poster_path}` || "https://via.placeholder.com/300x450.png?text=No+Poster",
                    backdrop_url: `${config.tmbdImageBaseUrl}${movie.backdrop_path}` || "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                    type: "series",
                    release_date: movie.first_air_date,
                    vote_average: movie.vote_average,
                    votes: movie.vote_count
                });
            };
        });
    }).catch((err) => {
        console.error(err);
    });

    sendResponse(res, { status: 200, message: "Media fetched successfully", responsePayload: { media: mediaArray }});
};

export { getPopularMovies, getUpcomingMovies, searchByTitle, getTopRatedMovies, getNowPlayingMovies };
import express from 'express';
import axios from 'axios';
import { sendResponse } from '../../util/apiHandler';

const tmdb_key = process.env.TMDB_API_KEY;
const tmdb_access_token = process.env.TMDB_ACCESS_TOKEN;

const getPopularMovies = async (req: express.Request, res: express.Response) => {
    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
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
                poster_url: movie.poster_path,
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
    axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1`,
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
                poster_url: movie.poster_path,
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

const searchByTitle = async (req: express.Request, res: express.Response) => {
    const title = req.query.title;

    if (!title) {
        sendResponse(res, { status: 400, message: "Missing query parameter" });
        return;
    }
    const movieArray: any[] = [];
    const showsArray: any[] = [];

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
                movieArray.push({
                    id: movie.id,
                    title: movie.title|| movie.original_title,
                    description: movie.overview,
                    backdrop_url: movie.backdrop_path,
                    poster_url: movie.poster_path,
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
            if (movie.poster_path && movie.title) {
                movieArray.push({
                    id: movie.id,
                    title: movie.title,
                    description: movie.overview,
                    backdrop_url: movie.backdrop_path,
                    poster_url: movie.poster_path,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    votes: movie.vote_count
                });
            };
        });
    }).catch((err) => {
        console.error(err);
    });

    sendResponse(res, { status: 200, message: "Media fetched successfully", responsePayload: { movies: movieArray, shows: showsArray }});
};

export { getPopularMovies, getUpcomingMovies, searchByTitle };
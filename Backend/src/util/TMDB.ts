import axios from 'axios';
import Movie from '../Models/Movie';
import Series from '../Models/Series';
import config from '../config/config';

const tmdb_token = process.env.TMDB_ACCESS_TOKEN;

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

/**
 * 
 * @param type 
 * @returns 
 */
const fetchMedia  = async (type: string, url: string, page: number) => {
    if (type !== "movie" && type !== "series") throw new Error("Invalid media type");

    try {
        const response = await axios({
            method: 'get',
            url: `https://api.themoviedb.org/3/${type}/${url}?language=en-US&page=${page}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tmdb_token}`
            }
        });
        
        let media: CustomMediaResponse[] = [];
        if (type === "movie") {
            media = response.data.results.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    description: item.overview,
                    poster_url: item.poster_path ? `${config.tmbdImageBaseUrl}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                    backdrop_url: item.backdrop_path ? `${config.tmbdImageOriginalUrl}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                    type: "movie",
                    release_date: item.release_date,
                    vote_average: item.vote_average,
                    votes: item.vote_count
                }
            });

            return media;
        }

        // If the type is series
        media = response.data.results.map((item: any) => {
            return {
                id: item.id,
                title: item.name,
                description: item.overview,
                poster_url: item.poster_path ? `${config.tmbdImageBaseUrl}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: item.backdrop_path ? `${config.tmbdImageOriginalUrl}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "series",
                release_date: item.first_air_date, // release_date is first_air_date for series
                vote_average: item.vote_average,
                votes: item.vote_count
            }
        });
        return media;

    } catch (err) {
        console.error(err);
        return null;
    }
};

const findMediaByTitle = async (title: string) => {
    const [ moviesResponse, seriesResponse ] = await Promise.all([
        axios({
            method: 'get',
            url: `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tmdb_token}`
            }
        }),
        axios({
            method: 'get',
            url: `https://api.themoviedb.org/3/search/tv?query=${title}&include_adult=false&language=en-US&page=1`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tmdb_token}`
            }
        })
    ]);
    const media: CustomMediaResponse[] = [];
    moviesResponse.data.results.forEach((movie: any) => {
        if (movie.poster_path && movie.title) {
            media.push({
                id: movie.id,
                title: movie.title,
                description: movie.overview,
                poster_url: movie.poster_path ? `${config.tmbdImageBaseUrl}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: movie.backdrop_path ? `${config.tmbdImageOriginalUrl}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        };
    });
    seriesResponse.data.results.forEach((movie: any) => {
        if (movie.poster_path && movie.name) {
            media.push({
                id: movie.id,
                title: movie.name,
                description: movie.overview,
                poster_url: movie.poster_path ? `${config.tmbdImageBaseUrl}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: movie.backdrop_path ? `${config.tmbdImageOriginalUrl}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "series",
                release_date: movie.first_air_date,
                vote_average: movie.vote_average,
                votes: movie.vote_count
            });
        };
    });

    return media;
};

/**
 * 
 * @param id id of the movie or series
 * @param type type of the media (movie | series)
 * @returns Movie | Series | null
 */
const findMediaById = async (id: string, type: string): Promise<Movie | Series | null> => {
    try {
        if (type === "movie") {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/movie/${id}?append_to_response=videos,images,credits&language=en-US`,
                headers: {
                    Authorization: "Bearer " + tmdb_token
                }
            });
            return new Movie(response.data);
        } else if (type === "series") {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/tv/${id}?append_to_response=videos,images,credits&language=en-US`,
                headers:{
                    Authorization: "Bearer " + tmdb_token
                }
            });

            return new Series(response.data);
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    }
};

/**
 * 
 * @param type Valid types are "movie" and "series"
 * @returns boolean value indicating whether the type is valid or not
 */
const isValidMediaType = (type: string): boolean => {
    if (type === "movie" || type === "series") return true;
    return false;
}

export { findMediaById, isValidMediaType, fetchMedia, findMediaByTitle };
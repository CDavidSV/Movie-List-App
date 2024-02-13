import axios from 'axios';
import Movie from '../Models/Movie';
import Series from '../Models/Series';
import config from '../config/config';
import saveMovie from './mediaHandler';

const tmdb_token = process.env.TMDB_ACCESS_TOKEN;

interface CustomMediaResponse {
    id: number;
    title: string;
    description: string;
    posterUrl: string;
    backdropUrl: string;
    type: string;
    releaseDate: string;
    voteAverage: number;
    votes: number;
}

const makeRequest = async (url: string) => {
    return await axios({
        method: 'get',
        url: url,
        headers: {
            "Authorization": "Bearer " + tmdb_token,
            "Content-Type": "application/json"
        }
    }).then((response) => {
        return response.data;
    }).catch((err) => {
        console.error(err);
        return null;
    })
};

/**
 * 
 * @param type 
 * @returns 
 */
const fetchMedia  = async (type: string, url: string, page: number) => {
    if (type !== "movie" && type !== "tv") throw new Error("Invalid media type");

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
                    posterUrl: item.poster_path ? `${config.tmdbPosterUrl}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                    backdropUrl: item.backdrop_path ? `${config.tmdbSmallBackdropUrl}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                    type: "movie",
                    releaseDate: item.release_date,
                    voteAverage: item.vote_average,
                    votes: item.vote_count
                } as CustomMediaResponse
            });

            return media;
        }

        // If the type is series
        media = response.data.results.map((item: any) => {
            return {
                id: item.id,
                title: item.name,
                description: item.overview,
                posterUrl: item.poster_path ? `${config.tmdbPosterUrl}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.backdrop_path ? `${config.tmdbSmallBackdropUrl}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "series",
                releaseDate: item.first_air_date, // release_date is first_air_date for series
                voteAverage: item.vote_average,
                votes: item.vote_count
            } as CustomMediaResponse
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
                posterUrl: movie.poster_path ? `${config.tmdbPosterUrl}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: movie.backdrop_path ? `${config.tmdbSmallBackdropUrl}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                releaseDate: movie.release_date,
                voteAverage: movie.vote_average,
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
                posterUrl: movie.poster_path ? `${config.tmdbPosterUrl}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: movie.backdrop_path ? `${config.tmdbSmallBackdropUrl}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "series",
                releaseDate: movie.first_air_date,
                voteAverage: movie.vote_average,
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
const findMediaById = async (id: string, type: string, append?: string[]): Promise<Movie | Series | null> => {
    let appendString = "";
    if (append) {
        const validAppendStrings = ["videos", "credits", "recommendations"];
        const filteredAppendStrings = append.filter((str: string) => validAppendStrings.includes(str));
        appendString = filteredAppendStrings.length > 0 ? `?append_to_response=${filteredAppendStrings.join(",")}` : "";
    }

    try {
        if (type === "movie") {
            const data = await makeRequest(`https://api.themoviedb.org/3/movie/${id}${appendString}&language=en-US`);
            if (!data) return null;

            const movie = new Movie(data);
            saveMovie(movie, type);
            return movie;
        } else if (type === "series") {
            const data = await makeRequest(`https://api.themoviedb.org/3/tv/${id}${appendString}&language=en-US`);
            if (!data) return null;

            const series = new Series(data);
            saveMovie(series, type);
            return series;
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
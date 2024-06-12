import axios from 'axios';
import Movie from '../Models/Movie';
import Series from '../Models/Series';
import config from '../config/config';
import saveMovie from './mediaHandler';
import { CustomMediaResponse, Genre } from '../Models/interfaces';

const tmdb_token = process.env.TMDB_ACCESS_TOKEN;

const genres: { movies: Genre[], series: Genre[] } = { movies: [], series: [] };
let clearGenresTimeout: NodeJS.Timeout | null = null;

const makeTMDBRequest = async (url: string) => {
    return await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3${url}`,
        headers: {
            "Authorization": "Bearer " + tmdb_token,
            "Content-Type": "application/json"
        }
    }).then((response) => {
        return response.data;
    }).catch((err) => {
        console.error(`Failed to make TMDB request to ${url}:`.red, err);
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

    const response = await makeTMDBRequest(`/${type}/${url}?language=en-US&page=${page}`);
    if (!response) return null;
    
    let media: CustomMediaResponse[] = [];
    if (type === "movie") {
        media = response.results.map((item: any) => {
            return {
                id: item.id,
                title: item.title,
                description: item.overview,
                posterUrl: item.poster_path ? `${config.tmdbImageLarge}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.backdrop_path ? `${config.tmdbImageOriginal}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                genres: item.genre_ids.map((genreId: number) => getGenreName(genreId, "movie")),
                releaseDate: item.release_date,
                voteAverage: item.vote_average,
                votes: item.vote_count
            } as CustomMediaResponse
        });

        return media;
    }

    // If the type is series
    media = response.results.map((item: any) => {
        return {
            id: item.id,
            title: item.name,
            description: item.overview,
            posterUrl: item.poster_path ? `${config.tmdbImageLarge}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
            backdropUrl: item.backdrop_path ? `${config.tmdbImageXLarge}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
            type: "series",
            genres: item.genre_ids.map((genreId: number) => getGenreName(genreId, "series")),
            releaseDate: item.first_air_date, // release_date is first_air_date for series
            voteAverage: item.vote_average,
            votes: item.vote_count
        } as CustomMediaResponse
    });
    return media;
};

const findMediaByTitle = async (title: string) => {
    const [ moviesResponse, seriesResponse ] = await Promise.all([
        makeTMDBRequest(`/search/movie?query=${title}&include_adult=false&language=en-US&page=1`),
        makeTMDBRequest(`/search/tv?query=${title}&include_adult=false&language=en-US&page=1`)
    ]);
    if (!moviesResponse || !seriesResponse) return null;

    const media: CustomMediaResponse[] = [];
    moviesResponse.results.forEach((movie: any) => {
        if (movie.poster_path && movie.title) {
            media.push({
                id: movie.id,
                title: movie.title,
                description: movie.overview,
                posterUrl: movie.poster_path ? `${config.tmdbImageLarge}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: movie.backdrop_path ? `${config.tmdbImageXLarge}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "movie",
                genres: movie.genre_ids.map((genreId: number) => getGenreName(genreId, "movie")),
                releaseDate: movie.release_date,
                voteAverage: movie.vote_average,
                votes: movie.vote_count
            });
        };
    });
    seriesResponse.results.forEach((movie: any) => {
        if (movie.poster_path && movie.name) {
            media.push({
                id: movie.id,
                title: movie.name,
                description: movie.overview,
                posterUrl: movie.poster_path ? `${config.tmdbImageLarge}${movie.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: movie.backdrop_path ? `${config.tmdbImageXLarge}${movie.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: "series",
                genres: movie.genre_ids.map((genreId: number) => getGenreName(genreId, "series")),
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

    if (type === "movie") {
        const data = await makeTMDBRequest(`/movie/${id}${appendString}&language=en-US`);
        if (!data) return null;

        const movie = new Movie(data);
        saveMovie(movie, type);
        return movie;
    } else if (type === "series") {
        const data = await makeTMDBRequest(`/tv/${id}${appendString}&language=en-US`);
        if (!data) return null;

        const series = new Series(data);
        saveMovie(series, type);
        return series;
    } else {
        return null;
    }
};

const fetchMoviesByGenre = async (genreId: number, page: number) => {
    const response = await makeTMDBRequest(`/discover/movie?with_genres=${genreId}&page=${page}&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc`);
    if (!response) return null;

    const media = response.results.map((item: any) => {
        if (!item.poster_path || !item.title) return null;
        return {
            id: item.id,
            title: item.title,
            type: "movie",
            description: item.overview,
            posterUrl: item.poster_path ? `${config.tmdbImageLarge}${item.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
            backdropUrl: item.backdrop_path ? `${config.tmdbImageXLarge}${item.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
            genres: item.genre_ids.map((genreId: number) => getGenreName(genreId, "movie")),
            releaseDate: item.release_date,
            voteAverage: item.vote_average,
            votes: item.vote_count
        } as CustomMediaResponse
    });

    return media;
};

const getCredits = async (id: string, type: string) => {
    const response = await makeTMDBRequest(`/${type === 'series' ? 'tv' : 'movie'}/${id}/credits?language=en-US`);
    if (!response) return null;

    const cast = response.cast.map((cast: any) => {
        return {
            adult: cast.adult,
            gender: cast.gender,
            id: cast.id,
            name: cast.name,
            originalName: cast.original_name,
            popularity: cast.popularity,
            knownForDepartment: cast.known_for_department,
            castId: cast.cast_id,
            creditId: cast.credit_id,
            order: cast.order,
            character: cast.character,
            profilePath: cast.profile_path ? `${config.tmdbImageLarge}${cast.profile_path}` : "https://via.placeholder.com/300x450.png?text=No+Profile"
        }
    });

    const crew = response.crew.map((crew: any) => {
        return {
            adult: crew.adult,
            gender: crew.gender,
            id: crew.id,
            name: crew.name,
            originalName: crew.original_name,
            popularity: crew.popularity,
            knownForDepartment: crew.known_for_department,
            creditId: crew.credit_id,
            department: crew.department,
            job: crew.job,
            profilePath: crew.profile_path ? `${config.tmdbImageLarge}${crew.profile_path}` : "https://via.placeholder.com/300x450.png?text=No+Profile"
        }
    });
    response.cast = cast;
    response.crew = crew;

    return response;
};

const getMediaImages = async (id: string, type: string) => {
    const response = await makeTMDBRequest(`/${type === 'series' ? 'tv' : 'movie'}/${id}/images?include_image_language=en,null&include_video=false`);
    if (!response) return null;

    response.backdrops = response.backdrops.map((backdrop: any) => {
        return {
            aspectRatio: backdrop.aspect_ratio,
            previewFilePath: backdrop.file_path ? `${config.tmdbImageLarge}${backdrop.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            originalFilePath: backdrop.file_path ? `${config.tmdbImageOriginal}${backdrop.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            height: backdrop.height,
            width: backdrop.width,
            iso6391: backdrop.iso_639_1,
            voteAverage: backdrop.vote_average,
            voteCount: backdrop.vote_count
        }
    });
    response.posters = response.posters.map((poster: any) => {
        return {
            aspectRatio: poster.aspect_ratio,
            previewFilePath: poster.file_path ? `${config.tmdbImageLarge}${poster.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            originalFilePath: poster.file_path ? `${config.tmdbImageOriginal}${poster.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            height: poster.height,
            width: poster.width,
            iso6391: poster.iso_639_1,
            voteAverage: poster.vote_average,
            voteCount: poster.vote_count
        }
    });
    response.logos = response.logos.map((logo: any) => {
        return {
            aspectRatio: logo.aspect_ratio,
            previewFilePath: logo.file_path ? `${config.tmdbImageLarge}${logo.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            originalFilePath: logo.file_path ? `${config.tmdbImageOriginal}${logo.file_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
            height: logo.height,
            width: logo.width,
            iso6391: logo.iso_639_1,
            voteAverage: logo.vote_average,
            voteCount: logo.vote_count
        }
    });
    return response;
};

const getMediaVideos = async (id: string, type: string) => {
    const response = await makeTMDBRequest(`/${type === 'series' ? 'tv' : 'movie'}/${id}/videos?i`);
    if (!response) return null;

    response.results = response.results.map((video: any) => {
        return {
            id: video.id,
            iso6391: video.iso_639_1,
            iso31661: video.iso_3166_1,
            key: video.key,
            name: video.name,
            site: video.site,
            size: video.size,
            type: video.type,
            official: video.official,
            publishedAt: video.published_at,
            thumbnail: video.site === "YouTube" ? `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg` : null
        }
    });

    return response.results;
};

const fetchGenres = async () => {
    const [seriesGenres, movieGenres] = await Promise.all([
        makeTMDBRequest(`/genre/tv/list?language=en`),
        makeTMDBRequest(`/genre/movie/list?language=en`)
    ]);
    if (!seriesGenres || !movieGenres) throw new Error("Failed to fetch genres");

    genres.movies = movieGenres.genres;
    genres.series = seriesGenres.genres;

    if (clearGenresTimeout) clearTimeout(clearGenresTimeout);
    clearGenresTimeout = setTimeout(async () => {
        try {
            await fetchGenres();
        } catch (err) {
            console.error("Failed to refetch genres: ".red, err);
        }
    }, 1000 * 60 * 60 * 24);
};

const getGenreName = (genreId: number, type: string) => {
    if (!isValidMediaType(type)) return null;
    if (!genres) return null;

    let genre: Genre | undefined;
    if (type === "movie") {
        genre = genres.movies.find((genre: Genre) => genre.id === genreId);
    } else if (type === "series") {
        genre = genres.series.find((genre: Genre) => genre.id === genreId);
    }

    return genre ? genre.name : null;
};

/**
 * 
 * @param type Valid types are "movie" and "series"
 * @returns boolean value indicating whether the type is valid or not
 */
const isValidMediaType = (type: string, acceptBoth: boolean = false): boolean => {
    return type === "movie" || type === "series" || (acceptBoth && type === 'both');
}

export { 
    findMediaById, 
    isValidMediaType, 
    fetchMedia, 
    findMediaByTitle, 
    makeTMDBRequest, 
    fetchMoviesByGenre,
    getCredits,
    getMediaImages,
    getMediaVideos,
    getGenreName,
    fetchGenres
};
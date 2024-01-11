import axios from 'axios';
import Movie from '../Models/Movie';
import Series from '../Models/Series';

const tmdb_key = process.env.TMDB_API_KEY || "b2f1c92e43d45a6b7ec44a1d0118926f";
const rmdb_token = process.env.TMDB_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmYxYzkyZTQzZDQ1YTZiN2VjNDRhMWQwMTE4OTI2ZiIsInN1YiI6IjY1MGE4ZmIzOTY2MWZjMDFlNmRhMjQwNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.56Iw0HVpLpeEWWmfSpVAsVXocLB270wRb-tglo0kTB8";

const findMediaById = async (id: string, type: string): Promise<Movie | Series | null> => {
    try {
        if (type === "movie") {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdb_key}`
            });

            return new Movie(response.data);
        } else if (type === "series") {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
                headers:{
                    Authorization: "Bearer " + rmdb_token
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

const isValidMediaType = (type: string): boolean => {
    if (type === "movie" || type === "series") return true;
    return false;
}

export { findMediaById, isValidMediaType };
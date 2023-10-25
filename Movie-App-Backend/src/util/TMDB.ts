import axios from 'axios';

const tmdb_key = process.env.TMDB_API_KEY;

const findMediaById = async (id: string) => {
    return axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdb_key}`
    }).then((response) => {
        return response.data;
    }).catch((err) => {
        return null;
    });
}

export { findMediaById };
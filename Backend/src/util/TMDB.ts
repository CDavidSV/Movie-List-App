import axios from 'axios';
import Media from '../Models/Media';

const tmdb_key = process.env.TMDB_API_KEY;

const findMediaById = async (id: string): Promise<Media | null> => {
    return axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdb_key}`
    }).then((response) => {
        const media = new Media(response.data);
        return media;
    }).catch((err) => {
        console.error(err);
        return null;
    });
};

export { findMediaById };
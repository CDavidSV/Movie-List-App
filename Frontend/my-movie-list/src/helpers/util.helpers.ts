import { mml_api_protected } from "../axios/mml_api_intances";
import { isLoggedIn } from "./session.helpers";

const shortenNumber = (num: number) => {
    if (num < 1000) return num.toString();

    const numStr = num.toString();
    let denominator = 1000;
    let suffix = 'k';
    if (numStr.length >= 7) {
        denominator = 1_000_000;
        suffix = 'm';
    }
    if (numStr.length >= 10) {
        denominator = 1_000_000_000;
        suffix = 'b';
    }

    const shortenedNum = (num / denominator).toFixed(1);
    const shortenedNumStr = shortenedNum.toString() + suffix;

    return shortenedNumStr;
};

const getSavedItems = (films: any[], ids: string[], callback: Function) => {
    // Check first if the user is logged in
    if (!isLoggedIn()) return callback(films);

    mml_api_protected.get(`api/v1/user/hasMedia?ids=${ids}`).then((response) => {
        const { responseData } = response.data;
        films.forEach((film) => {
            if (film.id in responseData) {
                film.inWatchlist = responseData[film.id].watchlist;
                film.inFavorites = responseData[film.id].favorite;
            } else {
                film.inWatchlist = false;
                film.inFavorites = false;
            }
        });
        callback(films);
    }).catch(() => {
        callback(films);
    });
};

const setFavorite = async (id: string, type: string) => {
    await mml_api_protected.post(`api/v1/favorites/add?media_id=${id}&type=${type}`);
};

const removeFavorite = async (id: string, type: string) => {
    await mml_api_protected.delete(`api/v1/favorites/remove?media_id=${id}&type=${type}`);
};

const setWatchlist = async (id: string, type: string, status: number = 2, progress: number = 0) => {
    await mml_api_protected.post(`api/v1/watchlist/update`, {
        media_id: id.toString(),
        status: status,
        progress: progress,
        type: type
    });
};

const removeFromWatchlist = async (id: string, type: string) => {
    await mml_api_protected.delete(`api/v1/watchlist/remove?media_id=${id}&type=${type}`);
}

const saveSelectedSearchResult = (name: string) => {
    const searchResultHistory: { name: string, link: string }[] | undefined = JSON.parse(localStorage.getItem('searchResultsHistory')!);

    if (!searchResultHistory) {
        localStorage.setItem('searchResultsHistory', JSON.stringify([{ name, link: window.location.pathname }]));
        return;
    }

    searchResultHistory.push({ name, link: window.location.pathname });
    localStorage.setItem('searchResultsHistory', JSON.stringify(searchResultHistory));
};

export { shortenNumber, getSavedItems, setFavorite, removeFavorite, setWatchlist, removeFromWatchlist, saveSelectedSearchResult };
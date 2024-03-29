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

const getSavedItems = (films: any[], media: { id: string, type: string }[], callback: (films: any) => void) => {
    // Check first if the user is logged in
    if (!isLoggedIn()) return callback(films);

    const requestMedia = media.map((item) => {
        return {
            media_id: item.id,
            type: item.type
        };
    });

    mml_api_protected.post('api/v1/user/in-personal-lists', requestMedia).then((response) => {
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

const setWatchlist = async (id: string, type: string, status: number = 1, progress: number = 0) => {
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

const saveSearchResult = (name: string, id: string, type: string,  url: string) => {
    const searchResultHistory: SearchResultItem[] | undefined = JSON.parse(localStorage.getItem('searchResultsHistory')!);

    // If not found, create a new one
    if (!searchResultHistory) {
        localStorage.setItem('searchResultsHistory', JSON.stringify([{ name, link: url, date_updated: new Date(), id, type} as SearchResultItem]));
        return;
    }

    if (searchResultHistory.length >= 10) {
        // Sort in descending order by date_updated and remove the oldest one
        searchResultHistory.pop();
    }
    
    const duplicate = searchResultHistory.findIndex((item) => item.id === id && item.type === type);
    if (duplicate !== -1) {
        const duplicateItem = searchResultHistory[duplicate];
        duplicateItem.date_updated = new Date();
        searchResultHistory[duplicate] = duplicateItem;

        searchResultHistory.splice(duplicate, 1)
        searchResultHistory.unshift(duplicateItem);
        return localStorage.setItem('searchResultsHistory', JSON.stringify(searchResultHistory));
    }

    searchResultHistory.unshift({
        name, link: url, date_updated: new Date(),
        id,
        type
    });
    localStorage.setItem('searchResultsHistory', JSON.stringify(searchResultHistory));
};

const removeSearchResultHistoryItem = (index: number) => {
    const searchResultHistory: SearchResultItem[] | undefined = JSON.parse(localStorage.getItem('searchResultsHistory')!);
    if (!searchResultHistory) return;

    searchResultHistory.splice(index, 1);
    localStorage.setItem('searchResultsHistory', JSON.stringify(searchResultHistory));
};

const getSearchResultsHistory = () => {
    const searchResultHistory: SearchResultItem[] | undefined = JSON.parse(localStorage.getItem('searchResultsHistory')!);
    if (!searchResultHistory) return [];

    return searchResultHistory;
};

const clearSearchResultsHistory = () => {
    localStorage.removeItem('searchResultsHistory');
};

const saveToHistory = (id: string, type: string) => {
    // Save the selected film to the users history
    if (!isLoggedIn()) return;

    mml_api_protected.post("api/v1/history/add", {
        media_id: id,
        type: type
    });
};

const calculateMovieRuntime = (runtimeInMinutes: number) => {
    const hours = Math.floor(runtimeInMinutes / 60);
    const remainingMinutes = runtimeInMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
};

export { 
    shortenNumber, 
    getSavedItems, 
    setFavorite, 
    removeFavorite, 
    setWatchlist, 
    removeFromWatchlist, 
    saveSearchResult, 
    getSearchResultsHistory, 
    saveToHistory, 
    removeSearchResultHistoryItem, 
    clearSearchResultsHistory,
    calculateMovieRuntime
};
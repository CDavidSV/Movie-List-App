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
                film.watchlistId = responseData[film.id].watchlist;
                film.favoriteId = responseData[film.id].favorite;
            }
        });
        callback(films);
    }).catch(() => {
        callback(films);
    });
}

export { shortenNumber, getSavedItems };
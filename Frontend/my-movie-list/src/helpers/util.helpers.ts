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

const calculateMovieRuntime = (runtimeInMinutes: number) => {
    const hours = Math.floor(runtimeInMinutes / 60);
    const remainingMinutes = runtimeInMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
};

export { 
    shortenNumber,
    saveSearchResult, 
    getSearchResultsHistory,
    removeSearchResultHistoryItem, 
    clearSearchResultsHistory,
    calculateMovieRuntime
};
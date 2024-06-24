const calculateAverage = (prev: number, next: number): number => {
    return Math.ceil((prev + next) / 2);
};

const calculateLexoRank = (prev: string = '0', next: string = 'z'): string => {
    // Check if the array has a subrank
    const prevArray = prev.split(':');
    const nextArray = next.split(':');
    
    // We store the copy of the previous rank without the subrank to add it when calculating a new subrank
    let prevRankCopy = prevArray[0];

    // If we have a subrank we calculate the average between the previous and next subrank
    let hasSubrank = false;
    if (prevArray[1].length > 0 || nextArray[1].length > 0) {
        prev = prevArray[1] === "" ? "0" : prevArray[1];
        next = nextArray[1] === "" ? "z" : nextArray[1];
        hasSubrank = true;
    } else {
        prev = prevArray[0];
        next = nextArray[0];
    }

    // Normalize the length of the next string to the length of the previous string
    while (prev.length > next.length) {
        next += 'z';
    }

    // Calculate the average rank between the previous and next rank
    const prevRankBase10 = parseInt(prev, 36);
    const nextRankBase10 = parseInt(next, 36);
    const avgRankBase10 = calculateAverage(prevRankBase10, nextRankBase10);

    if (avgRankBase10 === nextRankBase10) {
        // If the average rank is equal to the previous rank, add "i" to the end of the average rank
        if (hasSubrank) {
            return `${prevRankCopy}:${avgRankBase10.toString(36)}i`;
        }
        return `${prevRankBase10.toString(36)}:i`;
    }

    if (hasSubrank) {
        return prevRankCopy + ":" + avgRankBase10.toString(36);
    }
    return avgRankBase10.toString(36) + ":";
};

const getNextLexoRank = (prev?: string): string => {
    if (!prev) return 'hzzzzz:';
    
    // Convert from base 36 to base 10
    const prevRank = parseInt(prev.slice(0, 6), 36); 

    return (prevRank + 8).toString(36) + ':';
};

const getPreviousLexoRank = (next?: string) => {
    if (!next) return 'hzzzzz:';

    const nextRank = parseInt(next.slice(0, 6), 36);

    return (nextRank - 8).toString(36) + ':';
};

export { getNextLexoRank, getPreviousLexoRank, calculateLexoRank };
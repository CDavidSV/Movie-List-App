const calculateLexoRank = (prev: string = '0', next: string = 'z'): string => {
    const subRankPrev = prev.split(':')[1];
    const subRankNext = next.split(':')[1];
    let hasSubRank = false;

    const prevCopy = prev;
    if (subRankPrev && subRankNext) {
        prev = subRankPrev;
        next = subRankNext;
        hasSubRank = true;
    } else if (subRankPrev) {
        prev = subRankPrev;
        next = '';
        hasSubRank = true;
    } else if (subRankNext) {
        prev = '';
        next = subRankNext;
        hasSubRank = true;
    } else {
        prev = prev.split(':')[0];
        next = next.split(':')[0];
    }

    // if length of prev and next are not equal, make them equal by padding with 0 or z
    while (prev.length !== next.length) {
        if (prev.length < next.length) {
            prev += '0';
        } else {
            next += 'z';
        }
    }

    // Convert from base 36 to base 10 for the last character
    const lastIndex = prev.length - 1;
    const prevRank = parseInt(prev[lastIndex], 36);
    const nextRank = parseInt(next[lastIndex], 36);

    if (prevRank === 0) {
        return (parseInt(next, 36) - 8).toString(36);
    }

    // Calculate the average of the two ranks
    let avgLast = Math.ceil((prevRank + nextRank) / 2);

    if (prev === next || nextRank === avgLast) {
        if (hasSubRank) {
            return prevCopy + ':' + prev + 'i';
        } else {
            return prev + ':' + 'i';
        }
    }

    // Convert from base 10 to base 36
    prev = prev.slice(0, -1);
    // if it has a subrank, add the new calculated rank to the end
    if (hasSubRank) {
        return prevCopy.split(':')[0] + ':' + prev + avgLast.toString(36);
    }

    return prev + avgLast.toString(36) + ':';
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
}

console.log(calculateLexoRank("i0000e:zzzv", "i0000f:"));
console.log(getNextLexoRank("i0000e:zzzv"));

export { getNextLexoRank, getPreviousLexoRank, calculateLexoRank };
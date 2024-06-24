export const formatTime = (hours: number, minutes: number, seconds: number) => {
    const hoursStr = hours < 10 ? "0" + hours.toString() : hours.toString();
    const minutesStr = minutes < 10 ? "0" + minutes.toString() : minutes.toString();
    const secondsStr = seconds < 10 ? "0" + seconds.toString() : seconds.toString();

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

export const addSpacing = (text: string, leftSpaces: number, rightSpaces: number) => {
    text = text.trim();

    let final = "";
    if (text.length < leftSpaces) {
        const remainingLeftSpaces = leftSpaces - text.length;

        final = final.padStart(remainingLeftSpaces, " ");
    }
    final += text;

    final = final.padEnd(rightSpaces, " ");

    return final;
};

export const watchlistStatus = new Map([
    [0, "Watching"],
    [1, "Plan to Watch"],
    [2, "Finished"]
]);
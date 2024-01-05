import { mml_api } from "../axios/mml_api_intances";

interface SessionData {
    email: string;
    username: string;
    expiresAt: number;
    setAt: number;
}

const isLoggedIn = () => {
    if (localStorage.getItem('sessionData')) {
        return true;
    } else {
        return false;
    }
};

const getSessionData = () => {
    return JSON.parse(localStorage.getItem('sessionData')!) as SessionData;
};

const setSessionData = (email: string, username: string, expiresAt: number) => {
    const sessionData = {
        email,
        username,
        expiresAt,
        setAt: Date.now()
    } as SessionData;

    localStorage.setItem('sessionData', JSON.stringify(sessionData));
}

const clearSessionData = () => {
    localStorage.removeItem('sessionData');
}

const logOut = () => {
   clearSessionData();

    mml_api.post('/auth/logout', {}, {
        withCredentials: true
    });
}

export { isLoggedIn, getSessionData, setSessionData, logOut, clearSessionData };
export type { SessionData };
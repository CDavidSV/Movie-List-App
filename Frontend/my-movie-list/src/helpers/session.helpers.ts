import mml_api from "../axios/mml_api_intance";

interface SessionData {
    email: string;
    username: string;
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

const setSessionData = (email: string, username: string) => {
    const sessionData = {
        email,
        username
    } as SessionData;

    localStorage.setItem('sessionData', JSON.stringify(sessionData));
}

const logOut = () => {
    localStorage.removeItem('sessionData');

    mml_api.post('/auth/logout', {}, {
        withCredentials: true
    });
}

export { isLoggedIn, getSessionData, setSessionData, logOut };
export type { SessionData };
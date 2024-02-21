import { mml_api } from "../axios/mml_api_intances";

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

const setSessionData = (email: string, username: string, expiresIn: number) => {
    const sessionData = {
        email,
        username,
        expiresIn,
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
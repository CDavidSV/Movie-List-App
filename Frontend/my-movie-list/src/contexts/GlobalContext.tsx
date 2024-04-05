import axios, { AxiosInstance } from "axios";
import { createContext, useEffect, useState } from "react";
import config from "../config/config";

interface GlobalContextProps {
    userData: SessionData | null;
    updateUsername: (username: string) => void;
    updateUserData: () => void | SessionData;
    clearSessionData: () => void;
    setSessionData: (email: string, username: string, expiresIn: number, profilePicturePath?: string, profileBannerPath?: string) => void;
    getSavedItems: (films: any[], media: { id: string, type: string }[], callback: (films: any) => void) => void;
    setFavorite: (id: string, type: string) => Promise<void>;
    removeFavorite: (id: string, type: string) => Promise<void>;
    setWatchlist: (id: string, type: string, status?: number, progress?: number) => Promise<void>;
    removeFromWatchlist: (id: string, type: string) => Promise<void>;
    saveToHistory: (id: string, type: string, loggedIn: boolean) => void;
    logOut: () => void;
    mml_api: AxiosInstance;
    mml_api_protected: AxiosInstance;
    loggedIn: boolean;
}

export const GlobalContext = createContext<GlobalContextProps>({
    updateUsername: () => {},
    updateUserData: () => {},
    setSessionData: () => {},
    clearSessionData: () => {},
    getSavedItems: () => {},
    setFavorite: async () => {},
    removeFavorite: async () => {},
    setWatchlist: async () => {},
    removeFromWatchlist: async () => {},
    saveToHistory: () => {},
    mml_api: axios.create(),
    mml_api_protected: axios.create(),
    loggedIn: false,
    logOut: () => {},
    userData: null
});

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<SessionData | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const sessionData = getSessionData();
        if (sessionData) {
            setUserData(sessionData);
            setLoggedIn(true);
        }

        updateUserData();
    }, []);

    const mml_api_protected = axios.create({
        baseURL: config.apiURL,
        withCredentials: true,
    });
    const mml_api = axios.create({
        baseURL: config.apiURL,
        withCredentials: true,
    });

    let isRefreshing = false;
    const requestQueue: any = [];

    const processQueue = (error: any) => {
        isRefreshing = false;
        for (let i = 0; i < requestQueue.length; i++) {
            if (error) {
                requestQueue[i].reject(error);
            } else {
                requestQueue[i].resolve(requestQueue[i].config);
            }
        }
        requestQueue.length = 0;
    };

    mml_api_protected.interceptors.request.use(async (config) => {
        // Validate the users current session
        if (!userData) return config;

        const expiresIn = userData.expiresIn;
        const now = Date.now();

        // Check if the access token is expired
        if (now - userData.setAt >= expiresIn - 1000) {
            // Renew the access token
            try {
                if (!isRefreshing) {
                    isRefreshing = true;
                    const response = await mml_api.post('/auth/token');
            
                    const { responseData } = response.data
            
                    // Update the session data
                    setSessionData(userData.email, userData.username, responseData.expiresIn);
                    processQueue(null);
                    return config;
                }

                return new Promise((resolve, reject) => {
                    requestQueue.push({ resolve, reject, config });
                });

            } catch (err) {
                processQueue(err);
                clearSessionData();
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return config;
    }, (err) => {
        return Promise.reject(err); 
    });

    mml_api_protected.interceptors.response.use((response) => {
        return response;
    }, async (error) => {

        // If the error is unauthorized, or forbidden, then redirect to the login page
        console.error("Error in request: ", error);
        if (error.response.status !== 401 && error.response.status !== 403) return Promise.reject(error);
        clearSessionData();
        window.location.href = "/login";
    });

    const clearSessionData = () => {
        localStorage.removeItem('sessionData');
        setUserData(null);
    }
    
    const logOut = () => {
       clearSessionData();
       setLoggedIn(false);
    
        mml_api.post('/auth/logout', {}, {
            withCredentials: true
        });
    }

    const getSessionData = () => {
        return JSON.parse(localStorage.getItem('sessionData')!) as SessionData;
    };

    const setSessionData = (email: string, username: string, expiresIn: number, profilePicturePath?: string, profileBannerPath?: string) => {
        setLoggedIn(true);

        const sessionData = {
            email,
            username,
            expiresIn,
            setAt: Date.now(),
        } as SessionData;
    
        if (profilePicturePath) {
            sessionData.profilePicturePath = profilePicturePath;
        }

        if (profileBannerPath) {
            sessionData.profileBannerPath = profileBannerPath;
        }
    
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setUserData(sessionData);
    }

    const updateUsername = (username: string) => {
        let sessionData = getSessionData();
        if (!sessionData) return;
        sessionData.username = username;
    
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setUserData(sessionData);
    }  

    const updateUserData = () => {
        let sessionData = getSessionData();

        if (!sessionData) return;

        mml_api_protected.get("/api/v1/me").then((res) => {
            sessionData = { ...sessionData, username: res.data.responseData.username, profilePicturePath: res.data.responseData.profile_picture_path, profileBannerPath: res.data.responseData.profile_banner_path, email: res.data.responseData.email };
            localStorage.setItem('sessionData', JSON.stringify(sessionData));

            setUserData(sessionData);
        }).catch((err) => {
            console.error("Error fetching user data: ", err);
        });
    };

    const getSavedItems = (films: any[], media: { id: string, type: string }[], callback: (films: any) => void) => {
        // Check first if the user is logged in
        if (!loggedIn) return callback(films);
    
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
    
    const saveToHistory = (id: string, type: string, loggedIn: boolean) => {
        // Save the selected film to the users history
        if (!loggedIn) return;

        mml_api_protected.post("api/v1/history/add", {
            media_id: id,
            type: type
        });
    };

    return (
        <GlobalContext.Provider value={{
            updateUsername,
            updateUserData,
            setSessionData,
            clearSessionData,
            getSavedItems,
            logOut,
            setFavorite,
            removeFavorite,
            setWatchlist,
            removeFromWatchlist,
            saveToHistory,
            mml_api,
            mml_api_protected,
            userData,
            loggedIn
            }}>
            {children}
        </GlobalContext.Provider>
    )
}
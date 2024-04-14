import axios, { AxiosInstance } from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import config from "../config/config";
import { ToastContext } from "./ToastContext";

interface GlobalContextProps {
    userData: SessionData | null;
    updateUsername: (username: string) => void;
    updateUserData: () => void | SessionData;
    clearSessionData: () => void;
    setSessionData: (email: string, username: string, expiresIn: number, profilePictureUrl?: string, profileBannerUrl?: string) => void;
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
    const firstUpdate = useRef(true);
    const toast = useContext(ToastContext);

    useEffect(() => {
        const sessionData = getSessionData();
        if (sessionData) {
            setUserData(sessionData);
            setLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (!firstUpdate.current) return;

        if (!userData) return;

        mml_api_protected.get("/api/v1/me").then((res) => {
            const sessionData = { ...userData, username: res.data.responseData.username, profilePictureUrl: res.data.responseData.profile_picture_url, profileBannerUrl: res.data.responseData.profile_banner_url, email: res.data.responseData.email };
            localStorage.setItem('sessionData', JSON.stringify(sessionData));

            firstUpdate.current = false;
            setUserData(sessionData);
        }).catch(() => {
            toast.open("Error fetching user data.", "error");
        });
    }, [userData]);

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
                    setSessionData(userData.email, userData.username, responseData.expiresIn, userData.profilePictureUrl, userData.profileBannerUrl);
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

    const setSessionData = (email: string, username: string, expiresIn: number, profilePictureUrl?: string, profileBannerUrl?: string) => {
        setLoggedIn(true);

        const sessionData = {
            email,
            username,
            expiresIn,
            setAt: Date.now(),
        } as SessionData;
    
        if (profilePictureUrl) {
            sessionData.profilePictureUrl = profilePictureUrl;
        }

        if (profileBannerUrl) {
            sessionData.profileBannerUrl = profileBannerUrl;
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
        if (!userData) return;

        mml_api_protected.get("/api/v1/me").then((res) => {
            const sessionData = { ...userData, username: res.data.responseData.username, profilePictureUrl: res.data.responseData.profile_picture_url, profileBannerUrl: res.data.responseData.profile_banner_url, email: res.data.responseData.email };
            localStorage.setItem('sessionData', JSON.stringify(sessionData));

            setUserData(sessionData);
        }).catch(() => {
            toast.open("Error fetching user data.", "error");
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
            toast.open("Error fetching personal lists.", "error");
            callback(films);
        });
    };

    const setFavorite = async (id: string, type: string) => {
        await mml_api_protected.post(`api/v1/favorites/add?media_id=${id}&type=${type}`).catch(() => {
            toast.open("Error adding to favorites.", "error");
        });
    };
    
    const removeFavorite = async (id: string, type: string) => {
        await mml_api_protected.delete(`api/v1/favorites/remove?media_id=${id}&type=${type}`).catch(() => {
            toast.open("Error removing from favorites.", "error");
        });
    };
    
    const setWatchlist = async (id: string, type: string, status: number = 1, progress: number = 0) => {
        await mml_api_protected.post(`api/v1/watchlist/update`, {
            media_id: id.toString(),
            status: status,
            progress: progress,
            type: type
        }).catch(() => {
            toast.open("Error adding to watchlist.", "error");
        });
    };
    
    const removeFromWatchlist = async (id: string, type: string) => {
        await mml_api_protected.delete(`api/v1/watchlist/remove?media_id=${id}&type=${type}`).catch(() => {
            toast.open("Error removing from watchlist.", "error");
        });
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
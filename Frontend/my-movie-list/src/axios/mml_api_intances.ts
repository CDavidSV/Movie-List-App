import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { clearSessionData, getSessionData, setSessionData } from "../helpers/session.helpers";

interface AxiosRequestConfigExtended extends AxiosRequestConfig {
    _retry?: boolean;
}  

const mml_api_protected = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

const mml_api = axios.create({
    baseURL: "http://localhost:3000",
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
    const sessionData = getSessionData();
    if (!sessionData) return Promise.reject("No session data found");

    const expiresIn = sessionData.expiresIn;
    const now = Date.now();

    // Check if the access token is expired
    if (now - sessionData.setAt >= expiresIn - 1000) {
        // Renew the access token
        try {
            if (!isRefreshing) {
                isRefreshing = true;
                const response = await mml_api.post('/auth/token');
        
                const { responseData } = response.data
        
                // Update the session data
                setSessionData(sessionData.email, sessionData.username, responseData.expiresIn);
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
}, async () => {
    clearSessionData();
    window.location.href = "/login";
});

export { mml_api_protected, mml_api };
import axios, { AxiosRequestConfig } from "axios";
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

mml_api_protected.interceptors.request.use(async (config) => {
    // Validate the users current session
    const sessionData = getSessionData();
    if (!sessionData) return Promise.reject("No session data found");

    const expiresAt = sessionData.expiresAt;
    const now = Date.now();

    // Check if the access token is expired
    if (now - sessionData.setAt >= expiresAt) {
        // Renew the access token
        try {
            const response = await mml_api.post('/auth/token', {}, {
                withCredentials: true
            });
    
            const { responseData } = response.data;
    
            // Update the session data
            setSessionData(sessionData.email, sessionData.username, responseData.expiresAt);
        } catch (err) {
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
}, async (err) => {
    const originalRequest = err.config;
    const sessionData = getSessionData();
    if (!sessionData) return Promise.reject("No session data found");

    if (err.response && (err.response.status !== 401 && err.response.status !== 403)) return err;
    if ((originalRequest as AxiosRequestConfigExtended)._retry) { // Check if the request has already been retried
        // Redirect to login
        clearSessionData();
        window.location.href = "/login";
        return Promise.reject(err);
    };

    // Attempt to refresh the access token if it's missing or expired
    try {
        const response = await mml_api.post('/auth/token', {}, {
            withCredentials: true
        });
        console.log(response.data);
        const { responseData } = response.data;
    
        // Update the session data
        setSessionData(sessionData.email, sessionData.username, responseData.expiresAt);
        
        // Set the _retry flag to true to prevent loop
        // This let's us know that the request has already been retried
        (originalRequest as AxiosRequestConfigExtended)._retry = true; 
        return mml_api_protected(originalRequest);
    } catch (err) {
        clearSessionData();
        window.location.href = "/login";
        return Promise.reject(err);
    }
});

export { mml_api_protected, mml_api };
const config = {
    apiURL: import.meta.env.PROD ? import.meta.env.VITE_API_URL_PROD : 'http://localhost:3000',
};

export default config;
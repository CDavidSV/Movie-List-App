const config = {
    apiURL: import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL : 'http://localhost:8080',
};

export default config;

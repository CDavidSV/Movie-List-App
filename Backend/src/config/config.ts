interface Config {
    environment: string | undefined,
    port: number,
    domain?: string,
    refreshTokenDomain?: string,
    cookieSecure?: boolean,
    cookieSameSite?: "none" | "lax" | "strict",
    expiration30Days: number,
    expiration1Hour: number
    allowedProdDomains?: string[],
    allowedDevDomains?: string[],
    tmdbImageSmall?: string,
    tmdbImageMedium?: string,
    tmdbImageLarge?: string,
    tmdbImageXLarge?: string,
    tmdbImageXXLarge?: string,
    tmdbImageOriginal?: string,
}

// Local config options.
const config: Config = {
    environment: process.env.NODE_ENV,
    port: 8080,
    expiration30Days: 2592000000,
    expiration1Hour: 3600000,
    cookieSecure: process.env.NODE_ENV === 'development' ? false : true,
    cookieSameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
    domain: undefined, // For now because I have no custom domain :(
    refreshTokenDomain: undefined, // For now because I have no custom domain :(
    allowedDevDomains: ['http://localhost:5173', 'http://localhost'],
    allowedProdDomains: ['https://white-stone-02077ca1e.5.azurestaticapps.net'],
    tmdbImageSmall: 'https://image.tmdb.org/t/p/w185',
    tmdbImageMedium: 'https://image.tmdb.org/t/p/w300',
    tmdbImageLarge: 'https://image.tmdb.org/t/p/w500',
    tmdbImageXLarge: 'https://image.tmdb.org/t/p/w780',
    tmdbImageXXLarge: 'https://image.tmdb.org/t/p/w1280',
    tmdbImageOriginal: 'https://image.tmdb.org/t/p/original',
}

export default config;
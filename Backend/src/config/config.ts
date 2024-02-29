enum Environment {
    PROD = 'prod',
    DEV = 'dev',
    LOCAL = 'local'
}

interface Config {
    environment: Environment,
    port: number,
    domain?: string,
    refreshTokenDomain?: string,
    cookieSecure?: boolean,
    cookieSameSite?: string,
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
    environment: Environment.LOCAL, // dev, prod or local
    port: 3000,
    expiration30Days: 2592000000,
    expiration1Hour: 3600000,
    cookieSecure: false,
    cookieSameSite: 'none',
    domain: '.localhost',
    refreshTokenDomain: '.localhost',
    allowedDevDomains: ['http://localhost:5173'],
    tmdbImageSmall: 'https://image.tmdb.org/t/p/w185',
    tmdbImageMedium: 'https://image.tmdb.org/t/p/w300',
    tmdbImageLarge: 'https://image.tmdb.org/t/p/w500',
    tmdbImageXLarge: 'https://image.tmdb.org/t/p/w780',
    tmdbImageXXLarge: 'https://image.tmdb.org/t/p/w1280',
    tmdbImageOriginal: 'https://image.tmdb.org/t/p/original',
}

export default config;
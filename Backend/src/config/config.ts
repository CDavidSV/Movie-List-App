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
    tmbdFullBackdropUrl: string,
    tmdbSmallBackdropUrl?: string,
    tmdbPosterUrl?: string,
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
    tmdbSmallBackdropUrl: 'https://image.tmdb.org/t/p/w780',
    tmbdFullBackdropUrl: 'https://image.tmdb.org/t/p/original',
    tmdbPosterUrl: 'https://image.tmdb.org/t/p/w500'
}

export default config;
interface Config {
    environment: string | undefined,
    port: number,
    domain?: string,
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
    bucketName?: string
}

// Local config options.
const config: Config = {
    environment: process.env.NODE_ENV,
    port: 8080,
    expiration30Days: 2592000000,
    expiration1Hour: 3600000,
    cookieSecure: process.env.NODE_ENV === 'development' ? false : true,
    cookieSameSite: 'lax',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.DOMAIN,
    allowedDevDomains: ['http://localhost:5173', 'http://localhost'],
    allowedProdDomains: ['https://www.mymovielist.cdavidsv.dev', 'https://mymovielist.cdavidsv.dev'],
    bucketName: process.env.BUCKET_NAME as string,
    tmdbImageSmall: 'https://image.tmdb.org/t/p/w185',
    tmdbImageMedium: 'https://image.tmdb.org/t/p/w300',
    tmdbImageLarge: 'https://image.tmdb.org/t/p/w500',
    tmdbImageXLarge: 'https://image.tmdb.org/t/p/w780',
    tmdbImageXXLarge: 'https://image.tmdb.org/t/p/w1280',
    tmdbImageOriginal: 'https://image.tmdb.org/t/p/original',
}

export default config;

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
    refreshTokenDomain: '.localhost'
}

export default config;
import config from '../config/config';
import { Request } from 'express';
import cors from 'cors';

const corsConfig = (req: Request, callback: Function) => {
    const headerOrigin = req.header('Origin');
    let corsOptions: cors.CorsOptions = {
        origin: false,
        methods: 'GET, POST, DELETE',
        credentials: true,
        optionsSuccessStatus: 204
    };

    let allowedDomains;
    switch (config.environment) {
        case 'prod':
            allowedDomains = config.allowedProdDomains;
            break;
        case 'dev':
            corsOptions.origin = headerOrigin;
            return callback(null, corsOptions);
    }

    if (allowedDomains && allowedDomains.some(d => headerOrigin && headerOrigin.startsWith(d))) {
        corsOptions.origin = headerOrigin;
    }

    callback(null, corsOptions);
}

export default corsConfig;
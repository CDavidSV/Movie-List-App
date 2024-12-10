const esbuild = require("esbuild");
const dotenv = require("dotenv");

// Load environment variables from .env
dotenv.config();

esbuild.build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node22',
    sourcemap: true,
    minify: true,
    format: 'cjs',
    define: {
        'process.env.MONGO_URI': `"${process.env.MONGO_URI}"`,
        'process.env.ACCESS_TOKEN_KEY': `"${process.env.ACCESS_TOKEN_KEY}"`,
        'process.env.REFRESH_TOKEN_KEY': `"${process.env.REFRESH_TOKEN_KEY}"`,
        'process.env.BUCKET_NAME': `"${process.env.BUCKET_NAME}"`,
        'process.env.BUCKET_REGION': `"${process.env.BUCKET_REGION}"`,
        'process.env.AWS_ACCESS_KEY_ID': `"${process.env.AWS_ACCESS_KEY_ID}"`,
        'process.env.AWS_SECRET_ACCESS_KEY': `"${process.env.AWS_SECRET_ACCESS_KEY}"`,
        'process.env.TMDB_API_KEY': `"${process.env.TMDB_API_KEY}"`,
        'process.env.TMDB_ACCESS_TOKEN': `"${process.env.TMDB_ACCESS_TOKEN}"`,
        'process.env.CDN_BASE_URL': `"${process.env.CDN_BASE_URL}"`,
    },
    logLevel: 'info',
}).catch(() => process.exit(1));

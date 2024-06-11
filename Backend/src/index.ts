import server from "./server";
import config from "./config/config";
import connectMongoDB from "./config/db";
import { fetchGenres } from "./util/TMDB";
import userCleanup from "./jobs/userCleanup";

// Server port
const port = config.port;
// Mongo URI
const MONGO_URI = process.env.MONGO_URI as string;

// Main server functiona
const main = async () => {
    await connectMongoDB(MONGO_URI);
    await fetchGenres();

    // jobs
    userCleanup();

    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
};

main();
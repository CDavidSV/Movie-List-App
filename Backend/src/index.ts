import server from "./server";
import connectMongoDB from "./config/db";

// Server port
const port = 8080;
// Mongo URI
const MONGO_URI = process.env.MONGO_URI as string;

// Main server functiona
const main = async () => {
    await connectMongoDB(MONGO_URI);

    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`.green);
    });
};

main();
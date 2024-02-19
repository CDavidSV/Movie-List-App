import dotenv from "dotenv";
dotenv.config();
import express from "express";
import colors from "colors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import deserializeUser from "./middlewares/deserializeUser";
import corsConfig from "./middlewares/corsConfig";
import cors from "cors";
import path from "path";
import multer from "multer";

// routes
import routes from "./routes/router";

// Config
colors.enable();
const app = express();
const logger = morgan('dev');

// Middleware
app.use(cors(corsConfig));
app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(deserializeUser);
app.use('/image', express.static(path.join(__dirname, 'public/images'))); // Serve images (profile pictures, banners, etc.)
// Register routes
app.use(routes);

export default app;
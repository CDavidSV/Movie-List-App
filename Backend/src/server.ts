import dotenv from "dotenv";
dotenv.config();
import express from "express";
import colors from "colors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import deserializeUser from "./middlewares/auth-controller";

// routes
import routes from "./routes/router";

// Config
colors.enable();
const app = express();
const logger = morgan('dev');

// Middleware
app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(deserializeUser);
  
// Register routes
app.use(routes);

export default app;
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

// routes
import routes from "./routes/router";

// Config
colors.enable();
const app = express();

const formatTime = (hours: number, minutes: number, seconds: number) => {
    const hoursStr = hours < 10 ? "0" + hours.toString() : hours.toString();
    const minutesStr = minutes < 10 ? "0" + minutes.toString() : minutes.toString();
    const secondsStr = seconds < 10 ? "0" + seconds.toString() : seconds.toString();

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

const addSpacing = (text: string, leftSpaces: number, rightSpaces: number) => {
    text = text.trim();

    let final = "";
    if (text.length < leftSpaces) {
        const remainingLeftSpaces = leftSpaces - text.length;

        for (let i = 0; i < remainingLeftSpaces; i++) {
            final += " ";
        }
    }
    final += text;

    if (text.length < rightSpaces) {
        const remainingRightSpaces = rightSpaces - text.length;

        for (let i = 0; i < remainingRightSpaces; i++) {
            final += " ";
        }
    }

    return final;
}

const logger = morgan((tokens, req, res) => {
    const date = new Date(tokens.date(req, res, "iso") || new Date());
    const dateFormat = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} - ${formatTime(date.getHours(), date.getMinutes(), date.getSeconds())}`;

    const method = tokens.method(req, res) || "Na";
    const status = parseInt(tokens.status(req, res) || "0");
    const url = tokens.url(req, res);
    const ip = tokens["remote-addr"](req, res) || "Na";
    const responseTime = tokens["response-time"](req, res) || 0;

    const statusColor = status >= 500 ? 31 :
     status >= 400 ? 33 
     : status >= 300 ? 36 
     : status >= 200 ? 32 : 0;
     
    const methodColor = method === "GET" ? 36 
     : method === "POST" ? 35 
     : method  === "PUT" ? 33 
     : method === "PATCH" ? 34 
     : method === "DELETE" ? 31 
     : method === "HEAD" ? 37 : 0;

    return `${dateFormat} |\x1b[${statusColor}m${status}\x1b[0m| ${addSpacing(responseTime?.toString(), 10, 0)}ms | ${addSpacing(ip, 11, 0)} | \x1b[${methodColor}m${addSpacing(method, 0, 6)}\x1b[0m  "${url}"`;
});

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
import jwt, { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../Models/interfaces";
import { verifyToken } from "../util/jwt";

/**
 * Authenticate an access token
 * @param req 
 * @param res 
 * @param next 
 */
const authenticateAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader?.substring(7);
    if (!token) return res.sendStatus(401);

    const { payload, valid } = verifyToken(token);

    if (!valid) return res.sendStatus(403);

    req.user = payload as User;
    next();
}

export {
    authenticateAccessToken,
};
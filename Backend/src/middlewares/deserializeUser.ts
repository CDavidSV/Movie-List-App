import { Request, Response, NextFunction } from "express";
import { User } from "../Models/interfaces";
import { verifyToken } from "../util/jwt";

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.a_t;

    const { payload, expired } = verifyToken(accessToken);
    if (expired || !payload) return next();

    req.user = payload as User;
    next();
};

export default deserializeUser;
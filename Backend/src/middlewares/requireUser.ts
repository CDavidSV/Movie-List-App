import {Response, Request } from "express";

const requireUser = (req: Request, res: Response, next: any) => {
    if (!req.user) return res.sendStatus(401);

    next();
}

export default requireUser;
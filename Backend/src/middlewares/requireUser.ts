import {Response, Request } from "express";

const requireUser = (req: Request, res: Response, next: any) => {
    if (!req.user) return res.status(403)

    next();
}

export default requireUser;
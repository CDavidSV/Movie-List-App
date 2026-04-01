import { Response, Request } from "express";
import userSchema from "../schemas/userSchema";

const requireUser = async (req: Request, res: Response, next: any) => {
    if (!req.user) return res.sendStatus(401);

    next();
}

export default requireUser;

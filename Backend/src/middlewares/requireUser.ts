import { Response, Request } from "express";
import userSchema from "../scheemas/userSchema";

const requireUser = async (req: Request, res: Response, next: any) => {
    if (!req.user) return res.sendStatus(401);

    try {
        const userExists = await userSchema.exists({ _id: req.user.id });
        if (!userExists) return res.sendStatus(401);

        next();
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
}

export default requireUser;
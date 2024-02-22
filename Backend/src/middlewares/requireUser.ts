import { Response, Request } from "express";
import userSchema from "../scheemas/userSchema";

const requireUser = async (req: Request, res: Response, next: any) => {
    if (!req.user) return res.sendStatus(401);

    try {
        const user = await userSchema.findById(req.user.id)
        if (!user) return res.sendStatus(401);

        next();
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
}

export default requireUser;
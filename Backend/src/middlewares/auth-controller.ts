import { Request, Response, NextFunction } from "express";
import { User } from "../Models/interfaces";
import { generateToken, verifyToken } from "../util/jwt";
import { getSession } from "../util/sessionHandler";
import config from "../../config.json";

const generateRefreshToken = async (token: string) => {
    console.log("Generating new refresh token");
    // Validate refresh token.
    const { payload, valid } = verifyToken(token, true);
    if (!valid || !payload) return { refreshedToken: null, payloadData: null };

    // Validate session.
    const session = await getSession((payload as User).sessionId).catch(() => null);
    if (!session) return { refreshedToken: null, payloadData: null };

    // Generate new tokens.
    const accessToken = generateToken({ id: session.user_id, sessionId: session._id.toString() } as User, config.expiration1Day);

    return { refreshedToken: accessToken, payloadData: { id: session.user_id, sessionId: session._id.toString() } };
};

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.a_token;
    const refreshToken = req.cookies.r_token;

    const { payload, valid, expired } = verifyToken(accessToken);

    if (payload) req.user = payload as User;

    if (!valid) {
        const { refreshedToken, payloadData } = await generateRefreshToken(refreshToken);
        if (!refreshedToken) return next();

        res.cookie("a_token", refreshedToken,
            {
                httpOnly: true,
                maxAge: config.expiration30Days * 1000
            }
        );
        
        req.user = payloadData as User;
        return next();
    }

    next();
};

export default deserializeUser;
import jwt from "jsonwebtoken";
import config from "../config/config";
import { User } from "../Models/interfaces";
import SHA256 from "crypto-js/sha256";
import { getSession, invalidateAllUserSessions, updateSessionToken } from "./sessionHandler";

const generateToken = (payload: any, expirationDelta: number, refresh: boolean = false): string => {
    let key = process.env.ACCESS_TOKEN_KEY as string
    if (refresh) key = process.env.REFRESH_TOKEN_KEY as string

    return jwt.sign(payload, key as string, { expiresIn: expirationDelta });
};

const generateAccessToken = (user_id: string, sessionId: string, expirationDelta: number) => {
    // Generate access token.
    const accessToken = generateToken({ id: user_id, sessionId } as User, expirationDelta);

    return accessToken;
};

const generateRefreshToken = (user_id: string, sessionId: string, expirationDelta: number) => {
    // Generate refresh token.
    const refreshToken = generateToken({ id: user_id, sessionId } as User, expirationDelta, true);

    return refreshToken;
};

const verifyToken = (token: string, refresh: boolean = false): {payload: User | null, expired: boolean} => {
    let key = process.env.ACCESS_TOKEN_KEY as string
    if (refresh) key = process.env.REFRESH_TOKEN_KEY as string

    try {
        const decodedJWT = jwt.verify(token, key as string);
        return { payload: decodedJWT as User, expired: false };
    } catch (err) {
        return { payload: null, expired: (err as jwt.JsonWebTokenError).message === "jwt expired" };
    }
};

const generateNewAccessToken = async (token: string) => {
    // Validate refresh token.
    const { payload, expired } = verifyToken(token, true);
    if (expired || !payload) return null;

    // Validate session.
    const session = await getSession((payload as User).sessionId)
        .catch((err) => { 
            console.error(err); 
            return null 
        });
    if (!session) return null;

    const hashedCookieRefreshToken = SHA256(token).toString();
    // Validate refresh token.
    if (session.refresh_token !== hashedCookieRefreshToken) {
        // Invaldate all user sessions.
        invalidateAllUserSessions(session.user_id);

        return null;
    }

    // Generate new tokens.
    const newAccessToken = generateAccessToken(session.user_id, session.session_id, config.expiration1Hour);
    const newRefreshToken = generateRefreshToken(session.user_id, session.session_id, config.expiration30Days);

    // Update session refresh token.
    const updated = await updateSessionToken(session.session_id, newRefreshToken, new Date(Date.now() + config.expiration30Days));
    if (!updated) return null;

    return { newAccessToken, newRefreshToken, sessionId: session.session_id, expiresIn: config.expiration1Hour };
};

export { generateToken, verifyToken, generateAccessToken, generateRefreshToken, generateNewAccessToken };
import jwt from "jsonwebtoken"
import { User } from "../Models/interfaces";

const generateToken = (payload: any, expirationDelta: number, refresh: boolean = false): string => {
    let key = process.env.ACCESS_TOKEN_KEY as string
    if (refresh) key = process.env.REFRESH_TOKEN_KEY as string

    return jwt.sign(payload, key as string, { expiresIn: expirationDelta });
}

const verifyToken = (token: string, refresh: boolean = false): {payload: User | null, valid: boolean} => {
    let key = process.env.ACCESS_TOKEN_KEY as string
    if (refresh) key = process.env.REFRESH_TOKEN_KEY as string

    try {
        const decodedJWT = jwt.verify(token, key as string );
        return { payload: decodedJWT as User, valid: true };
    } catch (err) {
        return { payload: null, valid: false };
    }
}

export { generateToken, verifyToken };
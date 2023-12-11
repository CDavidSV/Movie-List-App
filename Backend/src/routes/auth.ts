import express from "express";
import { User } from "../Models/interfaces";
import UserSchema from "../scheemas/userSchema";
import { validateJsonBody } from "../util/validateJson";
import hashPassword from "../util/hashPassword";
import { generateToken, verifyToken } from "../util/jwt";
import SHA256 from "crypto-js/sha256";
import { createSession, getSession, invalidateSession } from "../util/sessionHandler";
import config from "../../config.json";

const generateAccessToken = (user_id: string, sessionId: string, expirationDelta: number) => {
    // Generate access token.
    const accessToken = generateToken({ id: user_id, sessionId } as User, expirationDelta);

    return accessToken;
}

const generateRefreshToken = (user_id: string, sessionId: string, expirationDelta: number) => {
    // Generate refresh token.
    const refreshToken = generateToken({ id: user_id, sessionId } as User, expirationDelta, true);

    return refreshToken;
}

const registerUser = async (req: express.Request, res: express.Response) => {
    const { username, password, email, favorite_genres } = req.body;

    const registerSchema = {
        username: { type: "string", required: true },
        password: { type: "string", required: true },
        email: { type: "string", required: true },
        favorite_genres: { type: "array", required: false }
    }

    const missingFields = validateJsonBody(req.body, registerSchema);
    if (!missingFields) return res.status(400).send({ status: "error", message: "Invalid request body" });

    if (password.length < 8 || password.length > 50) return res.status(400).send({ status: "error", message: "Password must be between 8 and 50 characters long" });

    // Hash password with random salt.
    const hashResult = hashPassword(password);

    try {
        // Check if username already exists.
        const user = await UserSchema.findOne({ "$or": [{ email }, { username }] });
        if (user && user.username === username) return res.status(400).send({ status: "error", message: "Username already in use" });
        if (user && user.email === email) return res.status(400).send({ status: "error", message: "Email already in use" });

        // Create new user.
        const newUser = await UserSchema.create({ username, email, favorite_genres, verified: false, password_hash: hashResult.hashedPassword, password_salt: hashResult.salt });
        
        // Create session.
        const session = await createSession(newUser.email, newUser._id.toString(), new Date(Date.now() + 2.592e+9)); // Set expiration date to 30 days from now.

        if (!session) return res.status(500).send({ status: "error", message: "Error creating user" });
        
        const accessToken = generateAccessToken(newUser._id.toString(), session, config.expiration1Day);
        const refreshToken = generateRefreshToken(newUser._id.toString(), session, config.expiration30Days);

        // Set client cookies for access and refresh tokens.
        res.cookie("a_token", accessToken,
            {
                httpOnly: true,
                maxAge: config.expiration30Days * 1000
            }
        );
        res.cookie("r_token", refreshToken,
            {
                httpOnly: true,
                maxAge: config.expiration30Days * 1000
            }
        );

        res.status(201).send({ status: "success", message: "User created", "username": newUser.username, userId: newUser._id.toString() });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: "error", message: "Error creating user" });
    }
};

const loginUser = async (req: express.Request, res: express.Response) => {
    // Check if the request type is form encoded.
    if (!req.is("application/x-www-form-urlencoded")) return res.status(401).send({ status: "error" });

    const { username, password } = req.body;

    const loginSchema = {
        username: { type: "string", required: true },
        password: { type: "string", required: true }
    }

    const missingFields = validateJsonBody(req.body, loginSchema);
    if (!missingFields) return res.status(400).send({ status: "error", message: "Invalid request body" });

    try {
        const user = await UserSchema.findOne({ "$or": [{ email: username }, { username }] });

        if (!user) return res.status(400).send({ status: "error", message: "Invalid username or password" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return res.status(400).send({ status: "error", message: "Invalid username or password" });

        // Create session.
        const session = await createSession(user.email, user._id.toString(), new Date(Date.now() + 2.592e+9));

        if (!session) return res.status(500).send({ status: "error", message: "Error logging in" });

        const accessToken = generateAccessToken(user._id.toString(), session, config.expiration1Day);
        const refreshToken = generateRefreshToken(user._id.toString(), session, config.expiration30Days);

        if (!accessToken) return res.status(500).send({ status: "error", message: "Error logging in" });

        res.cookie("a_token", accessToken,
            {
                httpOnly: true,
                maxAge: config.expiration30Days * 1000
            }
        );
        res.cookie("r_token", refreshToken,
            {
                httpOnly: true,
                maxAge: config.expiration30Days * 1000
            }
        );

        res.status(200).send({ status: "success", message: "User logged in", "username": user.username, userId: user._id.toString() });
    } catch {
        return res.status(500).send({ status: "error", message: "Error logging in" });
    }
};

const revokeSession = async (req: express.Request, res: express.Response) => {
    const refresh_token = req.cookies.r_token;

    if (!refresh_token) return res.sendStatus(403);

    // Validate refresh token.
    const { payload, valid } = verifyToken(refresh_token, true);
    if (!valid || !payload) return res.status(403).send({ status: "error", message: "Invalid refresh token" });

    // Invalidate session.
    const sessionInvalidated = await invalidateSession((payload as User).sessionId);

    if (!sessionInvalidated) return res.status(500).send({ status: "error", message: "Error invalidating session" });

    // Update cookies.
    res.clearCookie("a_token");
    res.clearCookie("r_token");

    res.status(200).send({ status: "success", message: "Session invalidated" });
};

export { registerUser, loginUser, revokeSession };
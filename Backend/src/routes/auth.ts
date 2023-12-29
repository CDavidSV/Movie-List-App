import express from "express";
import { User } from "../Models/interfaces";
import UserSchema from "../scheemas/userSchema";
import { validateJsonBody } from "../util/validateJson";
import hashPassword from "../util/hashPassword";
import { generateNewAccessToken, verifyToken } from "../util/jwt";
import SHA256 from "crypto-js/sha256";
import { createSession, invalidateSession } from "../util/sessionHandler";
import config from "../config/config";

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
        const newUser = await UserSchema.create(
            { 
                username, 
                email, 
                favorite_genres, 
                verified: false, 
                password_hash: hashResult.hashedPassword, 
                password_salt: hashResult.salt 
            });
        
        // Create session.
        const session = await createSession(newUser._id.toString(), req);
        if (!session) return res.status(500).send({ status: "error", message: "Error on sign up" });

        // Set client cookies for access and refresh tokens.
        res.cookie("a_t", session.accessToken,
            {
                httpOnly: true,
                maxAge: session.tokenExpirations.accessTokenExpitation / 1000
            }
        );
        res.cookie("r_t", session.refreshToken,
            {
                httpOnly: true,
                maxAge: session.tokenExpirations.refreshTokenExpiration / 1000
            }
        );
        res.cookie("s_id", session.sessionId,
            {
                maxAge: session.tokenExpirations.refreshTokenExpiration / 1000
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
    if (!username || !password) return res.status(400).send({ status: "error", message: "Invalid request body" });

    try {
        const user = await UserSchema.findOne({ email: username });
        if (!user) return res.status(400).send({ status: "error", message: "Invalid email or password" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return res.status(400).send({ status: "error", message: "Invalid email or password" });

        // Create session.
        const session = await createSession(user._id.toString(), req);
        if (!session) return res.status(500).send({ status: "error", message: "Error logging in" });

        res.cookie("a_t", session.accessToken,
            {
                httpOnly: true,
                maxAge: session.tokenExpirations.accessTokenExpitation
            }
        );
        res.cookie("r_t", session.refreshToken,
            {
                httpOnly: true,
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );
        res.cookie("s_id", session.sessionId,
            {
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );

        res.status(200).send({ status: "success", message: "User logged in", "username": user.username, userId: user._id.toString() });
    } catch {
        return res.status(500).send({ status: "error", message: "Error logging in" });
    }
};

const refreshToken = async (req: express.Request, res: express.Response) => {
    const refreshToken = req.cookies.r_t;

    if (!refreshToken) return res.status(403).send({ status: 'error', message: "Invalid token" });

    const { payload, expired } = verifyToken(refreshToken, true);
    if (expired || !payload) return res.status(403).send({ status: 'error', message: "Invalid token" });

    // Attempt to refresh token.
    const tokens = await generateNewAccessToken(refreshToken);
    if (!tokens) return res.status(500).send({ status: 'error', message: "Error refreshing token" });

    // Update cookies.
    res.cookie("a_t", tokens.newAccessToken,
        {
            httpOnly: true,
            maxAge: config.expiration1Hour
        }
    );
    res.cookie("r_t", tokens.newRefreshToken,
        {
            httpOnly: true,
            maxAge: config.expiration30Days
        }
    );

    res.status(200).send({ status: "success", message: "Access token refreshed successfully", expires_id: tokens.expiresIn });
};

const revokeSession = async (req: express.Request, res: express.Response) => {
    const refresh_token = req.cookies.r_t;

    if (!refresh_token) return res.sendStatus(403);

    // Validate refresh token.
    const { payload, expired } = verifyToken(refresh_token, true);
    if (expired || !payload) return res.status(403).send({ status: "error", message: "Invalid refresh token" });

    // Invalidate session.
    invalidateSession((payload as User).sessionId);

    // Update cookies.
    res.clearCookie("a_t");
    res.clearCookie("r_t");
    res.clearCookie("s_id");

    res.status(200).send({ status: "success", message: "Session invalidated" });
};

export { registerUser, loginUser, revokeSession, refreshToken };
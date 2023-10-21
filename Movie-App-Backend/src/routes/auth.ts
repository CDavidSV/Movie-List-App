import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../Models/interfaces";
import UserSchema from "../scheemas/userSchema";
import { validateJsonBody } from "../util/validateJson";
import hashPassword from "../util/hashPassword";
import generateToken from "../util/generateJWT";
import RefreshToken from "../scheemas/refreshTokenSchema";
import SHA256 from "crypto-js/sha256";

const router: express.Router = express.Router();

const generateTokens = (user_id: string) => {
    // Generate access token.
    let expirationTime = 24 * 60 * 60; // 24 hours in seconds.
    const accessToken = generateToken({ id: user_id } as User, expirationTime);

    // Generate refresh token.
    expirationTime *= 7; // 7 days in seconds.
    const refreshToken = generateToken({ id: user_id } as User, expirationTime, true);

    return { accessToken, refreshToken };
}

router.post('/register', async (req: express.Request, res: express.Response) => {
    const { username, password, email, favorite_genres } = req.body;

    const registerSchema = {
        username: { type: "string", required: true },
        password: { type: "string", required: true },
        email: { type: "string", required: true },
        favorite_genres: { type: "array", required: true }
    }

    const missingFields = validateJsonBody(registerSchema, req.body);
    if (missingFields.invalid) return res.status(400).send({ status: "error", message: "Invalid request body", missingFields: missingFields });

    if (password.length < 8 || password.length > 50) return res.status(400).send({ status: "error", message: "Password must be between 8 and 50 characters long" });

    // Hash password with random salt.
    const hashResult = hashPassword(password);

    try {
        // Check if username already exists.
        const user = await UserSchema.findOne({ username });
        if (user) return res.status(400).send({ status: "error", message: "Username already in use" });

        // Create new user.
        const newUser = await UserSchema.create({ username, email, favorite_genres, verified: false, password_hash: hashResult.hashedPassword, password_salt: hashResult.salt });
        
        const { accessToken, refreshToken } = generateTokens(newUser._id.toString());

        res.status(201).send({ status: "success", message: "User created", "access_token": accessToken, "refresh_token": refreshToken });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: "error", message: "Error creating user" });
    }
});

router.post('/login', async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;

    const loginSchema = {
        username: { type: "string", required: true },
        password: { type: "string", required: true }
    }

    const missingFields = validateJsonBody(loginSchema, req.body);
    if (missingFields.invalid) return res.status(400).send({ status: "error", message: "Invalid request body", missingFields: missingFields });

    try {
        const user = await UserSchema.findOne({ "$or": [{ email: username }, { username }] });

        if (!user) return res.status(400).send({ status: "error", message: "Invalid username or password" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return res.status(400).send({ status: "error", message: "Invalid username or password" });
    } catch {
        return res.status(500).send({ status: "error", message: "Error logging in" });
    }
});

router.post('/revoke', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY as string, (err: any, tokenData: any) => {
        if (err) return res.sendStatus(401);

        RefreshToken.findOneAndDelete({ token: refreshToken, user_id: tokenData.id }).then((deletedToken) => {  
            if (!deletedToken) return res.status(400).send({ status: "error", message: "Invalid Token Provided" });  
            res.status(200).send({ status: "success", message: "Token revoked" });
        }).catch(() => {
            return res.status(500).send({ status: "error", message: "Error revoking token" });
        });
    });
});

router.post('/refreshToken', async (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).send({ status: "error", message: "No token specified" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY as string, async (err: any, tokenData: any) => {
        if (err) return res.sendStatus(401);

        try {
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenData.id);
            const updatedToken = await RefreshToken.findOneAndUpdate({ token: refreshToken, user_id: tokenData.id }, { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            if (!updatedToken) return res.status(400).send({ status: "error", message: "Invalid Token Provided" });
            res.status(200).send({ status: "success", message: "Token refreshed", newAccessToken: accessToken, refreshToken: newRefreshToken });
        } catch {
            res.status(500).send({ status: "error", message: "Error refreshing token. Please try again." });
        }
    });
});

export default router;
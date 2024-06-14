import express from "express";
import { User } from "../../Models/interfaces";
import UserSchema from "../../scheemas/userSchema";
import hashPassword from "../../util/hashPassword";
import { generateNewAccessToken, verifyToken } from "../../util/jwt";
import SHA256 from "crypto-js/sha256";
import { createSession, invalidateSession } from "../../util/sessionHandler";
import config from "../../config/config";
import { sendResponse } from "../../util/apiHandler";
import userSchema from "../../scheemas/userSchema";
import userSessionsSchema from "../../scheemas/userSessionsSchema";
import Joi from "joi";

const registerUser = async (req: express.Request, res: express.Response) => {
    const registerSchema = Joi.object({
        username: Joi.string().required().min(3).max(20),
        password: Joi.string().required().min(8).max(50),
        email: Joi.string().required().email(),
        favorite_genres: Joi.array().optional()
    });

    const { value, error } = registerSchema.validate(req.body);
    if (error) return sendResponse(res, { status: 400, message: error.message });

    // Hash password with random salt.
    const hashResult = hashPassword(value.password);

    try {
        // Check if username already exists.
        const user = await UserSchema.findOne({ "$or": [{ email: value.email }, { username: value.username }] }, { username: 1, email: 1 });
        if (user && user.username === value.username) return sendResponse(res, { status: 400, message: "Username already in use" });
        if (user && user.email === value.email) return sendResponse(res, { status: 400, message: "Email already in use" });

        // Create new user.
        const newUser = await UserSchema.create(
            { 
                username: value.username, 
                email: value.email, 
                favorite_genres: value.favorite_genres || [], 
                verified: false, 
                password_hash: hashResult.hashedPassword, 
                password_salt: hashResult.salt,
                joined_at: new Date()
            });
        
        // Create session.
        const session = await createSession(newUser._id.toString(), req);
        if (!session) return sendResponse(res, { status: 500, message: "Error on sign up" });

        // Set client cookies for access and refresh tokens.
        res.cookie("a_t", session.accessToken,
            {
                httpOnly: true,
                domain: config.domain,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                maxAge: session.tokenExpirations.accessTokenExpitation
            }
        );
        res.cookie("r_t", session.refreshToken,
            {
                httpOnly: true,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                domain: config.domain,
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );
        res.cookie("s_id", session.sessionId,
            {
                domain: config.domain,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );

        sendResponse(res, { 
            status: 201, 
            message: "User created", 
            responsePayload: { 
                username: newUser.username, 
                userEmail: newUser.email, 
                userId: newUser._id.toString(),
                expiresIn: session.tokenExpirations.accessTokenExpitation,
                matureContent: newUser.mature_content,
                publicWatchlist: newUser.public_watchlist,
                publicFavorites: newUser.public_favorites
            } 
        });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error on sign up" });
    }
};

const loginUser = async (req: express.Request, res: express.Response) => {
    // Check if the request type is form encoded.
    if (!req.is("application/x-www-form-urlencoded")) return sendResponse(res, { status: 400, message: "Invalid request body" });

    const { username, password } = req.body;
    if (!username || !password) return sendResponse(res, { status: 400, message: "Invalid request body" });

    try {
        const user = await UserSchema.findOne({ email: username });
        if (!user) return sendResponse(res, { status: 400, message: "Invalid email or password" });

        // Check if user account is scheduled for deletion.
        if (user.deletion_timestamp) return sendResponse(res, { status: 403, message: "Can't log in while account has been scheduled for deletion" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return sendResponse(res, { status: 400, message: "Invalid email or password" });

        // Create session.
        const session = await createSession(user._id.toString(), req);
        if (!session) return sendResponse(res, { status: 500, message: "Error logging in" });

        res.cookie("a_t", session.accessToken,
            {
                httpOnly: true,
                domain: config.domain,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                maxAge: session.tokenExpirations.accessTokenExpitation
            }
        );
        res.cookie("r_t", session.refreshToken,
            {
                httpOnly: true,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                domain: config.domain,
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );
        res.cookie("s_id", session.sessionId,
            {
                domain: config.domain,
                sameSite: config.cookieSameSite,
                secure: config.cookieSecure,
                maxAge: session.tokenExpirations.refreshTokenExpiration
            }
        );

        sendResponse(res, {
            status: 200,
            message: "User logged in",
            responsePayload: {
                username: user.username,
                userEmail: user.email,
                userId: user._id.toString(),
                expiresIn: session.tokenExpirations.accessTokenExpitation,
                profilePictureUrl: user.profile_picture_url,
                profileBannerUrl: user.profile_banner_url,
                matureContent: user.mature_content,
                publicWatchlist: user.public_watchlist,
                publicFavorites: user.public_favorites
            }
        });
    } catch {
        return sendResponse(res, { status: 500, message: "Error logging in" });
    }
};

const refreshToken = async (req: express.Request, res: express.Response) => {
    const refreshToken = req.cookies.r_t;

    if (!refreshToken) return sendResponse(res, { status: 403, message: "Invalid token" });
    const { payload, expired } = verifyToken(refreshToken, true);
    if (expired || !payload) return sendResponse(res, { status: 403, message: "Invalid token" });

    // Attempt to refresh token.
    const tokens = await generateNewAccessToken(refreshToken);
    if (!tokens) return sendResponse(res, { status: 500, message: "Error refreshing token" });

    // Update cookies.
    res.cookie("a_t", tokens.newAccessToken,
        {
            httpOnly: true,
            domain: config.domain,
            sameSite: config.cookieSameSite,
            secure: config.cookieSecure,
            maxAge: config.expiration1Hour
        }
    );
    res.cookie("r_t", tokens.newRefreshToken,
        {
            httpOnly: true,
            domain: config.domain,
            sameSite: config.cookieSameSite,
            secure: config.cookieSecure,
            maxAge: config.expiration30Days
        }
    );

    sendResponse(res, { status: 200, message: "Access token refreshed successfully", responsePayload: { expiresIn: tokens.expiresIn } });
};

const revokeSession = async (req: express.Request, res: express.Response) => {
    const refresh_token = req.cookies.r_t;

    if (!refresh_token) return res.sendStatus(403);

    // Validate refresh token.
    const { payload, expired } = verifyToken(refresh_token, true);
    if (expired || !payload) return sendResponse(res, { status: 403, message: "Invalid token" });

    // Invalidate session.
    invalidateSession((payload as User).sessionId);

    // Update cookies.
    res.clearCookie("a_t", { domain: config.domain });
    res.clearCookie("r_t", { domain: config.domain });
    res.clearCookie("s_id", { domain: config.domain });

    sendResponse(res, { status: 200, message: "Session invalidated" });
};

const changePassword = async (req: express.Request, res: express.Response) => {
    const { oldPassword, newPassword, deleteAllSessions } = req.body;

    if (!oldPassword || !newPassword) return sendResponse(res, { status: 400, message: "Invalid request body" });

    try {
        const user = await userSchema.findById(req.user?.id);
        if (!user) return sendResponse(res, { status: 500, message: "User not found" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${oldPassword}${passwordSalt}`).toString() !== passwordHash) return sendResponse(res, { status: 400, message: "Incorrect password" });
        if (newPassword.length < 8 || newPassword.length > 50) return sendResponse(res, { status: 400, message: "Password must be between 8 and 50 characters long" });

        const newPasswordResult = hashPassword(newPassword);
        const updatedUser = await userSchema.updateOne({ _id: req.user?.id }, { password_hash: newPasswordResult.hashedPassword, password_salt: newPasswordResult.salt });

        if (!updatedUser) return sendResponse(res, { status: 500, message: "Error changing password. Please try again." });

        if (typeof deleteAllSessions === "boolean" && deleteAllSessions) {
            // Invalidate all sessions.
            userSessionsSchema.deleteMany({ user_id: req.user?.id, session_id: { $ne: req.user?.sessionId } }).catch((err: any) => console.error("Error deleting sessions: ", err));
        }
        sendResponse(res, { status: 200, message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error changing password. Please try again." });
    }
};

export { registerUser, loginUser, revokeSession, refreshToken, changePassword };
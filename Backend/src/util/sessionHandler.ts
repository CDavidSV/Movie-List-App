import userSessionsSchema from "../scheemas/userSessionsSchema";
import express from "express";
import { generateAccessToken, generateRefreshToken } from "./jwt";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import SHA256 from "crypto-js/sha256";

const createSession = async (userId: string, req: express.Request) => {
    const accessTokenExpitation = config.expiration1Hour;
    const refreshTokenExpiration = config.expiration30Days;
    
    const sessionCookie = req.cookies.s_id;

    if (sessionCookie) {
        // If the session exists generate new tokens for that session.
        try {
            const accessToken = generateAccessToken(userId, sessionCookie, accessTokenExpitation);
            const refreshToken = generateRefreshToken(userId, sessionCookie, refreshTokenExpiration);

            const hashedRefreshToken = SHA256(refreshToken).toString();
            const session = await userSessionsSchema.findOneAndUpdate(
                { user_id: userId, session_id: sessionCookie }, 
                { last_accessed: Date.now(), refresh_token: hashedRefreshToken, expires_at: Date.now() + refreshTokenExpiration });
            
            if (session) return { sessionId: session.session_id, accessToken, refreshToken, tokenExpirations: { accessTokenExpitation, refreshTokenExpiration }};
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    const sessionId = uuidv4();
    const accessToken = generateAccessToken(userId, sessionId, accessTokenExpitation);
    const refreshToken = generateRefreshToken(userId, sessionId, refreshTokenExpiration);
    const hashedRefreshToken = SHA256(refreshToken).toString();
    try {
        await userSessionsSchema.create({ session_id: sessionId, user_id: userId, refresh_token: hashedRefreshToken, expires_at: Date.now() + refreshTokenExpiration });

        return { sessionId, accessToken, refreshToken, tokenExpirations: { accessTokenExpitation, refreshTokenExpiration } };
    } catch (err) {
        console.error(err);
    }
};

const updateSessionToken = async (sessionId: string, token: string, newExpTime: Date) => {
    const hashedToken = SHA256(token).toString();

    try {
        await userSessionsSchema.findOneAndUpdate({ session_id: sessionId }, { refresh_token: hashedToken, expires_at: newExpTime });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const invalidateSession = (sessionId: string) => {
    userSessionsSchema.findOneAndDelete({ session_id: sessionId }).catch(err => console.error(err));
};

const invalidateAllUserSessions = (userId: string) => {
    userSessionsSchema.deleteMany({ user_id: userId }).catch(err => console.error(err));
};

const getSession = async (sessionId: string) => {
    try {
        const session = await userSessionsSchema.findOne({ session_id: sessionId });
        if (!session) return null;
        
        return session;
    } catch (err) {
        console.error(err);
        return null;
    }
};

export { createSession, invalidateSession, getSession, invalidateAllUserSessions, updateSessionToken };
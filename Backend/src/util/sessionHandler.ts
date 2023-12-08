import userSessionsSchema from "../scheemas/userSessionsSchema";

const createSession = async (email: string, userId: string, expirationDelta: Date) => {
    try {
        const sessionData = await userSessionsSchema.create({ email, user_id: userId, expires_at: expirationDelta });

        return sessionData._id.toString();
    } catch (err) {
        console.error(err);
    }
};

const invalidateSession = async (sessionId: string) => {
    try {
        await userSessionsSchema.findByIdAndDelete(sessionId);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getSession = async (sessionId: string) => {
    try {
        const session = await userSessionsSchema.findById(sessionId);
        return session;
    } catch (err) {
        console.error(err);
        return null;
    }
};

export { createSession, invalidateSession, getSession };
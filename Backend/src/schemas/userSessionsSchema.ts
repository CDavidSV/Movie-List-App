import { model, Schema } from "mongoose"

interface IUserSession {
    session_id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
    last_accessed: Date;
    refresh_token: string;

}

const UserSchema = new Schema<IUserSession>({
    session_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, required: true },
    last_accessed: { type: Date, required: true, default: Date.now },
    refresh_token: { type: String, required: true }
});

UserSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export default model<IUserSession>("UserSession", UserSchema);
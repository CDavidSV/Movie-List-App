import { model, Schema } from "mongoose"

const UserSchema = new Schema({
    session_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, required: true },
    last_accessed: { type: Date, required: true, default: Date.now },
    refresh_token: { type: String, required: true }
});

UserSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export default model("UserSession", UserSchema);
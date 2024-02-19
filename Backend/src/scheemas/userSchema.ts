import { model, Schema } from "mongoose"

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    avatar: { type: String },
    email: { type: String, required: true },
    profile_picture_url: { type: String },
    profile_banner_url: { type: String },
    verified: { type: Boolean, default: false, required: true },
    joined_at: { type: Date, default: Date.now, required: true },
    password_hash: { type: String },
    password_salt: { type: String },
    favorite_genres: { type: [String] }
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
export default model("User", UserSchema);
import { model, Schema } from "mongoose";

interface IUser {
    username: string;
    email: string;
    profile_picture_url?: string;
    profile_banner_url?: string;
    verified: boolean;
    joined_at: Date;
    password_hash: string;
    password_salt: string;
    mature_content: boolean;
    public_watchlist: boolean;
    public_favorites: boolean;
    deletion_timestamp?: Date;
    favorite_genres?: string[];
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    profile_picture_url: { type: String },
    profile_banner_url: { type: String },
    verified: { type: Boolean, default: false, required: true },
    joined_at: { type: Date, default: Date.now, required: true },
    password_hash: { type: String },
    password_salt: { type: String },
    mature_content: { type: Boolean, default: false },
    public_watchlist: { type: Boolean, default: true },
    public_favorites: { type: Boolean, default: true },
    deletion_timestamp: { type: Date },
    favorite_genres: { type: [String] }
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export default model<IUser>("User", UserSchema);
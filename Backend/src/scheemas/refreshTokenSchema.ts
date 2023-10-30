import { model, Schema } from "mongoose"

const RefreshTokenScheema = new Schema({
    token: { type: String, required: true },
    user_id: { type: String, required: true },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, required: true },
});

RefreshTokenScheema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenScheema.index({ token: 1, userId: 1 });
export default model("RefreshToken", RefreshTokenScheema);
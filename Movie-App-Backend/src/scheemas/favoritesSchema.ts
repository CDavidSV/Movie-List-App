import { model, Schema } from "mongoose"

const FavoritesSchema = new Schema({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    date_added: { type: Date, required: true }
});

FavoritesSchema.index({ username: 1 });
FavoritesSchema.index({ email: 1 });
export default model("User", FavoritesSchema);
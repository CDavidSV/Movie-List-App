import { model, Schema } from "mongoose"

const FavoritesSchema = new Schema({
    user_id: { type: String, required: true },
    media_id: { type: String, required: true },
    rank: { type: String, required: true },
    date_added: { type: Date, required: true }
});

FavoritesSchema.index({ user_id: 1, media_id: 1 });
export default model("Favorites", FavoritesSchema);
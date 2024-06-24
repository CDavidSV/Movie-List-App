import { model, Schema } from "mongoose"

interface IFavorites {
    user_id: string;
    type: string;
    media_id: string;
    rank: string;
    date_added: Date;
}

const FavoritesSchema = new Schema<IFavorites>({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    rank: { type: String, required: true },
    date_added: { type: Date, required: true }
});

FavoritesSchema.index({ user_id: 1, media_id: 1, type: 1 }, { unique: true });
FavoritesSchema.index({ rank: "text" });
export default model<IFavorites>("Favorites", FavoritesSchema);
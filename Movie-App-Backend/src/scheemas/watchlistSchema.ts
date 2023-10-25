import { model, Schema } from "mongoose"

const WatchlistSchema = new Schema({
    user_id: { type: String, required: true },
    media_id: { type: String, required: true },
    status: { type: String, required: true },
    progress: { type: Number, required: true },
    rating: { type: Number, required: true },
    episode_ratings: { type: [Number] },
});

WatchlistSchema.index({ userId: 1 });
export default model("Watchlist", WatchlistSchema);
import { model, Schema } from "mongoose"

const WatchlistSchema = new Schema({
    user_id: { type: String, required: true },
    media_id: { type: String, required: true },
    status: { type: Number, required: true },
    progress: { type: Number, required: true },
    rating: { type: Number, required: true },
    added_date: { type: Date, required: true, default: Date.now() },
    updated_date: { type: Date, required: true }
});

WatchlistSchema.index({ userId: 1 });
export default model("Watchlist", WatchlistSchema);
import { model, Schema } from "mongoose"

interface IWatchlist {
    user_id: string;
    media_id: string;
    type: string;
    status: number;
    progress: number;
    rating: number;
    added_date: Date;
    updated_date: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
    user_id: { type: String, required: true },
    media_id: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Number, required: true },
    progress: { type: Number, required: true },
    rating: { type: Number, required: true },
    added_date: { type: Date, required: true, default: Date.now() },
    updated_date: { type: Date, required: true }
});

WatchlistSchema.index({ user_id: 1, media_id: 1, type: 1 }, { unique: true });
WatchlistSchema.index({ updated_date: 1 });
export default model<IWatchlist>("Watchlist", WatchlistSchema);
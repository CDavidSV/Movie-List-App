import { model, Schema } from "mongoose"

interface IMedia {
    media_id: string;
    title: string;
    type: string;
    description: string;
    release_date: string;
    runtime?: number;
    episode_count?: number;
    season_count?: number;
    poster_url?: string;
    backdrop_url?: string;
}

const MediaSchema = new Schema<IMedia>({
    media_id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    release_date: { type: String, required: true },
    runtime: { type: Number, required: false },
    episode_count: { type: Number, required: false },
    season_count: { type: Number, required: false },
    poster_url: { type: String, required: false },
    backdrop_url: { type: String, required: false },
});

MediaSchema.index({ media_id: 1, type: 1 });
export default model<IMedia>("Media", MediaSchema);
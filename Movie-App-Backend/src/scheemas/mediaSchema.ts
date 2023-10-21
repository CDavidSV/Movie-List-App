import { model, Schema } from "mongoose"

const MediaSchema = new Schema({
    media_id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    synopsis: { type: String, required: true },
    release_date: { type: Date, required: true },
    genres: { type: [String], required: true },
    runtime: { type: Number, required: true },
    episode_count: { type: Number, required: true },
    season_count: { type: Number, required: true },
    poster_url: { type: String, required: true },
    backdrop_url: { type: String, required: true },
    images: { type: [String], required: true },
    videos: { type: [String], required: true },
});

export default model("User", MediaSchema);
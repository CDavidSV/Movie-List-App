import { Schema, model } from "mongoose";

const historySchema = new Schema({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    date_updated: { type: Date, required: true }
});

historySchema.index({ user_id: 1, type: 1, media_id: 1 }, { unique: true });
export default model("History", historySchema);
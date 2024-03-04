import { Schema, model } from "mongoose";

const historySchema = new Schema({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    date_updated: { type: Date, required: true }
});

historySchema.index({ user_id: 1, date_updated: 1 });
export default model("History", historySchema);
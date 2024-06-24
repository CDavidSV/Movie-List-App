import { Schema, model } from "mongoose";

interface IHistory {
    user_id: string;
    type: string;
    media_id: string;
    date_updated: Date;
}

const historySchema = new Schema<IHistory>({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    date_updated: { type: Date, required: true }
});

historySchema.index({ user_id: 1, date_updated: 1 });
export default model<IHistory>("History", historySchema);
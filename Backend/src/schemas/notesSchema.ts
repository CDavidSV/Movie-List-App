import { Schema, model } from "mongoose";

interface INote {
    user_id: string;
    type: string;
    media_id: string;
    note: string;
    date_updated: Date;
}

const notesSchema = new Schema<INote>({
    user_id: { type: String, required: true },
    type: { type: String, required: true },
    media_id: { type: String, required: true },
    note: { type: String, required: true, maxlength: 500 },
    date_updated: { type: Date, required: true }
});

notesSchema.index({ user_id: 1, media_id: 1, type: 1 }, { unique: true });
export default model<INote>("Note", notesSchema);

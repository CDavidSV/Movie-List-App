import { Request, Response } from "express";
import Joi from "joi";
import notesSchema from "../../schemas/notesSchema";
import { isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";

const getNote = async (req: Request, res: Response) => {
    const { media_id, type } = req.query;

    if (typeof media_id !== "string" || typeof type !== "string") return sendResponse(res, { status: 400, message: "Missing query parameters" });
    if (!isValidMediaType(type)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        const note = await notesSchema.findOne({ user_id: req.user!.id, media_id, type });
        sendResponse(res, { status: 200, message: "Note fetched", responsePayload: { note: note ? note.note : "" } });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching note" });
    }
};

// An empty note removes the stored note
const saveNote = async (req: Request, res: Response) => {
    const schema = Joi.object({
        media_id: Joi.string().required(),
        type: Joi.string().required(),
        note: Joi.string().allow("").max(500).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return sendResponse(res, { status: 400, message: error.details[0].message });

    const { media_id, type } = req.body;
    const note: string = req.body.note.trim();
    if (!isValidMediaType(type)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        if (!note) {
            await notesSchema.deleteOne({ user_id: req.user!.id, media_id, type });
        } else {
            await notesSchema.findOneAndUpdate(
                { user_id: req.user!.id, media_id, type },
                { user_id: req.user!.id, media_id, type, note, date_updated: new Date() },
                { upsert: true }
            );
        }
        sendResponse(res, { status: 200, message: "Note saved" });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error saving note" });
    }
};

export { getNote, saveNote };

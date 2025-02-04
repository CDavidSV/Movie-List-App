import { Request, Response } from "express";
import historySchema from "../../scheemas/historySchema";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";
import Joi from "joi";
import mongoose from "mongoose";

const getHistory = async (req: Request, res: Response) => {
    const cursor = new Date(Number(req.query.cursor));

    const matchStr: any = { user_id: req.user?.id };
    if (cursor && !isNaN(cursor.getTime())) matchStr.date_updated = { $lt: cursor };

    historySchema.aggregate([
        { $match: matchStr },
        { $sort: { date_updated: -1 } },
        { $limit: 100 },
        {
            $lookup: {
                from: 'media',
                let: { media_id: '$media_id', type: '$type' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$media_id', '$$media_id'] },
                                    { $eq: ['$type', '$$type'] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 },
                    { $project: { _id: 0, title: 1, description: 1, poster_url: 1, backdrop_url: 1 } }
                ],
                as: 'media'
            }
        },
        {
            $lookup: {
                from: 'watchlists',
                let: { user_id: '$user_id', media_id: '$media_id', type: '$type'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$user_id'] },
                                    { $eq: ['$media_id', '$$media_id'] },
                                    { $eq: ['$type', '$$type'] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 },
                    {
                        $group: {
                            _id: null,
                            exists: { $sum: 1 }
                        }
                    }
                ],
                as: 'watchlisted'
            }
        },
        {
            $lookup: {
                from: 'favorites',
                let: { user_id: '$user_id', media_id: '$media_id', type: '$type'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$user_id'] },
                                    { $eq: ['$media_id', '$$media_id'] },
                                    { $eq: ['$type', '$$type'] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 },
                    {
                        $group: {
                            _id: null,
                            exists: { $sum: 1 }
                        }
                    }
                ],
                as: 'favorited'
            }
        },
        {
            $addFields: {
                favorited: { $arrayElemAt: ['$favorited.exists', 0] },
                watchlisted: { $arrayElemAt: ['$watchlisted.exists', 0] }
            }
        }
    ]).then((response) => {
        const history = response.map((item) => {
            if (item.media.length < 1) return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                dateUpdated: item.date_updated,
                title: "Untitled",
                description: "No description available",
                posterUrl: null,
                backdropUrl: null,
                watchlisted: item.watchlisted >= 1 ? true : false,
                favorited: item.favorited >= 1 ? true : false
            };
            return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                dateUpdated: item.date_updated,
                title: item.media[0].title,
                description: item.media[0].description,
                posterUrl: item.media[0].poster_url ? `${config.tmdbImageLarge}${item.media[0].poster_url}` : null,
                backdropUrl: item.media[0].backdrop_url ? `${config.tmdbImageLarge}${item.media[0].backdrop_url}` : null,
                watchlisted: item.watchlisted >= 1 ? true : false,
                favorited: item.favorited >= 1 ? true : false
            }
        });

        const cursor = history.length > 0 ? new Date(history[history.length - 1].dateUpdated).getTime() : null;
        sendResponse(res, { status: 200, message: "History fetched", responsePayload: { cursor, history } });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching history list" });
    });
};

const addHistory = async (req: Request, res: Response) => {
    const { media_id, type } = req.body;

    const addHistorySchema = Joi.object({
        media_id: Joi.string().required(),
        type: Joi.string().required()
    })
    const { error } = addHistorySchema.validate(req.body);
    if (error) return sendResponse(res, { status: 400, message: error.details[0].message });
    if (!isValidMediaType(type)) return sendResponse(res, { status: 400, message: "Invalid type" });

    // Add history
    try {
        const media = await findMediaById(media_id as string, type as string);
        if (!media) sendResponse(res, { status: 404, message: "Media not found" });

        const currDate = new Date();
        await historySchema.findOneAndUpdate({ user_id: req.user!.id, type: type, media_id: media_id }, { user_id: req.user!.id, type: type, media_id: media_id, date_updated: currDate }, { upsert: true, new: true });

        sendResponse(res, { status: 200, message: "History added" });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error adding history" });
    }
};

const removeHistory = async (req: Request, res: Response) => {
    const { id } = req.query;

    // Chck if it is a valid id
    if (!id || typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse(res, { status: 400, message: "Invalid id" });
    }

    historySchema.findByIdAndDelete(id).then(() => {
        sendResponse(res, { status: 200, message: "History item removed" });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error removing history item" });
    });
};

const clearHistory = async (req: Request, res: Response) => {
    historySchema.deleteMany({ user_id: req.user?.id }).then(() => {
        sendResponse(res, { status: 200, message: "History cleared" });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error clearing history" });
    });
};

export { getHistory, addHistory, removeHistory, clearHistory };

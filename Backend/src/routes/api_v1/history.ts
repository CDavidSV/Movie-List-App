import { Request, Response } from "express";
import historySchema from "../../scheemas/historySchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";

const getHistory = async (req: Request, res: Response) => {
    const last_updated_date = new Date(Number(req.query.last_updated_date));

    const matchStr: any = { user_id: req.user?.id };
    if (last_updated_date && !isNaN(last_updated_date.getTime())) matchStr.date_updated = { $lt: last_updated_date };

    historySchema.aggregate([
        {
            $match: matchStr
        },
        {
            $sort: { date_updated: -1 }
        },
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
                    }
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
                    }
                ],
                as: 'favorited'
            }
        }
    ]).limit(100).then((response) => {
        const history = response.map((item) => {
            if (item.media.length < 1) return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                dateUpdated: item.date_updated,
                title: "Untitled",
                description: "No description available",
                posterUrl: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                releaseDate: "NA",
                runtime: 0,
                watchlisted: item.watchlisted.length >= 1 ? true : false,
                favorited: item.favorited.length >= 1 ? true : false
            };
            return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                dateUpdated: item.date_updated,
                title: item.media[0].title,
                description: item.media[0].description,
                posterUrl: item.media[0].poster_url ? `${config.tmdbPosterUrl}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.media[0].backdrop_url ? `${config.tmdbPosterUrl}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                releaseate: item.media[0].release_date ? item.media[0].release_date : "NA",
                runtime: item.media[0].runtime ? item.media[0].runtime : 0,
                watchlisted: item.watchlisted.length >= 1 ? true : false,
                favorited: item.favorited.length >= 1 ? true : false
            }
        });

        const lastUpdatedDate = history.length > 0 ? new Date(history[history.length - 1].dateUpdated).getTime() : null;
        sendResponse(res, { status: 200, message: "History fetched", responsePayload: { lastUpdatedDate, history } });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching history list" });
    });
};

const addHistory = async (req: Request, res: Response) => {
    const { media_id, type } = req.body;

    const addHistorySchema = {
        media_id: { type: "string", required: true },
        type: { type: "string", required: true },
    }
    const validation = validateJsonBody(req.body, addHistorySchema);
    if (!validation) return sendResponse(res, { status: 400, message: "Invalid request body" });
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
    const { id } = req.body;

    historySchema.findByIdAndDelete(id).then(() => {
        sendResponse(res, { status: 200, message: "History removed" });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error removing history" });
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
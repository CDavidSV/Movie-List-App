import { Request, Response } from "express";
import historySchema from "../../scheemas/historySchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";

const getHistory = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    let skip = isNaN(page) ? 0 : (page - 1) * 500;

    const count = await historySchema.countDocuments({ user_id: req.user?.id }).then((count) => count).catch((err) => 0);
    const pages = Math.ceil(count / 500);
    page > pages ? skip = 0 : skip = skip;
    historySchema.aggregate([
        {
            $match: {
                user_id: req.user?.id
            }
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
    ]).skip(skip).limit(500).sort({ rank: 1 }).then((response) => {
        const favorites = response.map((item) => {
            if (item.media.length < 1) return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                date_updated: item.date_updated,
                title: "Untitled",
                description: "No description available",
                poster_url: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                release_date: "NA",
                runtime: 0,
                watchlisted: item.watchlisted.length >= 1 ? true : false,
                favorited: item.favorited.length >= 1 ? true : false
            };
            return {
                id: item._id,
                media_id: item.media_id,
                type: item.type,
                date_updated: item.date_updated,
                title: item.media[0].title,
                description: item.media[0].description,
                poster_url: item.media[0].poster_url ? `${config.tmdbPosterUrl}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: item.media[0].backdrop_url ? `${config.tmdbPosterUrl}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                release_date: item.media[0].release_date ? item.media[0].release_date : "NA",
                runtime: item.media[0].runtime ? item.media[0].runtime : 0,
                watchlisted: item.watchlisted.length >= 1 ? true : false,
                favorited: item.favorited.length >= 1 ? true : false
            }
        });

        sendResponse(res, { status: 200, message: "Favorites fetched", responsePayload: { page, pages, favorites } })
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching favorites" });
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
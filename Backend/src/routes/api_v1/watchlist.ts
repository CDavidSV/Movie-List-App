import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";
import Series from "../../Models/Series";
import Movie from "../../Models/Movie";
import Joi from "joi";
import { watchlistStatus } from "../../util/helpers";

const getWatchlist = async (req: express.Request, res: express.Response) => {
    const status = req.query.status ? parseInt(req.query.status as string) : 3;
    const cursor = req.query.cursor;

    let sanitizedCursor: number[] = [];
    if (cursor && typeof cursor === 'string') {
        cursor.split('.').forEach((item) => {
            if (isNaN(parseInt(item))) return sendResponse(res, { status: 400, message: "Invalid cursor" });
            sanitizedCursor.push(parseInt(item));
        });
    }
    if (status < 0 || status > 3) return sendResponse(res, { status: 400, message: "Invalid status integer" });

    let match: any = { user_id: req.user?.id, status: status };
    let sort: any = { updated_date: -1 };
    if (status === 3) { 
        match = { user_id: req.user?.id }
        sort = { status: 1, updated_date: -1 } 
    };

    if (sanitizedCursor.length) {
        if (status !== 3) {
            match.updated_date = { $lt: new Date(sanitizedCursor[1]) }
        } else {
            match.$and = [
                { updated_date: { $lt: new Date(sanitizedCursor[1]) } },
                { status: { $gte: sanitizedCursor[0] } }
            ];
        };
    }

    watchlistSchema.aggregate([
        { $match: match },
        { $sort: sort },
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
                    { $project: { _id: 0, title: 1, description: 1, poster_url: 1, backdrop_url: 1, episode_count: 1 } }
                ],
                as: 'media'
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
            }
        }
    ]).then((result) => {
        const watchlist = result.map((item) => {
            if (item.media.length < 1) return {
                watchlist_id: item._id,
                media_id: item.media_id,
                dateAdded: item.date_added,
                title: "Untitled",
                description: "No description available",
                posterUrl: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: item.type,
                favorited: item.favorited >= 1 ? true : false,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: 0
            };
            return {
                watchlist_id: item._id,
                media_id: item.media_id,
                dateAdded: item.date_added,
                title: item.media[0].title,
                description: item.media[0].description,
                posterUrl: item.media[0].poster_url ? `${config.tmdbImageLarge}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.media[0].backdrop_url ? `${config.tmdbImageXLarge}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: item.type,
                favorited: item.favorited >= 1 ? true : false,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: item.type === 'movie' ? 1 : item.media[0].episode_count
            }
        });

        const cursor = result.length < 100 ? null : `${result[result.length - 1].status}.${new Date(result[result.length - 1].updated_date).getTime()}`;
        sendResponse(res, { status: 200, message: "Watchlist fetched", responsePayload: { cursor, watchlist } });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    });
};

const updateWatchlist = async (req: express.Request, res: express.Response) => {
    const registerSchema = Joi.object({
        media_id: Joi.string().required(),
        status: Joi.number().required().min(0).max(5),
        progress: Joi.number().required(),
        type: Joi.string().required()
    });

    const { value, error } = registerSchema.validate(req.body);
    if (error) return sendResponse(res, { status: 400, message: error.message });
    if (!isValidMediaType(value.type)) return sendResponse(res, { status: 400, message: "Invalid type" });

    // Validate id and get the latest favorite saved
    try {
        const mediaData = findMediaById(value.media_id as string, value.type);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });
        
        // Check progress
        if (value.progress < 0) value.progress = 0;
        if (mediaData instanceof Series && value.progress > mediaData.numberOfEpisodes) { 
            value.progress = mediaData.numberOfEpisodes;
        } else if (mediaData instanceof Movie && value.progress > 1) {
            value.progress = 1;
        }

        // Save to database
        const watchlistItem = await watchlistSchema.findOneAndUpdate({ user_id: req.user!.id, media_id: value.media_id, type: value.type  }, { status: value.status, progress: value.progress, updated_date: Date.now(), type: value.type }, { upsert: true, setDefaultsOnInsert: true, new: true });
        
        sendResponse(res, { status: 200, message: "Updated watchlist item", responsePayload: { id: watchlistItem?._id.toString() } });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error adding to watchlist" });
    }
};

const removeItemFromWatchlist = async (req: express.Request, res: express.Response) => {
    const id = req.query.media_id;
    const type = req.query.type;

    if (!id) return res.status(400).send({ status: "error", message: "Invalid media id" });
    if (!type || !isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        await watchlistSchema.findOneAndDelete({ user_id: req.user!.id, media_id: id as string, type: type as string });
        sendResponse(res, { status: 200, message: "Item removed from watchlist" });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error removing item from watchlist" });
    }
};

export { getWatchlist, updateWatchlist, removeItemFromWatchlist};
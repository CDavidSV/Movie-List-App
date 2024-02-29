import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";
import Series from "../../Models/Series";
import Movie from "../../Models/Movie";

const watchlistStatus = new Map([
    [0, "Watching"],
    [1, "Plan to Watch"],
    [2, "Finished"]
]);

const getWatchlist = async (req: express.Request, res: express.Response) => {
    const status = req.query.status ? parseInt(req.query.status as string) : 3;
    const cursor = req.query.cursor;

    if (status < 0 || status > 3) return sendResponse(res, { status: 400, message: "Invalid status integer" });

    let match: any = { user_id: req.user?.id, status: status };
    let sort: any = { updated_date: -1 };
    if (status === 3) { 
        match = { user_id: req.user?.id }
        sort = { status: 1, updated_date: -1 } 
    };
    if (cursor) match.updated_date = { $lt: cursor };

    watchlistSchema.aggregate([
        {
            $match: match
        },
        {
            $sort: sort
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
    ]).limit(100).then((result) => {
        const watchlist = result.map((item) => {
            if (item.media.length < 1) return {
                id: item._id,
                media_id: item.media_id,
                dateAdded: item.date_added,
                title: "Untitled",
                description: "No description available",
                posterUrl: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                releaseDate: "NA",
                runtime: 0,
                type: item.type,
                favorited: item.favorited.length >= 1 ? true : false,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: 0
            };
            return {
                id: item._id,
                media_id: item.media_id,
                dateAdded: item.date_added,
                title: item.media[0].title,
                description: item.media[0].description,
                posterUrl: item.media[0].poster_url ? `${config.tmdbImageLarge}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.media[0].backdrop_url ? `${config.tmdbImageXLarge}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                releaseDate: item.media[0].release_date ? item.media[0].release_date : "NA",
                runtime: item.media[0].runtime ? item.media[0].runtime : 0,
                type: item.type,
                favorited: item.favorited.length >= 1 ? true : false,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: item.type === 'movie' ? 1 : item.media[0].episode_count
            }
        });

        const last_id = result.length > 0 ? new Date(result[result.length - 1].updated_date).getTime() : null;
        sendResponse(res, { status: 200, message: "Watchlist fetched", responsePayload: { cursor: last_id, watchlist } });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    });
};

const updateWatchlist = async (req: express.Request, res: express.Response) => {
    let { media_id, status, progress, type } = req.body;
    const registerSchema = {
        media_id: { type: "string", required: true },
        status: { type: "number", required: true },
        progress: { type: "number", required: true },
        type: { type: "string", required: true }
    }

    const missingFields = validateJsonBody(req.body, registerSchema);
    if (!missingFields) return sendResponse(res, { status: 400, message: "Invalid request body" });
    if (status < 0 || status > 5) return sendResponse(res, { status: 400, message: "Invalid status" });
    if (!isValidMediaType(type)) return sendResponse(res, { status: 400, message: "Invalid type" });

    // Validate id and get the latest favorite saved
    try {
        const mediaData = await findMediaById(media_id as string, type);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });
        
        // Check progress
        if (progress < 0) progress = 0;
        if (mediaData instanceof Series && progress > mediaData.numberOfEpisodes) { 
            progress = mediaData.numberOfEpisodes;
        } else if (mediaData instanceof Movie && progress > 1) {
            progress = 1;
        }

        // Save to database
        const watchlistItem = await watchlistSchema.findOneAndUpdate({ user_id: req.user!.id, media_id, type: type  }, { status, progress, updated_date: Date.now(), type: type }, { upsert: true, setDefaultsOnInsert: true, new: true });
        
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
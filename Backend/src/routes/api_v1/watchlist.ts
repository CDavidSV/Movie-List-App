import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import Media from "../../Models/Movie";
import saveMovie from "../../util/mediaHandler";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";

const watchlistStatus = new Map([
    [0, "Not Started"],
    [1, "Watching"],
    [2, "Paused"],
    [3, "Finished"],
    [4, "Dropped"],
    [5, "Plan to Watch"]
]);

const getWatchlist = async (req: express.Request, res: express.Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const skip = isNaN(page) ? 0 : (page - 1) * 500;

    watchlistSchema.aggregate([
        {
            $match: {
                user_id: req.user?.id,
            }
        },
        {   
            // TODO: Fetch the correct media type based on the watchlist type field
            $lookup: {
                from: 'media',
                localField: 'media_id',
                foreignField: 'media_id',
                as: 'media'
            }
        },
        {
            $lookup: {
                from: 'favorites',
                let: { user_id: '$user_id', media_id: '$media_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$user_id'] },
                                    { $eq: ['$media_id', '$$media_id'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'favorited'
            }
        }
    ]).skip(skip).limit(500).then((result) => {
        const watchlist = result.map((item) => {
            if (item.media.length < 1) return {
                id: item._id,
                media_id: item.media_id,
                date_added: item.date_added,
                title: "Untitled",
                description: "No description available",
                poster_url: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                release_date: "NA",
                runtime: 0,
                favoorited: item.favoorited.length >= 1 ? true : false
            };
            return {
                id: item._id,
                media_id: item.media_id,
                date_added: item.date_added,
                title: item.media[0].title,
                description: item.media[0].description,
                poster_url: item.media[0].poster_url ? `${config.tmbdImageBaseUrl}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdrop_url: item.media[0].backdrop_url ? `${config.tmbdImageBaseUrl}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                release_date: item.media[0].release_date ? item.media[0].release_date : "NA",
                runtime: item.media[0].runtime ? item.media[0].runtime : 0,
                favoorited: item.favoorited.length >= 1 ? true : false
            }
        });

        sendResponse(res, { status: 200, message: "Watchlist fetched", responsePayload: watchlist });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    });
};

const updateWatchlist = async (req: express.Request, res: express.Response) => {
    const { media_id, status, progress, type } = req.body;

    const registerSchema = {
        media_id: { type: "string", required: true },
        status: { type: "number", required: true },
        progress: { type: "number", required: true },
        type: { type: "string", required: true },
    }

    const missingFields = validateJsonBody(req.body, registerSchema);
    if (!missingFields) return sendResponse(res, { status: 400, message: "Invalid request body" });
    if (status < 0 || status > 5) return sendResponse(res, { status: 400, message: "Invalid status" });
    if (!isValidMediaType(type)) return sendResponse(res, { status: 400, message: "Invalid type" });
    // Validate id and get the latest favorite saved
    try {
        const mediaData = await findMediaById(media_id as string, type);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        // Save to database
        const watchlistItem = await watchlistSchema.findOneAndUpdate({ user_id: req.user!.id, media_id, type: type  }, { status, progress, updated_date: Date.now(), type: type }, { upsert: true, setDefaultsOnInsert: true, new: true });
        
        sendResponse(res, { status: 200, message: "Added to watchlist", responsePayload: { id: watchlistItem?._id.toString() } });

        saveMovie(mediaData as Media, type);
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

export { getWatchlist, updateWatchlist, removeItemFromWatchlist };
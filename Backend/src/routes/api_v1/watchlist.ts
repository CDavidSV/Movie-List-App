import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById } from "../../util/TMDB";
import Media from "../../Models/Media";
import saveMovie from "../../util/mediaHandler";
import { sendResponse } from "../../util/apiHandler";

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
            $lookup: {
                from: 'media',
                localField: 'media_id',
                foreignField: 'media_id',
                as: 'media'
            }
        }
    ]).skip(skip).limit(500).then((result) => {
        const watchlist = result.map(item => {
            return {
                id: item._id,
                media_id: item.media_id,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                rating: item.rating,
                added_date: item.added_date,
                updated_date: item.updated_date,
                title: item.media.length >= 1 ? item.media[0].title : "Untitled",
                description: item.media.length >= 1 ? item.media[0].description : "No description available",
                poster_url: item.media.length >= 1 ? item.media[0].poster_url : "https://via.placeholder.com/300x450.png?text=No+Poster",
                release_date: item.media.length >= 1 ? item.media[0].release_date : "NA",
                runtime: item.media.length >= 1 ? item.media[0].runtime : 0
            }
        });

        sendResponse(res, { status: 200, message: "Watchlist fetched", responsePayload: watchlist });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    });
};

const updateWatchlist = async (req: express.Request, res: express.Response) => {
    const { media_id, status, progress } = req.body;

    const registerSchema = {
        media_id: { type: "string", required: true },
        status: { type: "number", required: true },
        progress: { type: "number", required: true }
    }

    const missingFields = validateJsonBody(req.body, registerSchema);
    if (!missingFields) return sendResponse(res, { status: 400, message: "Invalid request body" });
    if (status < 0 || status > 5) return sendResponse(res, { status: 400, message: "Invalid status" });
    // Validate id and get the latest favorite saved
    try {
        const mediaData = await findMediaById(media_id as string);
        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        // Save to database
        const watchlistItem = await watchlistSchema.findOneAndUpdate({ user_id: req.user!.id, media_id }, { status, progress, updated_date: Date.now() }, { upsert: true, setDefaultsOnInsert: true, new: true });
        
        sendResponse(res, { status: 200, message: "Added to watchlist", responsePayload: { id: watchlistItem?._id.toString() } });

        saveMovie(mediaData as Media);
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error adding to watchlist" });
    }
};

const removeItemFromWatchlist = async (req: express.Request, res: express.Response) => {
    const id = req.query.id;

    if (!id) return res.status(400).send({ status: "error", message: "Invalid watchlist id" });

    try {
        await watchlistSchema.findByIdAndDelete(id as string);
        res.status(200).send({ status: "success", message: "Removed from watchlist" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error removing item from watchlist" });
    }
};

export { getWatchlist, updateWatchlist, removeItemFromWatchlist };
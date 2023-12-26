import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";
import { validateJsonBody } from "../../util/validateJson";
import { findMediaById } from "../../util/TMDB";
import Media from "../../Models/Media";
import saveMovie from "../../util/mediaHandler";

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

        res.status(200).send({ status: "success", watchlist });
    }).catch((err) => {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error fetching watchlist" });
    });
};

const getWatchlistItem = async (req: express.Request, res: express.Response) => {
    const queryId = req.query.id;

    if (!queryId) return res.status(400).send({ status: "error", message: "Invalid film id" });

    try {
        const watchlistItem = await watchlistSchema.findOne({ user_id: req.user!.id, _id: queryId });
        if (!watchlistItem) return res.status(404).send({ status: "error", message: "Watchlist item not found" });

        const responseData = {
            id: watchlistItem._id,
            status: watchlistStatus.get(watchlistItem.status),
            progress: watchlistItem.progress,
            rating: watchlistItem.rating,
            addedDate: watchlistItem.added_date,
            updatedDate: watchlistItem.updated_date
        }

        res.status(200).send({ status: "success", data: responseData });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error fetching watchlist item" });
    }
};

const updateWatchlist = async (req: express.Request, res: express.Response) => {
    const { media_id, status, progress } = req.body;

    const registerSchema = {
        media_id: { type: "string", required: true },
        status: { type: "number", required: true },
        progress: { type: "number", required: true }
    }

    const missingFields = validateJsonBody(req.body, registerSchema);
    if (!missingFields) return res.status(400).send({ status: "error", message: "Invalid request body" });
    if (status < 0 || status > 5) return res.status(400).send({ status: "error", message: "Invalid status integer" });
    // Validate id and get the latest favorite saved
    try {
        const mediaData = await findMediaById(media_id as string);
        if (!mediaData) return res.status(404).send({ status: "error", message: "Media not found" });

        // Save to database
        await watchlistSchema.findOneAndUpdate({ user_id: req.user!.id, media_id }, { status, progress, updated_date: Date.now() }, { upsert: true, setDefaultsOnInsert: true }).then(() => { });
        
        res.status(201).send({ status: "success", message: "Added to watchlist" });

        saveMovie(mediaData as Media);
    } catch (err) {
        return res.status(404).send({ status: "error", message: "Could not add to watchlist" });
    }
};

const removeItemFromWatchlist = async (req: express.Request, res: express.Response) => {
    const media_id = req.query.media_id;

    if (!media_id) return res.status(400).send({ status: "error", message: "Invalid media id" });

    try {
        await watchlistSchema.deleteOne({ user_id: req.user!.id, media_id });
        res.status(200).send({ status: "success", message: "Removed from watchlist" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "error", message: "Error removing item from watchlist" });
    }
};

export { getWatchlist, updateWatchlist, removeItemFromWatchlist, getWatchlistItem };
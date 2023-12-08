import express from "express";
import watchlistSchema from "../../scheemas/watchlistSchema";

enum WatchlistStatus {
    Watching = "0",
    Completed = "1",
    OnHold = "2",
    Dropped = "3",
    PlanToWatch = "4"
}

const getWatchlist = async (req: express.Request, res: express.Response) => {
    const { status_type } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const skip = isNaN(page) ? 0 : (page - 1) * 500;

    watchlistSchema.aggregate([
        {
            $match: {
                user_id: req.user?.id,
                status: status_type
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
                status: item.status,
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

// router.post("/add", authenticateAccessToken, (req: express.Request, res: express.Response) => {
//     const { media_id, status, progress } = req.query;
// });

// router.post("/update-status", (req: express.Request, res: express.Response) => {
//     const { media_id, status, progress } = req.query;
// });

export { getWatchlist };
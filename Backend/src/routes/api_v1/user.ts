import { Request, Response } from "express";
import { sendResponse } from "../../util/apiHandler";
import watchlistSchema from "../../scheemas/watchlistSchema";
import favoritesSchema from "../../scheemas/favoritesSchema";

const hasMedia = async (req: Request, res: Response) => {
    const ids = req.query.ids as string;
    if (!ids) return sendResponse(res, { status: 400, message: "Invalid request" });

    const idList = ids.split(",");

    try {
        const watchlist = await watchlistSchema.find({ user_id: req.user!.id, media_id: { $in: idList } });
        const favorites = await favoritesSchema.find({ user_id: req.user!.id, media_id: { $in: idList } });

        const itemsInWatchlist = new Map<string, { favorite: string | null, watchlist: string | null }>();
        for (let id of idList) {
            const favoriteItem = favorites.find(item => item.media_id === id);
            const watchlistItem = watchlist.find(item => item.media_id === id);

            const status: { favorite: string | null, watchlist: string | null } = { favorite: null, watchlist: null };
            if (watchlistItem) {
                status.watchlist = watchlistItem._id.toString();
            }
            if (favoriteItem) {
                status.favorite = favoriteItem._id.toString();
            }
            itemsInWatchlist.set(id, status);
        }
        const itemsInWatchlistObject = Object.fromEntries(itemsInWatchlist);
        sendResponse(res, { status: 200, message: "Items fetched succcessfully", responsePayload: itemsInWatchlistObject });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    }
};

export { hasMedia };
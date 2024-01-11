import { Request, Response } from "express";
import { sendResponse } from "../../util/apiHandler";
import watchlistSchema from "../../scheemas/watchlistSchema";
import favoritesSchema from "../../scheemas/favoritesSchema";

// TODO: Implement this directly when returning the media list
const hasMedia = async (req: Request, res: Response) => {
    const ids = req.query.ids as string;
    if (!ids) return sendResponse(res, { status: 400, message: "Invalid request" });

    const idList = ids.split(",");

    try {
        const watchlist = await watchlistSchema.find({ user_id: req.user!.id, media_id: { $in: idList } });
        const favorites = await favoritesSchema.find({ user_id: req.user!.id, media_id: { $in: idList } });

        const itemsInWatchlist = new Map<string, { favorite: boolean, watchlist: boolean }>();
        for (let id of idList) {
            const favoriteItem = favorites.find(item => item.media_id === id);
            const watchlistItem = watchlist.find(item => item.media_id === id);
            
            const status: { favorite: boolean, watchlist: boolean } = { favorite: false, watchlist: false };
            if (watchlistItem) {
                status.watchlist = true
            }
            if (favoriteItem) {
                status.favorite = true;
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
import { Request, Response } from "express";
import { sendResponse } from "../../util/apiHandler";
import watchlistSchema from "../../scheemas/watchlistSchema";
import favoritesSchema from "../../scheemas/favoritesSchema";

interface RequestMedia {
    media_id: number;
    type: string;
}

const hasMedia = async (req: Request, res: Response) => {
    const reqMedia = req.body as unknown as RequestMedia[];
    if (!reqMedia) return sendResponse(res, { status: 400, message: "Invalid request" });

    // TODO: Validate the request body
    // Validate the request body


    try {
        const idList = reqMedia.map((i) => i.media_id.toString());
        const [watchlist, favorites] = await Promise.all([
            watchlistSchema.find({ user_id: req.user!.id, media_id: { $in: idList } }),
            favoritesSchema.find({ user_id: req.user!.id, media_id: { $in: idList } })
        ]);

        const itemsInWatchlist = new Map<string, { favorite: boolean, watchlist: boolean }>();
        for (let media of reqMedia) {
            // Check if the current media is in the user's watchlist or favorites based on the id of the media and its type
            const favoriteItem = favorites.find(item => item.media_id === media.media_id.toString() && item.type === media.type);
            const watchlistItem = watchlist.find(item => item.media_id === media.media_id.toString() && item.type === media.type);
            
            const status: { favorite: boolean, watchlist: boolean } = { favorite: false, watchlist: false };
            if (watchlistItem) {
                status.watchlist = true
            }
            if (favoriteItem) {
                status.favorite = true;
            }

            if (!status.favorite && !status.watchlist) continue;
            itemsInWatchlist.set(media.media_id.toString(), status);
        }
        const itemsInWatchlistObject = Object.fromEntries(itemsInWatchlist);
        sendResponse(res, { status: 200, message: "Items fetched succcessfully", responsePayload: itemsInWatchlistObject });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    }
};

export { hasMedia };
import { Request, Response } from "express";
import { sendResponse } from "../../util/apiHandler";
import watchlistSchema from "../../scheemas/watchlistSchema";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import Series from "../../Models/Series";
import userSchema from "../../scheemas/userSchema";
import { SHA256 } from "crypto-js";
import historySchema from "../../scheemas/historySchema";
import userSessionsSchema from "../../scheemas/userSessionsSchema";

interface RequestMedia {
    media_id: number;
    type: string;
}

const getMeUserInfo = async (req: Request, res: Response) => {
    userSchema.findOne({ _id: req.user!.id }).then(user => {
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        sendResponse(res, 
            { 
                status: 200, 
                message: "User fetched successfully", 
                responsePayload: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    verified: user.verified,
                    joinedAt: user.joined_at,
                    profileUrl: user.profile_picture_url,
                    bannerUrl: user.profile_banner_url,
                } 
            }
        );
    }).catch(err => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching user info" });
    });
};

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

const getStatusInPersonalLists = async (req: Request, res: Response) => {
    const { media_id, type } = req.query;

    if (!media_id) return sendResponse(res, { status: 400, message: "Invalid media id" });
    if (!type || !isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        const [watchlistItem, favoriteItem, mediaData] = await Promise.all([
            watchlistSchema.findOne({ user_id: req.user!.id, media_id: media_id, type: type }),
            favoritesSchema.findOne({ user_id: req.user!.id, media_id: media_id, type: type }),
            findMediaById(media_id as string, type as string)
        ]);

        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        const status: any = { favorite: null, watchlist: null };
        if (watchlistItem) {
            status.watchlist = {
                id: watchlistItem._id.toString(),
                status: watchlistItem.status,
                progress: watchlistItem.progress,
                dateUpdated: watchlistItem.updated_date,
                dateAdded: watchlistItem.added_date,
                totalProgress: mediaData instanceof Series ? mediaData.numberOfEpisodes : 1
            };
        }
        if (favoriteItem) {
            status.favorite = {
                id: favoriteItem._id.toString(),
                dateAdded: favoriteItem.date_added,
            };
        }

        sendResponse(res, { status: 200, message: "Status fetched succcessfully", responsePayload: status });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching status" });
    }
};

const uploadProfilePicture = async (req: Request, res: Response) => {
    if (!req.file) return sendResponse(res, { status: 400, message: "Invalid request. No image provided" });

    sendResponse(res, { status: 200, message: "Profile picture uploaded successfully", responsePayload: { imageUrl: req.file.path } });
};

const changeUsername = async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) return sendResponse(res, { status: 400, message: "No username provided" });

    if (username.length < 3 || username.length > 20) return sendResponse(res, { status: 400, message: "Username has to be between 3 to 20 characters long" });

    try {
        const user = await userSchema.findOne({ username: username });
        if (user) return sendResponse(res, { status: 400, message: "Username already taken" });
        
        await userSchema.updateOne({ _id: req.user!.id }, { username: username });
        return sendResponse(res, { status: 200, message: "Username changed successfully" });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error changing username" });
    }
};

const deleteAccount = async (req: Request, res: Response) => {
        // Check if the request type is form encoded.
        if (!req.is("application/x-www-form-urlencoded")) return sendResponse(res, { status: 400, message: "Invalid request body" });
        
        const password = req.body.password;
        if (!password) return sendResponse(res, { status: 400, message: "No password provided" });

        // Validate password and attempt to delete the user's account. :(
        try {
            const user = await userSchema.findById(req.user!.id);
            if (!user) return sendResponse(res, { status: 404, message: "User not found" });

            const passwordHash = user.password_hash;
            const passwordSalt = user.password_salt;

            if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return sendResponse(res, { status: 400, message: "The password is incorrect" });

            // Delete the user's account and all of their data.
            await Promise.all([
                userSchema.deleteOne({ _id: req.user!.id }),
                historySchema.deleteMany({ user_id: req.user!.id }),
                watchlistSchema.deleteMany({ user_id: req.user!.id }),
                favoritesSchema.deleteMany({ user_id: req.user!.id }),
                userSessionsSchema.deleteMany({ user_id: req.user!.id })
            ]);

            // Update cookies.
            res.clearCookie("a_t");
            res.clearCookie("r_t");
            res.clearCookie("s_id");
            
            return sendResponse(res, { status: 200, message: "Account deleted successfully" });
        } catch (err) {
            console.error(err);
            return sendResponse(res, { status: 500, message: "Error deleting account" });
        }
};

export { hasMedia, getStatusInPersonalLists, getMeUserInfo, uploadProfilePicture, changeUsername, deleteAccount };
import { Request, Response } from "express";
import { sendResponse } from "../../util/apiHandler";
import watchlistSchema from "../../scheemas/watchlistSchema";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import Series from "../../Models/Series";
import userSchema from "../../scheemas/userSchema";
import { SHA256 } from "crypto-js";
import Joi from "joi";
import { v4 as uuid } from 'uuid';
import sharp from "sharp";
import config from "../../config/config";
import { Readable } from "stream";
import { s3 } from "../../util/aws";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { invalidateAllUserSessions } from "../../util/sessionHandler";
import mongoose from "mongoose";
import { watchlistStatus } from "../../util/helpers";

const getUserInfo = async (req: Request, res: Response) => {
    const username = req.params.username;

    if (!username) return sendResponse(res, { status: 400, message: "Username is required" });

    userSchema.findOne({ username: username }, {
        id: { $toString: "$_id" },
        username: 1,
        joined_at: 1,
        profile_picture_url: 1,
        profile_banner_url: 1,
        public_favorites: 1,
        public_watchlist: 1,
        _id: 0
    }).then(user => {
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        sendResponse(res,
            {
                status: 200,
                message: "User fetched successfully",
                responsePayload: user
            }
        );
    }).catch(err => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching user info" });
    });
};

const getUserWatchlist = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const cursor = req.query.cursor;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return sendResponse(res, { status: 400, message: "Invalid user id" });

    let sanitizedCursor: number[] = [];
    if (cursor && typeof cursor === 'string') {
        cursor.split('.').forEach((item) => {
            if (isNaN(parseInt(item))) return sendResponse(res, { status: 400, message: "Invalid cursor" });
            sanitizedCursor.push(parseInt(item));
        });
    }

    const match: any = { user_id: userId };
    if (sanitizedCursor.length) {
        match.$and = [
            { updated_date: { $lt: new Date(sanitizedCursor[1]) } },
            { status: { $gte: sanitizedCursor[0] } }
        ];
    }

    Promise.all([
        userSchema.findById(userId, { public_watchlist: 1, _id: 0 }),
        watchlistSchema.aggregate([
            { $match: match },
            { $sort: { status: 1, updated_date: -1 } },
            { $limit: 100 },
            {
                $lookup: {
                    from: "media",
                    let: { media_id: "$media_id", type: "$type" },
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
                    as: "media"
                }
            },
            {
                $project: {
                    media_id: 1,
                    media: 1,
                    type: 1,
                    status: 1,
                    progress: 1,
                    updated_date: 1,
                    added_date: 1,
                    _id: 0
                }
            }
        ])
    ]).then(([user, watchlist]) => {
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        if (!user.public_watchlist) sendResponse(res, { status: 403, message: "User's watchlist is private" });
        const responseWatchlist = watchlist.map((item) => {
            if (item.media.length < 1) return {
                mediaId: item.media_id,
                dateAdded: item.date_added,
                title: "Untitled",
                description: "No description available",
                posterUrl: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: item.type,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: 0
            };
            return {
                mediaId: item.media_id,
                dateAdded: item.date_added,
                title: item.media[0].title,
                description: item.media[0].description,
                posterUrl: item.media[0].poster_url ? `${config.tmdbImageLarge}${item.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: item.media[0].backdrop_url ? `${config.tmdbImageXLarge}${item.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: item.type,
                status: watchlistStatus.get(item.status),
                progress: item.progress,
                totalProgress: item.type === 'movie' ? 1 : item.media[0].episode_count
            }
        });

        const cursor = watchlist.length < 100 ? null : `${watchlist[watchlist.length - 1].status}.${new Date(watchlist[watchlist.length - 1].updated_date).getTime()}`;

        sendResponse(res, { status: 200, message: "Watchlist fetched successfully", responsePayload: { cursor, responseWatchlist } });
    }).catch(err => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching watchlist" });
    });
};

const getUserFavorites = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const last_rank = req.query.last_rank;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return sendResponse(res, { status: 400, message: "Invalid user id" });

    Promise.all([
        userSchema.findById(userId, { public_favorites: 1, _id: 0 }),
        favoritesSchema.aggregate([
            {
                $match: !last_rank || typeof last_rank !== 'string' ?  { user_id: userId } : { user_id: userId, _id: { $lt: last_rank } }
            },
            { $sort: { rank: 1 } },
            { $limit: 100 },
            {
                $lookup: {
                    from: "media",
                    let: { media_id: "$media_id", type: "$type" },
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
                        {
                            $project: { _id: 0, title: 1, description: 1, poster_url: 1, backdrop_url: 1 }
                        },
                    ],
                    as: "media"
                }
            },
            {
                $project: {
                    media: 1,
                    media_id: 1,
                    type: 1,
                    date_added: 1
                }
            }
        ])
    ]).then(([user, favorites]) => {
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        if (!user.public_favorites) sendResponse(res, { status: 403, message: "User's favorites are private" });

        const responseFavorites = favorites.map((favorite) => {
            if (favorite.media.length < 1) return {
                mediaId: favorite.media_id,
                type: favorite.type,
                dateAdded: favorite.date_added,
                title: "Untitled",
                description: "No description available",
                posterUrl: "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: "https://via.placeholder.com/1280x720.png?text=No+Backdrop"
            };
            return {
                mediaId: favorite.media_id,
                type: favorite.type,
                dateAdded: favorite.date_added,
                title: favorite.media[0].title,
                description: favorite.media[0].description,
                posterUrl: favorite.media[0].poster_url ? `${config.tmdbImageLarge}${favorite.media[0].poster_url}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: favorite.media[0].backdrop_url ? `${config.tmdbImageLarge}${favorite.media[0].backdrop_url}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop"
            }
        });

        const lastRank = favorites.length >= 100 ? favorites[favorites.length - 1].rank : null;
        sendResponse(res, { status: 200, message: "Favorites fetched", responsePayload: { lastRank, responseFavorites } });
    }).catch(err => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching favorites" });
    });
};

const getMeUserInfo = async (req: Request, res: Response) => {
    userSchema.findOne({ _id: req.user!.id }, {
        id: { $toString: "$_id" },
        username: 1,
        email: 1,
        verified: 1,
        joined_at: 1,
        profile_picture_url: 1,
        profile_banner_url: 1,
        mature_content: 1,
        public_favorites: 1,
        public_watchlist: 1,
        _id: 0
    }).then(user => {
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        sendResponse(res,
            {
                status: 200,
                message: "User fetched successfully",
                responsePayload: user
            }
        );
    }).catch(err => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching user info" });
    });
};

const hasMedia = async (req: Request, res: Response) => {
    const reqMedia = req.body;
    if (!reqMedia) return sendResponse(res, { status: 400, message: "Invalid request" });

    const requestMediaSchema = Joi.array().items(Joi.object({
        media_id: Joi.number().required(),
        type: Joi.string().required()
    }));

    const { value, error } = requestMediaSchema.validate(reqMedia);
    if (error) return sendResponse(res, { status: 400, message: error.details[0].message });

    try {
        const idList = value.map((i) => i.media_id.toString());
        const [watchlist, favorites] = await Promise.all([
            watchlistSchema.find({ user_id: req.user!.id, media_id: { $in: idList } }, { media_id: 1, type: 1 }),
            favoritesSchema.find({ user_id: req.user!.id, media_id: { $in: idList } }, { media_id: 1, type: 1 })
        ]);

        const itemsInWatchlist = new Map<string, { favorite: boolean, watchlist: boolean }>();
        for (let media of value) {
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

    if (!media_id) return sendResponse(res, { status: 400, message: "Media id required" });
    if (!type || !isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        const [watchlistItem, favoriteItem, mediaData] = await Promise.all([
            watchlistSchema.findOne({ user_id: req.user!.id, media_id: media_id, type: type }, { id: { $toString: "$_id" }, status: 1, progress: 1, updated_date: 1, added_date: 1, _id: 0 }),
            favoritesSchema.findOne({ user_id: req.user!.id, media_id: media_id, type: type }, { id: { $toString: "$_id" }, date_added: 1, _id: 0 }),
            findMediaById(media_id as string, type as string)
        ]);

        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        const status: any = { favorite: null, watchlist: null };
        if (watchlistItem) {
            status.watchlist = {
                id: watchlistItem.id,
                status: watchlistItem.status,
                progress: watchlistItem.progress,
                dateUpdated: watchlistItem.updated_date,
                dateAdded: watchlistItem.added_date,
                totalProgress: mediaData instanceof Series ? mediaData.numberOfEpisodes : 1
            };
        }
        if (favoriteItem) {
            status.favorite = {
                id: favoriteItem.id,
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
    const buffer = req.file.buffer;

    try {
        // The image needs to have an aspect ratio of 1:1
        const imgMetadata = await sharp(buffer).metadata();

        if (imgMetadata.width !== imgMetadata.height) return sendResponse(res, { status: 400, message: "Invalid image. The image must have an aspect ratio of 1:1" });

        const user = await userSchema.findById(req.user!.id, { profile_picture_url: 1 });

        const filename = `avatars/${req.user?.id}.${req.file.mimetype.split("/")[1]}`;
        const uploadParams: PutObjectCommandInput = {
            Bucket: config.bucketName,
            Key: filename,
            Body: buffer,
            ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);

        await Promise.all([
            s3.send(command),
            userSchema.updateOne({ _id: req.user!.id }, { profile_picture_url: filename }).exec()
        ]);
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error uploading profile picture" });
    }

    sendResponse(res, { status: 200, message: "Profile picture uploaded successfully", responsePayload: { imageUrl: req.file.path } });
};

const uploadBannerPicture = async (req: Request, res: Response) => {
    if (!req.file) return sendResponse(res, { status: 400, message: "Invalid request. No image provided" });
    const buffer = req.file.buffer;

    try {
        // The image needs to have an aspect ratio of 16:9
        const imgMetadata = await sharp(buffer).metadata();

        if (Math.abs(imgMetadata.width! / imgMetadata.height! - 16 / 9) > 0.2) return sendResponse(res, { status: 400, message: "Invalid image. The image must have an aspect ratio of 16:9" });

        const filename = `banners/${req.user?.id}.${req.file.mimetype.split("/")[1]}`;
        const uploadParams: PutObjectCommandInput = {
            Bucket: config.bucketName,
            Key: filename,
            Body: buffer,
            ContentType: req.file.mimetype
        };

        const command = new PutObjectCommand(uploadParams);

        await Promise.all([
            s3.send(command),
            userSchema.updateOne({ _id: req.user!.id }, { profile_banner_url: filename }).exec()
        ]);
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error uploading banner image" });
    }

    sendResponse(res, { status: 200, message: "Banner uploaded successfully", responsePayload: { imageUrl: req.file.path } });
};


const changeUsername = async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) return sendResponse(res, { status: 400, message: "No username provided" });

    const usernameSchema = Joi.string().min(3).max(20).required();

    const { error } = usernameSchema.validate(username);
    if (error) return sendResponse(res, { status: 400, message: error.details[0].message.replace('"value"', "Username") });

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

const updateUser = async (req: Request, res: Response) => {
    const body = req.body;

    const updateUserSchema = Joi.object({
        username: Joi.string().min(3).max(20).optional(),
        public_favorites: Joi.boolean().optional(),
        public_watchlist: Joi.boolean().optional(),
        mature_content: Joi.boolean().optional()
    });

    const { error, value } = updateUserSchema.validate(body);
    if (error) return sendResponse(res, { status: 400, message: error.details[0].message });

    const updateUserObj: any = {};

    for (let key in value) {
        if (value[key] !== undefined) updateUserObj[key] = value[key];
    }

    try {
        await userSchema.updateOne({ _id: req.user!.id }, updateUserObj);

        sendResponse(res, { status: 200, message: "User settings updated successfully" });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error updating user settings" });
    }
}

const deleteAccount = async (req: Request, res: Response) => {
    // Check if the request type is form encoded.
    if (!req.is("application/x-www-form-urlencoded")) return sendResponse(res, { status: 400, message: "Invalid request body" });

    const password = req.body.password;
    if (!password) return sendResponse(res, { status: 400, message: "No password provided" });

    // Validate password and schedule user's account for deletion. :(
    try {
        const user = await userSchema.findById(req.user!.id);
        if (!user) return sendResponse(res, { status: 404, message: "User not found" });

        const passwordHash = user.password_hash;
        const passwordSalt = user.password_salt;

        if (SHA256(`${password}${passwordSalt}`).toString() !== passwordHash) return sendResponse(res, { status: 400, message: "The password is incorrect" });

        // Delete the user's account and all of their data.
        await userSchema.updateOne({ _id: req.user!.id }, { deletion_timestamp: Date.now() + 1000 * 60 * 60 * 3 }); // 3 hours from now.

        // Clear all user's sessions.
        invalidateAllUserSessions(req.user!.id);

        // Update cookies.
        res.clearCookie("a_t", { domain: config.domain });
        res.clearCookie("r_t", { domain: config.domain });
        res.clearCookie("s_id", { domain: config.domain });

        return sendResponse(res, { status: 200, message: "Account deleted successfully" });
    } catch (err) {
        console.error(err);
        return sendResponse(res, { status: 500, message: "Error deleting account" });
    }
};

const searchUserByName = async (req: Request, res: Response) => {
    const { username } = req.query;

    if (typeof username !== 'string' || username.length > 20) return sendResponse(res, { status: 400, message: "Invalid username" });
    userSchema.aggregate([
        {
            $search: {
                index: "username",
                text: {
                    query: `/${username}/`,
                    path: "username",
                    fuzzy: {}
                }
            }
        },
        {
            $project: {
                username: 1,
                profile_picture_url: 1,
                joined_at: 1,
                id: { $toString: '$_id' },
                _id: 0
            }
        }
    ]).then((response) => {
        sendResponse(res, { status: 200, message: "Users fetched successfully", responsePayload: response });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error searching for users" });
    });
}

export {
    hasMedia,
    getStatusInPersonalLists,
    getMeUserInfo,
    uploadProfilePicture,
    changeUsername,
    deleteAccount,
    getUserInfo,
    uploadBannerPicture,
    updateUser,
    getUserWatchlist,
    getUserFavorites,
    searchUserByName
};

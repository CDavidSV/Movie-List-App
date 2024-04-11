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
import Joi from "joi";
import fs from "fs";
import { v4 as uuid } from 'uuid';
import path from "path";
import sharp from "sharp";

const getuserInfo = async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId) return sendResponse(res, { status: 400, message: "Invalid user id" });

    userSchema.findOne({ _id: userId }, {
        id: { $toString: "$_id" },
        username: 1,
        email: 1,
        verified: 1,
        joined_at: 1,
        profile_picture_url: 1,
        profile_banner_url: 1,
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

const getMeUserInfo = async (req: Request, res: Response) => {
    userSchema.findOne({ _id: req.user!.id }, {
        id: { $toString: "$_id" },
        username: 1,
        email: 1,
        verified: 1,
        joined_at: 1,
        profile_picture_path: 1,
        profile_banner_path: 1,
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

        const filename = `${uuid()}.${req.file.mimetype.split("/")[1]}`;

        // Check if the user already has a profile picture and delete it if they do.
        const user = await userSchema.findById(req.user!.id);
        if (user && user.profile_picture_path) {
            fs.unlink(path.join(__dirname, `../../public${user.profile_picture_path}`), (err) => {
                if (err) console.error(err);
            });
        }
        
        await userSchema.updateOne({ _id: req.user!.id }, { profile_picture_path: `/images/${filename}` });
        fs.writeFileSync(path.join(__dirname, `../../public/images/${filename}`), buffer);
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

        const filename = `${uuid()}.${req.file.mimetype.split("/")[1]}`;

        // Check if the user already has a profile picture and delete it if they do.
        const user = await userSchema.findById(req.user!.id);
        if (user && user.profile_banner_path) {
            fs.unlink(path.join(__dirname, `../../public${user.profile_banner_path}`), (err) => {
                if (err) console.error(err);
            });
        }
        
        await userSchema.updateOne({ _id: req.user!.id }, { profile_banner_path: `/images/${filename}` });
        fs.writeFileSync(path.join(__dirname, `../../public/images/${filename}`), buffer);
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

export { hasMedia, getStatusInPersonalLists, getMeUserInfo, uploadProfilePicture, changeUsername, deleteAccount, getuserInfo, uploadBannerPicture };
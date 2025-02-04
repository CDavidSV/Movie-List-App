import express from "express";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { findMediaById, isValidMediaType } from "../../util/TMDB";
import { calculateLexoRank, getNextLexoRank, getPreviousLexoRank } from "../../util/lexorank";
import { sendResponse } from "../../util/apiHandler";
import config from "../../config/config";
import Joi from "joi";

const getFavorites = async (req: express.Request, res: express.Response) => {
    const last_rank = req.query.last_rank;

    let mongoQuery: any = { user_id: req.user?.id };
    if (last_rank) mongoQuery._rank = { $lt: last_rank };

    favoritesSchema.aggregate([
        { $match: mongoQuery },
        { $sort: { rank: 1 } },
        { $limit: 100 },
        {
            $lookup: {
                from: 'media',
                let: { media_id: '$media_id', type: '$type' },
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
                as: 'media'
            }
        },
        {
            $lookup: {
                from: 'watchlists',
                let: { user_id: '$user_id', media_id: '$media_id', type: '$type'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$user_id'] },
                                    { $eq: ['$media_id', '$$media_id'] },
                                    { $eq: ['$type', '$$type'] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 },
                    {
                        $group: {
                            _id: null,
                            exists: { $sum: 1 }
                        }
                    }
                ],
                as: 'watchlisted'
            }
        },
        {
            $addFields: {
                watchlisted: { $arrayElemAt: ['$watchlisted.exists', 0] }
            }
        }
    ]).then((response) => {
        const favorites = response.map((favorite) => {
            if (favorite.media.length < 1) return {
                favorite_id: favorite._id,
                media_id: favorite.media_id,
                type: favorite.type,
                dateAdded: favorite.date_added,
                title: "Untitled",
                description: "No description available",
                posterUrl: null,
                backdropUrl: null,
                watchlisted: favorite.watchlisted >= 1 ? true : false
            };
            return {
                favorite_id: favorite._id,
                media_id: favorite.media_id,
                type: favorite.type,
                dateAded: favorite.date_added,
                title: favorite.media[0].title,
                description: favorite.media[0].description,
                posterUrl: favorite.media[0].poster_url ? `${config.tmdbImageLarge}${favorite.media[0].poster_url}` : null,
                backdropUrl: favorite.media[0].backdrop_url ? `${config.tmdbImageLarge}${favorite.media[0].backdrop_url}` : null,
                watchlisted: favorite.watchlisted >= 1 ? true : false
            }
        });

        const last_id = response.length >= 100 ? response[response.length - 1].rank : null;
        sendResponse(res, { status: 200, message: "Favorites fetched", responsePayload: { lastRank: last_id, favorites } });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error fetching favorites" });
    });
};

const addFavorite = async (req: express.Request, res: express.Response) => {
    const media_id = req.query.media_id;
    const type = req.query.type;

    if (!media_id) return sendResponse(res, { status: 400, message: "Invalid media id" });
    if (!type || !isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });

    try {
        // Validate id and get the latest favorite saved
        const [mediaData, lastFavorite] = await Promise.all([
            findMediaById(media_id as string, type as string),
            favoritesSchema.findOne({ user_id: req.user!.id }, { rank: 1 }).sort({ rank: -1 }),
        ]);

        if (!mediaData) return sendResponse(res, { status: 404, message: "Media not found" });

        // Calculate the new rank for the new favorite.
        const newRank = lastFavorite ? getNextLexoRank(lastFavorite.rank) : getNextLexoRank();

        // Create a new favorite if it doesn't exist.
        const favorite = await favoritesSchema.findOneAndUpdate(
            { user_id: req.user!.id, media_id: mediaData.id.toString(), type: type  },
            { $setOnInsert: { date_added: new Date(), rank: newRank, type: type  } },
            { upsert: true, new: true }
        );

        sendResponse(res, { status: 200, message: "Favorite added", responsePayload: { id: favorite._id.toString() } });
    } catch (err) {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error adding favorite" });
    }
};

const removeFavorite = async (req: express.Request, res: express.Response) => {
    const favorite_id = req.query.media_id;
    const type = req.query.type;

    if (!favorite_id) return res.status(400).send({ status: "error", message: "Invalid media id" });
    if (!type || !isValidMediaType(type as string)) return sendResponse(res, { status: 400, message: "Invalid type" });

    // Remove favorite if it exists
    favoritesSchema.findOneAndDelete({ user_id: req.user?.id, media_id: favorite_id, type: type }).then(() => {
        sendResponse(res, { status: 200, message: "Favorite removed" });
    }).catch((err) => {
        console.error(err);
        sendResponse(res, { status: 500, message: "Error removing favorite" });
    });
};

const reorderFavorites = async (req: express.Request, res: express.Response) => {
    const { ref_id, target_id, position } = req.body;

    // ref_id: The id of the reference favorite
    // target_id: The id of the favorite moved to the new position
    // position: The position of the target favorite relative to the reference favorite
    const reorderSchema =  Joi.object({
        ref_id: Joi.string().required(),
        target_id: Joi.string().required(),
        position: Joi.string().required()
    });

    const { error } = reorderSchema.validate(req.body);
    if (error) return res.status(400).send({ status: "error", message: error.details[0].message });

    // Get the reference and target favorites
    try {
        let { reference, target } = await favoritesSchema.find({ user_id: req.user!.id, $or: [{ _id: ref_id }, { _id: target_id }] }).then(response => {
            const favoritesObj: { reference?: any, target?: any } = {};
            response.forEach(favorite => {
                if (favorite._id.toString() === ref_id) favoritesObj.reference = favorite
                else favoritesObj.target = favorite;
            });

            return favoritesObj;
        });

        if (!reference || !target) return res.status(404).send({ status: "error", message: "Favorites not found" });

        // Calculate the new rank for the reference favorite
        let newRank;
        switch (position) {
            case "before":
                // Find the previos favorite from the reference favorite
                const previousFavorite = await favoritesSchema.findOne().where("rank").lt(reference.rank).where("_id").ne(target.id).sort({ rank: -1 });
                if (!previousFavorite) {
                    newRank = getPreviousLexoRank(reference.rank);
                } else {
                    newRank = calculateLexoRank(previousFavorite?.rank, reference.rank);
                };
                break;
            case "after":
                // Find the next favorite from the reference favorite
                const nextFavorite = await favoritesSchema.findOne().where("rank").gt(reference.rank).where("_id").ne(target.id).sort({ rank: 1 });
                if (!nextFavorite) {
                    newRank = getNextLexoRank(reference.rank);
                } else {
                    newRank = calculateLexoRank(reference.rank, nextFavorite.rank);
                }
                break;
            default:
                res.status(400).send({ status: "error", message: "Invalid position" });
                return;
        }
        // Update the target favorite with the new rank
        await favoritesSchema.findByIdAndUpdate(target._id, { rank: newRank });
        res.status(200).send({ status: "success", message: "Favorites reordered" });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: "error", message: "Error reordering favorites" });
    }
};

export { getFavorites, addFavorite, removeFavorite, reorderFavorites };

import express from "express";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import { findMediaById } from "../../util/TMDB";
import Media from "../../Models/Media";
import saveMovie from "../../util/mediaHandler";
import { validateJsonBody } from "../../util/validateJson";
import { calculateLexoRank, getNextLexoRank, getPreviousLexoRank } from "../../util/lexorank";
import mongoose from "mongoose";

const getFavorites = async (req: express.Request, res: express.Response) => {
    const page = parseInt(req.query.page as string) || 1;

    const skip = isNaN(page) ? 0 : (page - 1) * 500;
    favoritesSchema.aggregate([
        {
            $match: {
                user_id: new mongoose.Types.ObjectId(req.user?.id) 
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
    ]).skip(skip).limit(500).sort({ rank: 1 }).then((response) => {
        const favorites = response.map((favorite) => {
            return {
                id: favorite._id,
                media_id: favorite.media_id,
                date_added: favorite.date_added,
                title: favorite.media.length >= 1 ? favorite.media[0].title : "Untitled",
                description: favorite.media.length >= 1 ? favorite.media[0].description : "No description available",
                poster_url: favorite.media.length >= 1 ? favorite.media[0].poster_url : "https://via.placeholder.com/300x450.png?text=No+Poster",
                release_date: favorite.media.length >= 1 ? favorite.media[0].release_date : "NA",
                runtime: favorite.media.length >= 1 ? favorite.media[0].runtime : 0
            }
        });

        res.status(200).send({ status: "success", favorites });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error fetching favorites" });
    });
};

const addFavorite = async (req: express.Request, res: express.Response) => {
    const media_id = req.query.media_id;

    if (!media_id) return res.status(400).send({ status: "error", message: "Invalid media id" });

    try {
        // Validate id and get the latest favorite saved
        const [mediaData, lastFavorite] = await Promise.all([
            findMediaById(media_id as string),
            favoritesSchema.findOne({ user_id: req.user!.id }).sort({ rank: -1 }),
        ]);

        if (!mediaData) return res.status(404).send({ status: "error", message: "Media not found" });

        // Calculate the new rank for the new favorite.
        const newRank = lastFavorite ? getNextLexoRank(lastFavorite.rank) : getNextLexoRank();

        // Create a new favorite if it doesn't exist.
        await favoritesSchema.updateOne(
            { user_id: req.user!.id, media_id: mediaData.id.toString() },
            { $setOnInsert: { date_added: new Date(), rank: newRank } },
            { upsert: true }
        );
        res.status(201).send({ status: "success", message: "Favorite added" });
        
        saveMovie(mediaData as Media);
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error adding favorite" });
    }
};

const removeFavorite = async (req: express.Request, res: express.Response) => {
    const favorite_id = req.query.id;

    if (!favorite_id) return res.status(400).send({ status: "error", message: "Invalid favorite id" });

    // Remove favorite if it exists
    favoritesSchema.findByIdAndDelete(favorite_id).then(() => {
        res.status(200).send({ status: "success", message: "Favorite removed" });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error removing favorite" });
    });
};

const reorderFavorites = async (req: express.Request, res: express.Response) => {
    const { ref_id, target_id, position } = req.body;

    const reorderSchema = {
        ref_id: { type: "string", required: true },
        target_id: { type: "string", required: true },
        position: { type: "string", required: true }
    };
    const validation = validateJsonBody(req.body, reorderSchema);
    if (!validation) return res.status(400).send({ status: "error", message: "Invalid request body" });

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
                console.log(previousFavorite?.rank, reference.rank, newRank);
                break;
            case "after":
                // Find the next favorite from the reference favorite
                const nextFavorite = await favoritesSchema.findOne().where("rank").gt(reference.rank).where("_id").ne(target.id).sort({ rank: 1 });
                if (!nextFavorite) {
                    newRank = getNextLexoRank(reference.rank);
                } else {
                    newRank = calculateLexoRank(reference.rank, nextFavorite.rank);
                }
                console.log(newRank);
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
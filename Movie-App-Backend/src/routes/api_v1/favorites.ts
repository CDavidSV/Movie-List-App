import express from "express";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import { findMediaById } from "../../util/TMDB";
import Media from "../../Models/Media";
import saveMovie from "../../util/mediaHandler";
import { validateJsonBody } from "../../util/validateJson";
import { calculateLexoRank, getNextLexoRank } from "../../util/lexorank";

const router = express.Router();

router.get("/", authenticateAccessToken, (req: express.Request, res: express.Response) => {
    const page = parseInt(req.query.page as string) || 1;

    const skip = isNaN(page) ? 0 : (page - 1) * 100;
    favoritesSchema.aggregate([
        {
            $lookup: {
                from: 'media',
                localField: 'media_id',
                foreignField: 'media_id',
                as: 'media'
            }
        }
    ]).skip(skip).limit(100).then((response) => {
        const favorites = response.map((favorite) => {
            return {
                id: favorite._id,
                media_id: favorite.media_id,
                date_added: favorite.date_added,
                title: favorite.media.length >= 1 ? favorite.media[0].title : "Untitled",
                description: favorite.media.length >= 1 ? favorite.media[0].description : "No description available",
                poster_url: favorite.media.length >= 1 ? favorite.media[0].poster_url : "https://via.placeholder.com/300x450.png?text=No+Poster",
                release_date: favorite.media.length >= 1 ? favorite.media[0].release_date : "NA",
                runtime: favorite.media.length >= 1 ? favorite.media[0].runtime : 0,
                next_favorite_id: favorite.next_favorite_id
            }
        });
        res.status(200).send({ status: "success", favorites });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error fetching favorites" });
    });
});

router.post("/add", authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const media_id = req.query.media_id;

    if (!media_id) return res.status(400).send({ status: "error", message: "Invalid media id" });

    try {
        // Validate id
        const mediaData = await findMediaById(media_id as string);

        if (!mediaData) {
            res.status(404).send({ status: "error", message: "Media not found" });
        }

        // Get the last favorite added based on rank.
        const lastFavorite = await favoritesSchema.findOne({ user_id: req.user!.id }).sort({ rank: -1 });

        // Calculate the new rank for the new favorite.
        const newRank = lastFavorite ? getNextLexoRank(lastFavorite.rank) : getNextLexoRank();

        // Create a new favorite if it doesn't exist.
        const media = new Media(mediaData);
        await favoritesSchema.findOneAndUpdate(
            { user_id: req.user!.id, media_id: media_id as string }, 
            { user_id: req.user!.id, media_id: media_id as string, date_added: new Date(), rank: newRank },
            { upsert: true, new: true }
        );
        res.status(201).send({ status: "success", message: "Favorite added" });
        
        saveMovie(media);
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error adding favorite" });
    }
});

router.delete("/remove", authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    const favorite_id = req.query.id;

    if (!favorite_id) return res.status(400).send({ status: "error", message: "Invalid favorite id" });

    // Remove favorite if it exists
    favoritesSchema.findByIdAndDelete(favorite_id).then(() => {
        res.status(200).send({ status: "success", message: "Favorite removed" });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ status: "error", message: "Error removing favorite" });
    });
});

router.post("/reorder", authenticateAccessToken, async (req: express.Request, res: express.Response) => {
    
});

export default router;
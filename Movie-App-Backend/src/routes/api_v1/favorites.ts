import express from "express";
import favoritesSchema from "../../scheemas/favoritesSchema";
import { authenticateAccessToken } from "../../middlewares/auth-controller";
import { findMediaById } from "../../util/TMDB";
import Media from "../../Models/Media";
import saveMovie from "../../util/mediaHandler";

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
                runtime: favorite.media.length >= 1 ? favorite.media[0].runtime : 0
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

        // Create a new favorite
        const userFavorites = await favoritesSchema.find({ user_id: req.user!.id });

        if (userFavorites.find((favorite) => favorite.media_id === media_id)) return res.status(201).send({ status: "success", message: "Favorite added" });
        const media = new Media(mediaData);

        const newRank = userFavorites.at(-1) ? userFavorites.at(-1)!.order + 1 : 0;
        await favoritesSchema.create({ user_id: req.user!.id, media_id: media_id as string, date_added: new Date(), order: newRank });
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

export default router;
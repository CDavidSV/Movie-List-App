import Media from "../Models/Media";
import mediaSchema from "../scheemas/mediaSchema"

const saveMovie = async (mediaData: Media) => {
    // Check if media already exists.
    try {
        const exists = await mediaSchema.exists({ media_id: mediaData.id });
        if (exists) return;

        await mediaSchema.create({
            media_id: mediaData.id,
            title: mediaData.title,
            type: "movie",
            description: mediaData.overview,
            release_date: mediaData.releaseDate,
            poster_url: mediaData.posterPath,
            backdrop_url: mediaData.backdropPath,
            runtime: mediaData.runtime
        });
        
    } catch (err) {
        console.error(err);
    }

}

export default saveMovie;
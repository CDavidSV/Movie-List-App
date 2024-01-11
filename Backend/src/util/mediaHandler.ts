import Movie from "../Models/Movie";
import Series from "../Models/Series";
import mediaSchema from "../scheemas/mediaSchema"

const saveMovie = async (mediaData: Movie | Series, type: string) => {
    // Check if media already exists.
    try {
        const exists = await mediaSchema.exists({ media_id: mediaData.id });
        if (exists) return;

        if (type === "movie") {
            mediaData = mediaData as Movie;
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
        } else if (type === "series") {
            mediaData = mediaData as Series;
            await mediaSchema.create({
                media_id: mediaData.id,
                title: mediaData.name,
                type: "series",
                description: mediaData.overview,
                release_date: mediaData.firstAirDate,
                poster_url: mediaData.posterPath,
                backdrop_url: mediaData.backdropPath,
                episode_count: mediaData.numberOfEpisodes,
                season_count: mediaData.numberOfSeasons
            });
        }

        
    } catch (err) {
        console.error(err);
    }

}

export default saveMovie;
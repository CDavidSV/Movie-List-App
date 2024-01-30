import Movie from "../Models/Movie";
import Series from "../Models/Series";
import mediaSchema from "../scheemas/mediaSchema"

const saveMovie = async (mediaData: Movie | Series, type: string) => {
    // Check if media already exists.
    try {
        if (type === "movie") {
            mediaData = mediaData as Movie;
            await mediaSchema.findOneAndUpdate({
                media_id: mediaData.id,
                type: "movie"
            }, {
                title: mediaData.title,
                description: mediaData.overview,
                release_date: mediaData.releaseDate,
                poster_url: mediaData.posterPath,
                backdrop_url: mediaData.backdropPath,
                runtime: mediaData.runtime
            }, { upsert: true, new: true });
        } else if (type === "series") {
            mediaData = mediaData as Series;
            await mediaSchema.findOneAndUpdate({
                media_id: mediaData.id,
                type: "series"
            }, {
                title: mediaData.name,
                description: mediaData.overview,
                release_date: mediaData.firstAirDate,
                poster_url: mediaData.posterPath,
                backdrop_url: mediaData.backdropPath,
                episode_count: mediaData.numberOfEpisodes,
                season_count: mediaData.numberOfSeasons
            }, { upsert: true, new: true });
        }
    } catch (err) {
        console.error(err);
    }
}

export default saveMovie;
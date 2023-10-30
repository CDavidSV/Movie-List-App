export default class Media {
    public adult: boolean;
    public backdropPath: string;
    public genreIds: number[];
    public id: number;
    public originalLanguage: string;
    public originalTitle: string;
    public overview: string;
    public popularity: number;
    public posterPath: string | null;
    public releaseDate: string;
    public title: string;
    public video: boolean;
    public voteAverage: number;
    public voteCount: number;
    public runtime: number;

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path;
        this.genreIds = mediajson.genre_ids;
        this.id = mediajson.id;
        this.originalLanguage = mediajson.original_language;
        this.originalTitle = mediajson.original_title;
        this.overview = mediajson.overview;
        this.popularity = mediajson.popularity;
        this.posterPath = mediajson.poster_path;
        this.releaseDate = mediajson.release_date;
        this.title = mediajson.title;
        this.video = mediajson.video;
        this.voteAverage = mediajson.vote_average;
        this.voteCount = mediajson.vote_count;
        this.runtime = mediajson.runtime;
    }
}

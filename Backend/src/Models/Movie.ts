import { CastMember, CrewMember, Genre, Image, Language, ProductionCompany, ProductionCountry, Recomendation, Video } from "./interfaces";
import config from "../config/config";

export default class Movie {
    public adult: boolean;
    public backdropPath: string | null;
    public budget: number;
    public genres: Genre[];
    public homepage: string;
    public id: number;
    public originalLanguage: string;
    public originalTitle: string;
    public overview: string;
    public popularity: number;
    public posterPath: string | null;
    public productionCompanies: ProductionCompany[];
    public productionCountries: ProductionCountry[];
    public releaseDate: string;
    public revenue: number;
    public spokenLanguages: Language[];
    public status: string;
    public tagline: string;
    public title: string;
    public video: boolean;
    public voteAverage: number;
    public voteCount: number;
    public runtime: number;
    public trailer?: Video | null;
    public castMembers?: CastMember[];
    public crewMembers?: CrewMember[];
    public recommendations?: Recomendation[];

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path;
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
        this.revenue = mediajson.revenue;
        this.status = mediajson.status;
        this.tagline = mediajson.tagline;
        this.budget = mediajson.budget;
        this.homepage = mediajson.homepage;

        this.genres = mediajson.genres.map((genre: any) => {
            return {
                id: genre.id,
                name: genre.name
            } as Genre;
        });
        this.productionCompanies = mediajson.production_companies.map((company: any) => {
            return {
                id: company.id,
                logoPath: company.logo_path,
                name: company.name,
                originCountry: company.origin_country
            } as ProductionCompany;
        });
        this.productionCountries = mediajson.production_countries.map((country: any) => {
            return {
                iso31661: country.iso_3166_1,
                name: country.name
            } as ProductionCountry;
        });
        this.spokenLanguages = mediajson.spoken_languages.map((language: any) => {
            return {
                english_name: language.english_name,
                iso_639_1: language.iso_639_1,
                name: language.name
            } as Language;
        });
        this.trailer = mediajson.videos && mediajson.videos.results.find((video: any) => video.type === 'Trailer') || null;

        this.crewMembers = mediajson.credits && mediajson.credits.crew.map((member: any) => {
            return {
                adult: member.adult,
                gender: member.gender,
                id: member.id,
                knownForDepartment: member.known_for_department,
                name: member.name,
                originalName: member.original_name,
                popularity: member.popularity,
                profilePath: member.profile_path ? `${config.tmdbImageLarge}${member.profile_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
                creditId: member.credit_id,
                department: member.department,
                job: member.job
            } as CrewMember;
        }).reduce((acc: CrewMember[], cur: CrewMember) => {
            if (acc.find((member: CrewMember) => member.department === cur.department)) {
                return acc;
            } else {
                return [...acc, cur];
            }
        }, []);
        this.castMembers = mediajson.credits && mediajson.credits.cast.slice(0, 10).map((member: any) => {
            return {
                adult: member.adult,
                gender: member.gender,
                id: member.id,
                knownForDepartment: member.known_for_department,
                name: member.name,
                originalName: member.original_name,
                popularity: member.popularity,
                profilePath: member.profile_path ? `${config.tmdbImageLarge}${member.profile_path}` : "https://via.placeholder.com/300x450.png?text=No+Image",
                castId: member.cast_id,
                character: member.character,
                creditId: member.credit_id,
                order: member.order
            } as CastMember;
        });

        this.recommendations = mediajson.recommendations && mediajson.recommendations.results.slice(0, 30).map((media: any) => {
            return {
                id: media.id,
                title: media.title,
                description: media.overview,
                posterUrl: media.poster_path ? `${config.tmdbImageLarge}${media.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster",
                backdropUrl: media.backdrop_path ? `${config.tmdbImageOriginal}${media.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop",
                type: media.media_type === "tv" ? "series" : "movie",
                releaseDate: media.release_date || media.first_air_date,
                voteAverage: media.vote_average,
                votes: media.vote_count
            } as Recomendation;
        });
    }
}
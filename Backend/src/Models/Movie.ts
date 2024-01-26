import { CastMember, CrewMember, Genre, Image, Language, ProductionCompany, ProductionCountry, Video } from "./interfaces";
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
    public trailer: Video | null;
    public backdropImages: Image[];
    public castMembers: CastMember[];
    public crewMembers: CrewMember[];

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path ? `${config.tmbdImageOriginalUrl}${mediajson.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop";
        this.id = mediajson.id;
        this.originalLanguage = mediajson.original_language;
        this.originalTitle = mediajson.original_title;
        this.overview = mediajson.overview;
        this.popularity = mediajson.popularity;
        this.posterPath = mediajson.poster_path ? `${config.tmbdImageBaseUrl}${mediajson.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster";
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
        this.trailer = mediajson.videos.results.find((video: any) => video.type === 'Trailer') || null;
        this.backdropImages = mediajson.images.backdrops.map((image: any) => {
            return {
                aspectRatio: image.aspect_ratio,
                filePath: image.file_path,
                height: image.height,
                id: image.id,
                iso6391: image.iso_639_1,
                voteAverage: image.vote_average,
                voteCount: image.vote_count,
                width: image.width
            } as Image;
        });
        this.crewMembers = mediajson.credits.crew.map((memeber: any) => {
            return {
                adult: memeber.adult,
                gender: memeber.gender,
                id: memeber.id,
                knownForDepartment: memeber.known_for_department,
                name: memeber.name,
                originalName: memeber.original_name,
                popularity: memeber.popularity,
                profilePath: memeber.profile_path,
                creditId: memeber.credit_id,
                department: memeber.department,
                job: memeber.job
            } as CrewMember;
        });
        this.castMembers = mediajson.credits.cast.map((member: any) => {
            return {
                adult: member.adult,
                gender: member.gender,
                id: member.id,
                knownForDepartment: member.known_for_department,
                name: member.name,
                originalName: member.original_name,
                popularity: member.popularity,
                profilePath: member.profile_path,
                castId: member.cast_id,
                character: member.character,
                creditId: member.credit_id,
                order: member.order
            } as CastMember;
        });
    }
}
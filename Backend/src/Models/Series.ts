import config from "../config/config";
import { Author, Genre, Episode, Network, ProductionCompany, ProductionCountry, Season, Language, Image, Video, CastMember, CrewMember } from "./interfaces";

export default class Series {
    public adult: boolean;
    public backdropPath: string | null;
    public createdBy: Author[];
    public episodeRunTime: number[];
    public firstAirDate: string;
    public genres: Genre[];
    public homepage: string;
    public id: number;
    public inProduction: boolean;
    public languages: string[];
    public lastEpisodeToAir: Episode;
    public name: string;
    public nextEpisodeToAir: string | null;
    public networks: Network[];
    public numberOfEpisodes: number;
    public numberOfSeasons: number;
    public originCountry: string[];
    public originalLanguage: string;
    public originalName: string;
    public overview: string;
    public popularity: number;
    public posterPath: string | null;
    public productionCompanies: ProductionCompany[];
    public productionCountries: ProductionCountry[];
    public seasons: Season[];
    public spokenLanguages: Language[];
    public status: string;
    public tagline: string;
    public type: string;
    public voteAverage: number;
    public voteCount: number;
    public backdropImages: Image[];
    public castMembers: CastMember[];
    public crewMembers: CrewMember[];
    public trailer: Video | null;

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path ? `${config.tmbdImageOriginalUrl}${mediajson.backdrop_path}` : "https://via.placeholder.com/1280x720.png?text=No+Backdrop";
        this.episodeRunTime = mediajson.episode_run_time;
        this.firstAirDate = mediajson.first_air_date;
        this.homepage = mediajson.homepage;
        this.id = mediajson.id;
        this.inProduction = mediajson.in_production;
        this.lastEpisodeToAir = {
            id: mediajson.last_episode_to_air.id,
            name: mediajson.last_episode_to_air.name,
            overview: mediajson.last_episode_to_air.overview,
            voteAverage: mediajson.last_episode_to_air.vote_average,
            voteCount: mediajson.last_episode_to_air.vote_count,
            airDate: mediajson.last_episode_to_air.air_date,
            episodeNumber: mediajson.last_episode_to_air.episode_number,
            productionCode: mediajson.last_episode_to_air.production_code,
            runtime: mediajson.last_episode_to_air.runtime,
            seasonNumber: mediajson.last_episode_to_air.season_number,
            showId: mediajson.last_episode_to_air.show_id,
            stillPath: mediajson.last_episode_to_air.still_path
        } as Episode;
        this.name = mediajson.name;
        this.nextEpisodeToAir = mediajson.next_episode_to_air;
        this.numberOfEpisodes = mediajson.number_of_episodes;
        this.numberOfSeasons = mediajson.number_of_seasons;
        this.originCountry = mediajson.origin_country;
        this.originalLanguage = mediajson.original_language;
        this.originalName = mediajson.original_name;
        this.overview = mediajson.overview;
        this.popularity = mediajson.popularity;
        this.posterPath = mediajson.poster_path ? `${config.tmbdImageBaseUrl}${mediajson.poster_path}` : "https://via.placeholder.com/300x450.png?text=No+Poster";
        this.status = mediajson.status;
        this.tagline = mediajson.tagline;
        this.type = mediajson.type;
        this.voteAverage = mediajson.vote_average;
        this.voteCount = mediajson.vote_count;
        
        this.createdBy = mediajson.created_by.map((author: any) => {
            return {
                id: author.id,
                creditId: author.credit_id,
                name: author.name,
                gender: author.gender,
                profilePath: author.profile_path
            } as Author;
        });
        this.genres = mediajson.genres.map((genre: any) => {
            return {
                id: genre.id,
                name: genre.name
            } as Genre;
        });
        this.networks = mediajson.networks.map((network: any) => {
            return {
                id: network.id,
                logoPath: network.logo_path,
                name: network.name,
                originCountry: network.origin_country
            } as Network;
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
        this.seasons = mediajson.seasons.map((season: any) => {
            return {
                airDate: season.air_date,
                episodeCount: season.episode_count,
                id: season.id,
                name: season.name,
                overview: season.overview,
                posterPath: season.poster_path,
                seasonNumber: season.season_number,
                voteAverage: season.vote_average
            } as Season;
        });
        this.spokenLanguages = mediajson.spoken_languages.map((language: any) => {
            return {
                english_name: language.english_name,
                iso_639_1: language.iso_639_1,
                name: language.name
            } as Language;
        });
        this.languages = mediajson.languages.map((language: string) => {
            return language;
        });
        this.backdropImages = mediajson.images.backdrops.map((image: any) => {
            return {
                aspectRatio: image.aspect_ratio,
                filePath: image.file_path,
                height: image.height,
                iso6391: image.iso_639_1,
                voteAverage: image.vote_average,
                voteCount: image.vote_count,
                width: image.width
            } as Image;
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
                order: member.ordet
            } as CastMember;
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
            }
        });
        this.trailer = mediajson.videos.results.find((video: any) => video.type === 'Trailer') || null;
    }
}

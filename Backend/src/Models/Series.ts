import config from "../config/config";
import { Author, Genre, Episode, Network, ProductionCompany, ProductionCountry, Season, Language, Video, CastMember, CrewMember, Recomendation } from "./interfaces";

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
    public lastEpisodeToAir: Episode | null;
    public name: string;
    public nextEpisodeToAir: Episode | null;
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
    public castMembers?: CastMember[];
    public crewMembers?: CrewMember[];
    public trailer?: Video | null;
    public recommendations?: Recomendation[];

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path;
        this.episodeRunTime = mediajson.episode_run_time;
        this.firstAirDate = mediajson.first_air_date;
        this.homepage = mediajson.homepage;
        this.id = mediajson.id;
        this.inProduction = mediajson.in_production;
        this.name = mediajson.name;
        this.numberOfEpisodes = mediajson.number_of_episodes;
        this.numberOfSeasons = mediajson.number_of_seasons;
        this.originCountry = mediajson.origin_country;
        this.originalLanguage = mediajson.original_language;
        this.originalName = mediajson.original_name;
        this.overview = mediajson.overview;
        this.popularity = mediajson.popularity;
        this.posterPath = mediajson.poster_path;
        this.status = mediajson.status;
        this.tagline = mediajson.tagline;
        this.type = mediajson.type;
        this.voteAverage = mediajson.vote_average;
        this.voteCount = mediajson.vote_count;


        this.lastEpisodeToAir = mediajson.last_episode_to_air ? {
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
        } as Episode : null;
        this.nextEpisodeToAir = mediajson.next_episode_to_air ? {
            id: mediajson.next_episode_to_air.id,
            name: mediajson.next_episode_to_air.name,
            overview: mediajson.next_episode_to_air.overview,
            voteAverage: mediajson.next_episode_to_air.vote_average,
            voteCount: mediajson.next_episode_to_air.vote_count,
            airDate: mediajson.next_episode_to_air.air_date,
            episodeNumber: mediajson.next_episode_to_air.episode_number,
            productionCode: mediajson.next_episode_to_air.production_code,
            runtime: mediajson.next_episode_to_air.runtime,
            seasonNumber: mediajson.next_episode_to_air.season_number,
            showId: mediajson.next_episode_to_air.show_id,
            stillPath: mediajson.next_episode_to_air.still_path
        } as Episode : null;

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
        this.castMembers = mediajson.credits && mediajson.credits.cast.slice(0, 10).map((member: any) => {
            return {
                adult: member.adult,
                gender: member.gender,
                id: member.id,
                knownForDepartment: member.known_for_department,
                name: member.name,
                originalName: member.original_name,
                popularity: member.popularity,
                profilePath: member.profile_path ? `${config.tmdbImageLarge}${member.profile_path}` : null,
                castId: member.cast_id,
                character: member.character,
                creditId: member.credit_id,
                order: member.ordet
            } as CastMember;
        });
        this.crewMembers = mediajson.credits && mediajson.credits.crew.map((member: any) => {
            return {
                adult: member.adult,
                gender: member.gender,
                id: member.id,
                knownForDepartment: member.known_for_department,
                name: member.name,
                originalName: member.original_name,
                popularity: member.popularity,
                profilePath: member.profile_path ? `${config.tmdbImageLarge}${member.profile_path}` : null,
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
        this.trailer = mediajson.videos && mediajson.videos.results.find((video: any) => video.type === 'Trailer') || null;

        this.recommendations = mediajson.recommendations && mediajson.recommendations.results.slice(0, 30).map((media: any) => {
            return {
                id: media.id,
                title: media.name,
                description: media.overview,
                posterUrl: media.poster_path ? `${config.tmdbImageLarge}${media.poster_path}` : null,
                backdropUrl: media.backdrop_path ? `${config.tmdbImageOriginal}${media.backdrop_path}` : null,
                type: media.media_type === "tv" ? "series" : "movie",
                releaseDate: media.first_air_date || media.release_date,
                voteAverage: media.vote_average,
                votes: media.vote_count
            } as Recomendation;
        });
    }
}

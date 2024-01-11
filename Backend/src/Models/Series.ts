interface Author {
    id: number;
    creditId: string;
    name: string;
    gender: number;
    profilePath: string | null;
}

interface Genre {
    id: number;
    name: string;
}

interface Episode {
    id: number;
    name: string;
    overview: string;
    voteAverage: number;
    voteCount: number;
    airDate: string;
    episodeNumber: number;
    productionCode: string;
    runtime: number;
    seasonNumber: number;
    showId: number;
    stillPath: string | null;
}

interface Network {
    id: number;
    logoPath: string | null;
    name: string;
    originCountry: string;
}

interface ProductionCompany {
    id: number;
    logoPath: string | null;
    name: string;
    originCountry: string;
}

interface ProductionCountry {
    iso31661: string;
    name: string;
}

interface Season {
    airDate: string;
    episodeCount: number;
    id: number;
    name: string;
    overview: string;
    posterPath: string | null;
    seasonNumber: number;
    voteAverage: number;
}

interface Language {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export default class Series {
    adult: boolean;
    backdropPath: string | null;
    createdBy: Author[];
    episodeRunTime: number[];
    firstAirDate: string;
    genres: Genre[];
    homepage: string;
    id: number;
    inProduction: boolean;
    languages: string[];
    lastEpisodeToAir: Episode;
    name: string;
    nextEpisodeToAir: string | null;
    networks: Network[];
    numberOfEpisodes: number;
    numberOfSeasons: number;
    originCountry: string[];
    originalLanguage: string;
    originalName: string;
    overview: string;
    popularity: number;
    posterPath: string | null;
    productionCompanies: ProductionCompany[];
    productionCountries: ProductionCountry[];
    seasons: Season[];
    spokenLanguages: Language[];
    status: string;
    tagline: string;
    type: string;
    voteAverage: number;
    voteCount: number;

    constructor(mediajson: any) {
        this.adult = mediajson.adult;
        this.backdropPath = mediajson.backdrop_path;
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
        this.posterPath = mediajson.poster_path;
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
    }
}

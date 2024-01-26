interface User {
    id: string;
    sessionId: string;
}

interface APIResponse<T> {
    status: string;
    message: string;
    responseData?: T;
}

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

interface Image {
    id: number;
    aspectRatio: number;
    height: number;
    iso6391: string | null;
    filePath: string;
    voteAverage: number;
    voteCount: number;
    width: number;
}

interface Video {
    id: string;
    iso6391: string;
    iso31661: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    publishedAt: string;
}

interface CastMember {
    adult: boolean;
    gender: number;
    id: number;
    knownForDepartment: string;
    name: string;
    originalName: string;
    popularity: number;
    profilePath: string | null;
    castId: number;
    character: string;
    creditId: string;
    order: number;
}

interface CrewMember {
    adult: boolean;
    gender: number;
    id: number;
    knownForDepartment: string;
    name: string;
    originalName: string;
    popularity: number;
    profilePath: string | null;
    creditId: string;
    department: string;
    job: string;
}

export { 
    User,
    APIResponse,
    Author,
    Genre,
    Episode,
    Network,
    ProductionCompany,
    ProductionCountry,
    Season,
    Language,
    Image,
    Video,
    CastMember,
    CrewMember
};
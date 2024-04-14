interface FilmCardData {
    id: number;
    type: string;
    posterUrl: string;
    title: string;
    releaseDate: string;
    voteAverage?: number;
    votes?: number;
    description: string;
}

interface FilmCardProps {
    filmData: FilmCardData;
    inWatchlist: boolean;
    inFavorites: boolean;
    searchResult: boolean;
}

interface FilmSliderProps {
    filmArr: FilmCardProps[];
    title?: string;
}

interface PersonCardProps {
    id: number;
    name: string;
    character: string;
    profileUrl: string;
}

interface ProgressProps {
    progressState: { progress: number, totalProgress: number },
    mediaId: string,
    type: string,
    updateProgress: (newProgress: number) => void,
}

interface SessionData {
    email: string;
    username: string;
    expiresIn: number;
    setAt: number;
    profilePictureUrl?: string;
    profileBannerUrl?: string;
}

interface SearchResultItem {
    id: string;
    name: string;
    type: string;
    link: string;
    date_updated: Date;
}

interface LoginData {
    username: string;
    password: string;
}

interface SignUpData {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

interface SignUpError {
    usernameError: string;
    emailError: string;
    passwordError: string;
}

interface WatchlistItemProps {
    index: number,
    title: string,
    progress: number,
    total_progress: number,
    backgrop: string,
    poster: string,
    favorited: boolean,
    status: string,
    media_id: number,
    id: string,
    type: string
    removeItemFromWatchlist: (id: string, type: string, index: number) => void
}

interface UploadImageProps {
    aspectRatio: number;
    height: string;
    maxImageSizeInMb: number;
    onCrop: (croppedImage: string) => void;
}

interface SliderItem {
    backdropUrl: string;
    description: string;
    genres: string[];
    id: number;
    logoUrl: string;
    posterUrl: string;
    releaseDate: string;
    title: string;
    type: string;
    voteAverage: number;
    votes: number;
    inWatchlist?: boolean;
    inFavorites?: boolean;
}

interface ToastProps {
    message: string;
    onClose: () => void;
    type: "success" | "error" | "warning" | "info";
}
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
    onDelete?: (filmData: FilmCardData) => void;
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
    matureContent: boolean;
    publicWatchlist: boolean;
    publicFavorites: boolean;
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
    backdrop: string,
    poster: string,
    favorited: boolean,
    status: string,
    media_id: number,
    id: string,
    type: string
    removeItemFromWatchlist: (id: string, type: string, index: number) => void
}

interface UserWatchlistItemProps {
    title: string,
    progress: number,
    totalProgress: number,
    backdrop: string,
    poster: string,
    status: string,
    mediaId: number,
    type: string
}

interface UserFavoriteItemProps {
    mediaId: string;
    title: string;
    type: string;
    dateAdded: string;
    description: string;
    poster: string;
    backdrop: string;
    index: number;
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

interface HomeData {
    carouselData: SliderItem[];
    popularMovies: FilmCardProps[];
    upcoming: FilmCardProps[];
    topRated: FilmCardProps[];
    watchlist: FilmCardProps[];
}

interface UserPageData {
    id: string;
    username: string;
    profilePictureUrl: string;
    profileBannerUrl: string;
    publicWatchlist: boolean;
    publicFavorites: boolean;
}

interface Tab {
    id: string;
    title: string;
    tab: React.ReactNode;
}

interface TabHandlerProps {
    tabs: Tab[];
    defaultTab?: string;
    tab?: string;
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
    onTabChange?: (tab: Tab) => void;
}

interface UserSearchResult {
    id: string;
    username: string;
    profilePictureUrl?: string;
    joinedAt?: Date;
}
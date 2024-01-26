import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mml_api } from "../axios/mml_api_intances";
import "./media.css";
import { calculateMovieRuntime, setWatchlist } from "../helpers/util.helpers";
import WatchlistProgress from "../components/watchlist-progress-component/watchlist-progress";
import FavoriteButton from "../components/favorite-button-component/favorite-button";

// TODO : FIX THIS MONSTROSITY
function WatchlistStatusHandler(props: { mediaId: string, type: string, watchlisted: boolean, progress: number, totalProgress: number, status: number }) {
    const [watchlistStatus, setWatchlistStatus] = useState<number>(props.status); // 0 = watching, 1 = plan to watch, 2 = finished
    const [itemProgress, setItemProgress] = useState<{ progress: number, totalProgress: number }>({ progress: props.progress, totalProgress: props.totalProgress });
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(props.watchlisted);

    const handleAddToWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsWatchlisted(true);

        setWatchlist(props.mediaId, props.type, 1, 0).then(() => {
            setIsWatchlisted(true);
        }).catch(() => {
            setIsWatchlisted(false);
        });
    }

    const handleStatusSelect = (e: React.ChangeEvent) => {
        e.preventDefault();
        let target = e.target as HTMLSelectElement;
        let status = parseInt(target.value);
        const prevStatus = watchlistStatus;
        setWatchlistStatus(status);

        let newProgress = props.type === 'movie' ? 1 : props.totalProgress;

        setWatchlist(props.mediaId, props.type, status, newProgress).then(() => {
            if (status === 2) {
                setItemProgress({ ...itemProgress, progress: props.totalProgress });
            }
        }).catch(() => {
            setWatchlistStatus(prevStatus);
        });
    }

    const updateProgress = (amount: number) => {
        const newProgress = itemProgress.progress + amount;
        const currentProgress = itemProgress.progress;

        let status = 0;
        if (newProgress === itemProgress.totalProgress) {
            status = 2;
        };

        setItemProgress({ ...itemProgress, progress: newProgress });
        setWatchlist(props.mediaId, props.type, status, newProgress).then(() => {
            setWatchlistStatus(status);
        }).catch(() => {
            setItemProgress({ ...itemProgress, progress: currentProgress });
        });
    }

    return (
        <>  
            {isWatchlisted ?
                <>
                    <select name="watchlist-status" value={watchlistStatus} onChange={handleStatusSelect}>
                        <option value="0">Watching</option>
                        <option value="1">Plan to Watch</option>
                        <option value="2">Finished</option>
                    </select>
                    <WatchlistProgress 
                        progressState={itemProgress}
                        mediaId={props.mediaId}
                        type={props.type}
                        updateProgress={updateProgress}/>
                </>    
                :
                <button className="primary-button" onClick={handleAddToWatchlist}>Add to Watchlist</button>
            }
        </>
    );
}

export default function Media() {
    let { type, id } = useParams<{ type: string, id: string }>();
    const [mediaData, setMediaData] = useState<any>(null);
    const [facts, setFacts] = useState<string>("");

    if (!type || (type !== 'movie' && type !== 'series')) window.location.href = '/';

    useEffect(() => {
        // Fetch media data based on type
        mml_api.get(`/api/v1/media/fetch-by-id?media_id=${id}&type=${type}&include=user_personal_lists`).then((response) => {
            console.log(response.data.responseData);
            const mediaData = response.data.responseData;
            setMediaData(response.data.responseData);

            let genres = "";
            let facts = "";
            mediaData.genres.map((genre: any) => genres += ", " + genre.name);
            facts = `${mediaData.releaseDate || mediaData.firstAirDate} • ${genres.substring(2)}`;

            if (type === 'movie') facts += ` • ${calculateMovieRuntime(mediaData.runtime)}`;
            setFacts(facts);
        });
    }, []);

    return (
        <div className="content">
            {mediaData && 
                <div className="film-backdrop-container" style={{backgroundImage: `url(${mediaData.backdropPath})`}}>
                    <div className="film-info-content">
                        <div className="film-poster-container">
                            <img className="film-poster" src={mediaData.posterPath} alt={mediaData.title || mediaData.name}/>
                        </div>
                        <div className="film-overview-info">
                            <h2 className="film-title">{mediaData.name || mediaData.title}</h2>
                            <div className="relevant-info">
                                <p>{facts}</p>
                            </div>
                            {type === 'series' &&
                                <div className="series-info">
                                    <p>{mediaData.numberOfSeasons} Seasons</p>
                                    <p>{mediaData.numberOfEpisodes} Episodes</p>
                                </div>
                            }
                            <div className="film-interaction">
                                <FavoriteButton size="medium" mediaId={mediaData.id} type={type as string} isFavorite={mediaData.favorites}/>
                                <WatchlistStatusHandler 
                                    mediaId={mediaData.id}
                                    type={type as string}
                                    progress={mediaData.watchlist ? mediaData.watchlist.progress : 0}
                                    totalProgress={type === 'movie' ? 1 : mediaData.numberOfEpisodes}
                                    watchlisted={mediaData.watchlist}
                                    status={mediaData.watchlist && mediaData.watchlist.status}/>
                            </div>
                            <h2 className="description-title">Description</h2>
                            <p>{mediaData.overview}</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
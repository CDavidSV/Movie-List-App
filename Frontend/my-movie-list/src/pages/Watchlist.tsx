import { useEffect, useState } from "react";
import { mml_api_protected } from "../axios/mml_api_intances";
import NotFound from "../components/not-found-component/not-found";
import { setWatchlist, removeFromWatchlist } from "../helpers/util.helpers";
import "./watchlist.css";
import { Link } from "react-router-dom";
import WatchlistProgress from "../components/watchlist-progress-component/watchlist-progress";
import FavoriteButton from "../components/favorite-button-component/favorite-button";

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

function WatchlistItem(props: WatchlistItemProps) {
    const [status, setStatus] = useState<string>("plan-to-watch");
    const [itemProgress, setItemProgress] = useState<{ progress: number, totalProgress: number }>({ progress: props.progress, totalProgress: props.total_progress });

    useEffect(() => {
        switch (props.status) {
            case "watching":
                setStatus("watching");
                break;
            case "Finished":
                setStatus("finished");
                break;
            case "Plan to Watch":
                setStatus("plan-to-watch");
                break;
            default:
                setStatus("watching");
                break;
        }
    }, []);

    const updateProgress = (amount: number) => {
        setStatus("watching");
        const oldProgress = itemProgress.progress;

        let status = 0;
        if (itemProgress.progress + amount === itemProgress.totalProgress) {
            setStatus("finished");
            status = 2;
        }

        setItemProgress({ progress: itemProgress.progress + amount, totalProgress: itemProgress.totalProgress });
        setWatchlist(props.media_id.toString(), props.type, status, itemProgress.progress + amount).catch(() => {
            setItemProgress({ progress: oldProgress, totalProgress: itemProgress.totalProgress });
        });
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        props.removeItemFromWatchlist(props.id, props.type, props.index);
    }

    return (
        <Link to={`/media/${props.type}/${props.id}`} className={`watchlist-item ${status}`}>
            <picture className="">
                <source media="(max-width: 768px)" srcSet={props.poster} />
                <img src={props.backgrop} alt={props.title}/>
            </picture>
            <div className="info">
                <h3>{props.title}</h3>
                <FavoriteButton size="small" mediaId={props.id} type={props.type} isFavorite={props.favorited}/>
            </div>
            <div className="actions desktop">
                <WatchlistProgress
                    mediaId={props.id}
                    type={props.type}
                    progressState={itemProgress}
                    updateProgress={updateProgress}
                    />
                <span className="watchlist-btn trash-icon material-icons" onClick={handleRemove}>delete_outline</span>
            </div>
            <div className="actions mobile">
                <span className="watchlist-btn trash-icon material-icons">edit</span>
            </div>
        </Link>
    );
}

function Tab({ title, isActive, onClick }: { title: string, isActive: boolean, onClick: React.MouseEventHandler<HTMLDivElement>}) {
    return (
        <div onClick={onClick} className={isActive ? "watchlist-section-tag active" : "watchlist-section-tag"}>
            <h3>{title}</h3>
        </div>
    );
}

const tabsConfig = [
    { title: 'All', status: 3 },
    { title: 'Plan to watch', status: 1 },
    { title: 'Watching', status: 0 },
    { title: 'Finished', status: 2 },
];

export default function Watchlist() {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [watchlist, setWatchlist] = useState<any[]>([]);

    useEffect(() => {
        if (selectedTab > tabsConfig.length - 1) return;

        setLoading(true);
        const status = tabsConfig[selectedTab].status;
        mml_api_protected.get(`api/v1/watchlist?page=1&status=${status}`).then((response) => {
            setLoading(false);
            setWatchlist(response.data.responseData.watchlist);
        });

    }, [selectedTab]);

    const handleTabChange = (i: number) => {
        if (i === selectedTab) return;

        setSelectedTab(i);
    }

    const removeItemFromWatchlist = (id: string, type: string, index: number) => {
        removeFromWatchlist(id, type).then(() => {
            watchlist.splice(index, 1);
            setWatchlist([...watchlist]);
        });
    }

    return (
        <div className="content">
            <div className="page-title-container">
                <span style={{fontSize: "2rem"}} className="material-icons icon">bookmark_border</span>
                <h1>Watchlist</h1>
            </div>
            <div className="content-wrapper">
                <div className="watchlist-section-header">
                    {tabsConfig.map((tab, index) => (
                        <Tab key={index} title={tab.title} isActive={selectedTab === index} onClick={() => handleTabChange(index)}/>
                    ))}
                </div>
                <div className="watchlist-container">
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                    {watchlist.length < 1 && !loading &&
                        <NotFound message="Find something you like and add it to your watchlist" />}
                    {watchlist.length > 0 && !loading &&
                        <div>
                            {watchlist.map((media: any, index) => (
                                <WatchlistItem
                                    key={media.id}
                                    index={index}
                                    title={media.title}
                                    progress={media.progress} 
                                    total_progress={media.total_progress} 
                                    backgrop={media.backdrop_url}
                                    poster={media.poster_url}
                                    favorited={media.favorited}
                                    status={media.status}
                                    media_id={media.media_id}
                                    id={media.media_id.toString()}
                                    type={media.type}
                                    removeItemFromWatchlist={removeItemFromWatchlist}/>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
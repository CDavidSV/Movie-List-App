import { useContext, useEffect, useState } from "react";
import NotFound from "../../components/not-found-component/not-found";
import { Link } from "react-router-dom";
import WatchlistProgress from "../../components/watchlist-progress-component/watchlist-progress";
import FavoriteButton from "../../components/favorite-button-component/favorite-button";
import Modal from "../../components/modal-component/modal";
import axios, { CancelTokenSource } from "axios";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { Bookmark, Trash2, Pencil } from "lucide-react";
import "./watchlist.css";

function WatchlistItem(props: WatchlistItemProps) {
    const [status, setStatus] = useState<string>("plan-to-watch");
    const [itemProgress, setItemProgress] = useState<{ progress: number, totalProgress: number }>({ progress: props.progress, totalProgress: props.total_progress });
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const { setWatchlist } = useContext(GlobalContext);
    const [editProgressModal, setEditProgressModal] = useState<boolean>(false);

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

    const updateProgress = (newProgress: number) => {
        setStatus("watching");

        let status = 0;
        if (newProgress === itemProgress.totalProgress) {
            setStatus("finished");
            status = 2;
        }

        setItemProgress({ progress: newProgress, totalProgress: itemProgress.totalProgress });
        setWatchlist(props.media_id.toString(), props.type, status, newProgress);
    }

    const handleRemove = () => {
        props.removeItemFromWatchlist(props.id, props.type, props.index);
        setDeleteModalOpen(false);
    }

    return (
        <div className={`watchlist-item ${status}`}>
            <Modal open={deleteModalOpen} onClose={() => {setDeleteModalOpen(false)}}>
                <div>
                    <h3 style={{textAlign: "center"}}>Delete {props.title} from your watchlist?</h3>
                    <div className="modal-buttons">
                        <button className="button" onClick={() => setDeleteModalOpen(false)}>No</button>
                        <button className="button primary" onClick={handleRemove}>Yes</button>
                    </div>
                </div>
            </Modal>
            <Modal open={editProgressModal} onClose={() => setEditProgressModal(false)}>
                <h3 style={{textAlign: "center", margin: 0}}>Edit your watchlist progress</h3>
                <p style={{ margin: 0, opacity: 0.5 }}>Edit your progress in "{props.title}"</p>
                <div className="flex-container" style={{ justifyContent: "center" }}>
                    <WatchlistProgress
                        mediaId={props.id}
                        type={props.type}
                        progressState={itemProgress}
                        updateProgress={updateProgress}
                    />
                </div>
            </Modal>
            <Link to={`/media/${props.type}/${props.id}`}>
                <picture>
                    <source media="(max-width: 767px)" srcSet={props.poster} />
                    <img src={props.backdrop} alt={props.title} loading="lazy" />
                </picture>
                <div className="info">
                    <h3>{props.title}</h3>
                    <FavoriteButton size={24} mediaId={props.id} type={props.type} isFavorite={props.favorited}/>
                </div>
            </Link>
            <div className="actions desktop">
                <WatchlistProgress
                    mediaId={props.id}
                    type={props.type}
                    progressState={itemProgress}
                    updateProgress={updateProgress}
                />
            </div>
            <div className="actions mobile">
                <span className="watchlist-btn trash-icon" onClick={() => setEditProgressModal(true)}>
                    <Pencil size={22} />
                </span>
            </div>
            <span className="watchlist-btn trash-icon" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 size={22}/>
            </span>
        </div>
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
    const [source, setSource] = useState<CancelTokenSource | null>(null);
    const [cursor, setCursor] = useState<number | null>(null);
    const toast = useContext(ToastContext);
    const { removeFromWatchlist, mml_api_protected } = useContext(GlobalContext);

    useInfiniteScroll(() => getNextPage(), loading, !cursor);

    useEffect(() => {
        document.title = "Watchlist | My Movie List";
        if (selectedTab > tabsConfig.length - 1) return;

        if (source) source.cancel();

        // Create a new CancelToken
        const cancelToken = axios.CancelToken;
        const newSource = cancelToken.source();
        setSource(newSource);

        setLoading(true);
        setWatchlist([]);
        const status = tabsConfig[selectedTab].status;
        mml_api_protected.get(`api/v1/watchlist?status=${status}`, {
            cancelToken: newSource.token
        }).then((response) => {
            setLoading(false);
            setWatchlist(response.data.responseData.watchlist);

            if (response.data.responseData.cursor) setCursor(response.data.responseData.cursor);
        }).catch((err) => {
            if (err.code === "ERR_CANCELED") return;

            console.error(err);
            toast.open("Error loading watchlist", "error");
            setLoading(false);
        });

    }, [selectedTab]);

    const getNextPage = () => {
        if (!cursor) return;
        setLoading(true);

        mml_api_protected.get(`api/v1/watchlist?status=${tabsConfig[selectedTab].status}&cursor=${cursor}`).then((response) => {
            setLoading(false);
            setWatchlist([...watchlist, ...response.data.responseData.watchlist]);
            if (response.data.responseData.cursor) {
                setCursor(response.data.responseData.cursor)
            } else {
                setCursor(null)
            }
        }).catch(() => {
            toast.open("Error loading watchlist", "error");
            setLoading(false);
        });
    }

    const handleTabChange = (i: number) => {
        if (i === selectedTab) return;

        setSelectedTab(i);
    }

    const removeItemFromWatchlist = (id: string, type: string, index: number) => {
        removeFromWatchlist(id, type).then(() => {
            watchlist.splice(index, 1);
            setWatchlist([...watchlist]);
            toast.open("Item removed from watchlist", "success");
        });
    }

    return (
        <div className="content">
            <div className="page-title-container">
                <Bookmark size={40} />
                <h1>Watchlist</h1>
            </div>
            <div className="content-wrapper">
                <div className="watchlist-section-header">
                    {tabsConfig.map((tab, index) => (
                        <Tab key={index} title={tab.title} isActive={selectedTab === index} onClick={() => handleTabChange(index)}/>
                    ))}
                </div>
                <div className="watchlist-container">
                    {watchlist.length < 1 && !loading &&
                        <NotFound message="Find something you like and add it to your watchlist" />}
                    <div>
                        {watchlist.map((media: any, index) => (
                            <WatchlistItem
                                key={`${media.watchlist_id}.${media.type}`}
                                index={index}
                                title={media.title}
                                progress={media.progress}
                                total_progress={media.totalProgress}
                                backdrop={media.backdropUrl}
                                poster={media.posterUrl}
                                favorited={media.favorited}
                                status={media.status}
                                media_id={media.media_id}
                                id={media.media_id.toString()}
                                type={media.type}
                                removeItemFromWatchlist={removeItemFromWatchlist}/>
                        ))}
                        <div style={{marginTop: "150px"}} className={loading ? "loader active" : "loader"}>
                            <div className="spinning-loader"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

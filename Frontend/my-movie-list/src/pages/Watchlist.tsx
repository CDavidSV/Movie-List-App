import { useEffect, useState } from "react";
import { mml_api_protected } from "../axios/mml_api_intances";
import NotFound from "../components/not-found-component/not-found";
import "./watchlist.css";

function WatchlistItem(props: { title: string, progress: number, total_progress: number, backgrop: string, poster: string }) {
    return (
        <div className="watchlist-item">
        <picture className="">
            <source media="(max-width: 768px)" srcSet={props.poster} />
            <img src={props.backgrop} alt="Movie Backdrop"/>
        </picture>
        <div className="info">
            <h3>{props.title}</h3>
            <span className="icon-btn heart-icon material-icons">favorite_border</span>
        </div>
            <div className="actions desktop">
                <div className="progress">
                    <span className="watchlist-btn material-icons">remove</span>
                    <span>{`${props.progress}/${props.total_progress}`}</span>
                    <span className="watchlist-btn material-icons">add</span>
                </div>
                <span className="watchlist-btn trash-icon material-icons">delete_outline</span>
            </div>
            <div className="actions mobile">
                <span className="watchlist-btn trash-icon material-icons">edit</span>
            </div>
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
    { title: 'Plan to watch', status: 2 },
    { title: 'Watching', status: 0 },
    { title: 'Finished', status: 1 },
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
            setWatchlist(response.data.responseData);
        });

    }, [selectedTab]);

    const handleTabChange = (i: number) => {
        if (i === selectedTab) return;

        setSelectedTab(i);
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
                        <Tab title={tab.title} isActive={selectedTab === index} onClick={() => handleTabChange(index)}/>
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
                            {watchlist.map((media: any) => (
                                <WatchlistItem 
                                    title={media.title}
                                    progress={media.progress} 
                                    total_progress={media.total_progress} 
                                    backgrop={media.backdrop_url}
                                    poster={media.poster_url}/>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
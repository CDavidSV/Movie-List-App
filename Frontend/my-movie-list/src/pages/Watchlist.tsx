import { useEffect, useState } from "react";
import { mml_api_protected } from "../axios/mml_api_intances";
import NotFound from "../components/not-found-component/not-found";
import "./watchlist.css";

export default function Watchlist() {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [watchlist, setWatchlist] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);

        switch (selectedTab) {
            case 0:
                mml_api_protected.get("api/v1/watchlist?page=1&status=2").then((response) => {
                    setLoading(false);
                    setWatchlist(response.data.responseData);
                });
                break;
            case 1:
                mml_api_protected.get("api/v1/watchlist?page=1&status=0").then((response) => {
                    setLoading(false);
                    setWatchlist(response.data.responseData);
                });
                break;
            case 2:
                mml_api_protected.get("api/v1/watchlist?page=1&status=1").then((response) => {
                    setLoading(false);
                    setWatchlist(response.data.responseData);
                });
                break;
            default:
                break;
        }

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
                    <div onClick={() => handleTabChange(0)} className={selectedTab === 0 ? "watchlist-section-tag active" : "watchlist-section-tag"}>
                        <h3>Plan to watch</h3>
                    </div>
                    <div onClick={() => handleTabChange(1)} className={selectedTab === 1 ? "watchlist-section-tag active" : "watchlist-section-tag"}>
                        <h3>Watching</h3>
                    </div>
                    <div onClick={() => handleTabChange(2)} className={selectedTab === 2 ? "watchlist-section-tag active" : "watchlist-section-tag"}>
                        <h3>Finished</h3>
                    </div>
                </div>
                <div className="watchlist-container">
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                    {watchlist.length < 1 && !loading &&
                        <NotFound message="Find something you like and add it to your watchlist" />}
                    {watchlist.length > 0 && !loading &&
                        <div>
                            yes
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
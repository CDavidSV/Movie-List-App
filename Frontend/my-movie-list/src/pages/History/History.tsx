import { useEffect, useState } from "react";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { mml_api_protected } from "../../axios/mml_api_intances";
import NotFound from "../../components/not-found-component/not-found";

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

    useEffect(() => {
        document.title = "My Movie List - History";

        setLoading(true);
        mml_api_protected.get('/api/v1/history').then(response => {
            setHistory(response.data.responseData.history);
            setLastUpdatedDate(response.data.responseData.lastUpdatedDate);
            setLoading(false);
            console.log(response.data.responseData);
        });
    }, []);

    useInfiniteScroll(() => {
        setLoading(true);
        mml_api_protected.get(`/api/v1/history?last_updated_date=${lastUpdatedDate}`).then(response => {
            setHistory([...history, ...response.data.responseData.history]);
            console.log(response.data.responseData)
            setLastUpdatedDate(response.data.responseData.lastUpdatedDate);
            setLoading(false);
        });
    }, loading, lastUpdatedDate === null);

    const clearHistory = () => {
        mml_api_protected.delete('/api/v1/history/clear').then(() => {
            setHistory([]);
        });
    }

    return (
        <div className="content">
            <div className="page-title-container">
                <span style={{fontSize: "2rem"}} className="material-icons icon">history</span>
                <h1>History</h1>
            </div>
            <div className="content-wrapper">
                <div className="flex-container">
                    <button className="button" onClick={clearHistory}>
                        Clear History
                    </button>
                </div>
                <div className="movies-container">
                    {history.map((movie: any, index: number) => (
                            <FilmCard
                                key={`${index}.${movie.id}`} 
                                filmData={{
                                    id: movie.media_id,
                                    type: movie.type,
                                    posterUrl: movie.posterUrl,
                                    title: movie.title,
                                    releaseDate: movie.releaseDate,
                                    description: movie.description
                                }} 
                                inWatchlist={movie.watchlisted} 
                                inFavorites={movie.favorited}
                                searchResult={false}
                            />
                        ))
                    }
                    {!loading && history.length === 0 && <NotFound message="Your History is empty. Go on, explore!" />}
                </div>
                <div className={loading ? "loader active" : "loader"}><div className="spinning-loader"></div></div>
            </div>
        </div>
    );
}
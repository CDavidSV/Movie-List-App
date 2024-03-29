import { useEffect, useState } from "react";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { mml_api_protected } from "../../axios/mml_api_intances";
import NotFound from "../../components/not-found-component/not-found";
import Modal from "../../components/modal-component/modal";

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        document.title = "History | My Movie List";

        setLoading(true);
        mml_api_protected.get('/api/v1/history').then(response => {
            setHistory(response.data.responseData.history);
            setCursor(response.data.responseData.cursor);
            setLoading(false);
        });
    }, []);

    useInfiniteScroll(() => {
        setLoading(true);
        mml_api_protected.get(`/api/v1/history?cursor=${cursor}`).then(response => {
            setHistory([...history, ...response.data.responseData.history]);
            setCursor(response.data.responseData.cursor);
            setLoading(false);
        });
    }, loading, cursor === null);

    const clearHistory = () => {
        mml_api_protected.delete('/api/v1/history/clear').then(() => {
            setHistory([]);
            setCursor(null);
        });
        setModalOpen(false);
    }
 
    return (
        <div className="content">
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    <h3 style={{textAlign: "center"}}>Are you sure you want to clear your history?</h3>
                    <div className="modal-buttons">
                        <button className="button" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button className="button primary" onClick={clearHistory}>Yes</button>
                    </div>
                </div>
            </Modal>
            <div className="page-title-container">
                <span style={{fontSize: "2rem"}} className="material-icons icon">history</span>
                <h1>History</h1>
            </div>
            <div className="content-wrapper">
                <div className="flex-container">
                    <button className="button" onClick={() => setModalOpen(true)}>
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
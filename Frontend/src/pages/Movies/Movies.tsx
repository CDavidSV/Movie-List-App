import { useContext, useEffect, useState } from "react";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { ScrollRestoration } from "react-router-dom";
import { Clapperboard } from "lucide-react";

export default function Movies() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const toast = useContext(ToastContext);
    const { getSavedItems, mml_api } = useContext(GlobalContext);

    const getMovies = (page: number) => {
        setLoading(true);

        mml_api.get(`api/v1/media/movies/popular?page=${page}`).then((response) => {
            setLoading(false);
            setMovies([...movies, ...response.data.responseData]);

            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setMovies([...movies, ...films]);
            });
        }).catch(() => {
            toast.open("Error loading movies", "error");
        });
    }

    useInfiniteScroll(() => setPage(page + 1), loading);

    useEffect(() => {
        document.title = "Movies | My Movie List";

        getMovies(page);
    }, [page]);

    return (
        <div className="content">
            <ScrollRestoration />
            <div className="page-title-container">
                <Clapperboard size={40} />
                <h1>Movies</h1>
            </div>
            <div className="content-wrapper">
                <div className="movies-container">
                    {movies.map((movie: any, index) => (
                        <FilmCard 
                            key={`${index}.${movie.id}`} 
                            filmData={movie} 
                            inWatchlist={movie.inWatchlist} 
                            inFavorites={movie.inFavorites} 
                            searchResult={false}/>
                    ))}
                </div>
                <div className={loading ? "loader active" : "loader"}><div className="spinning-loader"></div></div>
            </div>
        </div>
    );
}
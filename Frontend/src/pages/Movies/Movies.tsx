import { useContext, useEffect, useRef, useState } from "react";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { Clapperboard } from "lucide-react";

export default function Movies() {
    const { getSavedItems, mml_api, userData, getListCache, setListCache } = useContext(GlobalContext);
    const [movies, setMovies] = useState<any[]>(() => getListCache("movies")?.items ?? []);
    const [loading, setLoading] = useState(!getListCache("movies"));
    const [page, setPage] = useState<number>(() => getListCache("movies")?.page ?? 1);
    const loadedPage = useRef<number>(getListCache("movies")?.page ?? 0);
    const toast = useContext(ToastContext);

    const getMovies = (page: number) => {
        setLoading(true);

        mml_api.get(`api/v1/media/movies/popular?page=${page}&mature_content=${userData?.matureContent}`).then((response) => {
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

        if (page <= loadedPage.current) return;
        loadedPage.current = page;
        getMovies(page);
    }, [page]);

    useEffect(() => {
        if (movies.length > 0) setListCache("movies", { items: movies, page });
    }, [movies, page]);

    return (
        <div className="content">
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

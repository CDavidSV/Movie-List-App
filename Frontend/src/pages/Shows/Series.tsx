import { useContext, useEffect, useRef, useState } from "react";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { TvMinimalPlay } from "lucide-react";

export default function Series() {
    const { getSavedItems, mml_api, userData, getListCache, setListCache } = useContext(GlobalContext);
    const [movies, setMovies] = useState<any[]>(() => getListCache("series")?.items ?? []);
    const [loading, setLoading] = useState(!getListCache("series"));
    const [page, setPage] = useState<number>(() => getListCache("series")?.page ?? 1);
    const loadedPage = useRef<number>(getListCache("series")?.page ?? 0);
    const toast = useContext(ToastContext);

    const getShows = (page: number) => {
        setLoading(true);

        mml_api.get(`api/v1/media/series/popular?page=${page}&mature_content=${userData?.matureContent}`).then((response) => {
            setLoading(false);
            setMovies([...movies, ...response.data.responseData]);

            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setMovies([...movies, ...films]);
            });
        }).catch(() => {
            toast.open("Error loading series", "error");
        });
    }

    useInfiniteScroll(() => setPage(page + 1), loading);

    useEffect(() => {
        document.title = "Series | My Movie List";

        if (page <= loadedPage.current) return;
        loadedPage.current = page;
        getShows(page);
    }, [page]);

    useEffect(() => {
        if (movies.length > 0) setListCache("series", { items: movies, page });
    }, [movies, page]);

    return (
        <div className="content">
            <div className="page-title-container">
                <TvMinimalPlay size={40} />
                <h1>Series</h1>
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

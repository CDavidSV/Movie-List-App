import { useEffect, useState } from "react";
import { mml_api } from "../../axios/mml_api_intances";
import { getSavedItems } from "../../helpers/util.helpers";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

export default function Movies() {
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const getMovies = (page: number) => {
        setLoading(true);

        mml_api.get(`api/v1/media/movies/popular?page=${page}`).then((response) => {
            setLoading(false);
            setMovies([...movies, ...response.data.responseData]);

            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setMovies([...movies, ...films]);
            });
        });
    }

    useInfiniteScroll(() => setPage(page + 1), loading);

    useEffect(() => {
        document.title = "Movies | My Movie List";

        getMovies(page);
    }, [page]);

    return (
        <div className="content">
            <div className="page-title-container">
                <span style={{fontSize: "2rem"}} className="material-icons icon">movie</span>
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
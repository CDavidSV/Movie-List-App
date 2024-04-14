import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageNotFound from "../PageNotFound/PageNotFound";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";

export default function Genres() {
    const { genreName } = useParams<{ genreName: string }>();
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const { getSavedItems, mml_api } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${genreName} | My Movie List`;

        setPage(1);
        setMedia([]);
        setLoading(true);
        
        mml_api.get(`api/v1/media/movies/genres?name=${genreName}`).then((response) => {
            setLoading(false);
            setMedia(response.data.responseData);
            
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type})), (films: any) => {
                setMedia(films);
            });
        }).catch(() => {
            toast.open("Error loading genre", "error");
            navigate("/genres");
        });
    }, [navigate]);


    const getNextPage = () => {
        const nextPage = page + 1;

        setLoading(true);
        mml_api.get(`api/v1/media/movies/genres?name=${genreName}&page=${nextPage}`).then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type})), (films: any) => {
                setMedia([...media, ...films]);
                setPage(nextPage);
                setLoading(false);
            });
        }).catch(() => {
            toast.open("Error loading genre", "error");
            setLoading(false);
        });
    }

    useInfiniteScroll(() => getNextPage(), loading);

    if (!genreName) return <PageNotFound />;

    return (
        <div className="content">
            <div className="page-title-container">
                <span style={{fontSize: "2rem"}} className="material-icons icon">movie</span>
                <h1>{genreName}</h1>
            </div>
            <div className="content-wrapper">
                <div className="movies-container">
                    {media.map((movie: any, index) => (
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
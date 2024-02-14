import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageNotFound from "../PageNotFound/PageNotFound";
import { mml_api } from "../../axios/mml_api_intances";
import { getSavedItems } from "../../helpers/util.helpers";
import FilmCard from "../../components/film-card-component/filmCard";

export default function Genres() {
    const { genreName } = useParams<{ genreName: string }>();
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        setMedia([]);
        setLoading(true);
        mml_api.get(`api/v1/media/genres?name=${genreName}&type=movie`).then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => film.id), (films: any) => {
                setMedia(films);
                setLoading(false);
            });
        });
    }, [navigate]);

    const getMediaByGenre = (page: number) => {
        
    };

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
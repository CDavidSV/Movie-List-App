import { useEffect, useState } from "react";
import "./favorites.css";
import { mml_api_protected } from "../axios/mml_api_intances";
import { Link } from "react-router-dom";

function FilmListCard({ filmData, removeItem }: { filmData: any, removeItem: Function }) {
    const [watchlisted, setWatchlisted] = useState<boolean>(filmData.watchlisted);
    
    const removeFromFavorites = () => {
        mml_api_protected.delete(`api/v1/favorites/remove?media_id=${filmData.media_id}&type=${filmData.type}`).then(() => {
            removeItem();
        });
    }

    return (
        <div className="list-card-container">
            <div className="list-drag">
                <span className="material-icons">drag_indicator</span>
            </div>
            <figure className="list-card-img-container">
                <picture>
                    <source media="(max-width: 768px)" srcSet={filmData.poster_url} />
                    <img loading="lazy" src={filmData.backdrop_url}/>
                </picture>
            </figure>
            <div className="list-card-content">
                <h4>{filmData.title}</h4>
                <p>{filmData.description}</p>
                <div>
                    <span className="material-icons icon-btn">{watchlisted ? "bookmark" : "bookmark_border"}</span>
                </div>
            </div>
            <div className="list-card-delete">
                <span className="material-icons remove-list-item-btn" onClick={removeFromFavorites}>delete_outline</span>
            </div>
        </div>
    );
}

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        mml_api_protected.get("api/v1/favorites").then((res) => {
            setFavorites(res.data.responseData.favorites);
            setLoading(false);
        });
    }, []);

    const removeItemFromFavorites = (i: number) => {
        favorites.splice(i, 1);
        setFavorites([...favorites]);
    }
    
    return (  
        <div className="content">
            <div className="content-wrapper">                
                <div className="favorites-container">
                    <h1>Favorites</h1>
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                    {!loading && favorites.length < 1 ? 
                    <div className="no-favorites">
                        <p style={{textAlign: "center", filter: "brightness(0.6)"}}>You have no favorites</p>
                        <Link to="/">
                            <button className="primary-button">
                                Go to Home Feed
                            </button>
                        </Link>
                    </div>
                    : favorites.map((film, index) => (
                        <FilmListCard key={index} filmData={film} removeItem={() => removeItemFromFavorites(index)}/>
                    ))}
                </div>
            </div>
        </div>
    );
}
import { Link, useNavigate } from 'react-router-dom';
import './filmCard.css';
import { useRef } from 'react';
import React from 'react';
import { shortenNumber } from '../../helpers/util.helpers';
import { mml_api_protected } from '../../axios/mml_api_intances';
import { isLoggedIn } from '../../helpers/session.helpers';

export default function FilmCard({filmData}: {filmData?: any}) {
    const hoverContentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    let [isFavorite, setIsFavorite] = React.useState<boolean>(filmData && filmData.inFavorites || false);
    let [isWatchlisted, setIsWatchlisted] = React.useState<boolean>(filmData && filmData.inWatchlist || false);

    const activateHover = () => {         
        hoverContentRef.current?.classList.add("active");
    }

    const deactivateHover = () => {
        hoverContentRef.current?.classList.remove("active");
    }

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isLoggedIn()) return navigate("/login");

        if (isFavorite) {
            setIsFavorite(false);
            mml_api_protected.delete(`api/v1/favorites/remove?media_id=${filmData!.id}&type=${filmData!.type}`).catch(() => {
                setIsFavorite(true);
            });
            return;
        }

        setIsFavorite(true);
        mml_api_protected.post(`api/v1/favorites/add?media_id=${filmData!.id}&type=${filmData!.type}`)
        .catch(() => {
            setIsFavorite(false);
        });
    }

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isLoggedIn()) return navigate("/login");

        if (isWatchlisted) {
            setIsWatchlisted(false);
            mml_api_protected.delete(`api/v1/watchlist/remove?media_id=${filmData!.id}&type=${filmData!.type}`).catch(() => {
                setIsWatchlisted(true);
            });
            return;
        }

        setIsWatchlisted(true);
        mml_api_protected.post(`api/v1/watchlist/update`, {
            media_id: filmData!.id.toString(),
            status: 5, // Plan to watch
            progress: 0,
            type: filmData!.type
        })
        .catch(() => {
            setIsWatchlisted(false);
        });
    }

    return (
        <>
            {!filmData ? (
                <div className="film-card skeleton-loader">
                    {/* Skeleton loader */}
                    <div className="skeleton-poster"></div>
                    <div className="skeleton-info">
                        <div className="card-info skeleton-title"></div>
                        <div className="skeleton-release-date"></div>
                    </div>
                </div>
            ) : (
                <Link onMouseEnter={activateHover} onMouseLeave={deactivateHover} to={filmData.link} className="film-card">
                    <figure className="poster-image-figure">
                        <img loading="lazy" src={filmData.poster_url}/>
                    </figure>
                    <div className="card-info">
                        <h4>{filmData.title}</h4>
                        <p>{filmData.release_date}</p>
                    </div>
                    <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.poster_url})`}}>
                        <div className="card-hover-info-content">
                            <div>
                                <h6>{filmData.title}</h6>
                                <div className="card-hover-info-content-vote">
                                    <p>{filmData.vote_average.toFixed(1)}★</p>
                                    <p>({shortenNumber(filmData.votes)})</p>
                                </div>
                                <div className="card-hover-info-content-description">
                                    <p>{filmData.description}</p>
                                </div>
                            </div>
                            <div className="card-hover-info-content-buttons">
                                {isLoggedIn() &&
                                <>        
                                    <span className="material-icons icon-btn" onClick={handleWatchlistClick}>{!isWatchlisted ? "bookmark_border" : "bookmark"}</span>
                                    <span className="material-icons icon-btn" onClick={handleFavoriteClick}>{!isFavorite ? "favorite_border" : "favorite"}</span>
                                </>}
                            </div>
                        </div>
                    </div>
                </Link>
            )}
        </>
    );
}
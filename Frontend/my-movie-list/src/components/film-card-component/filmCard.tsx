import { Link, useNavigate } from 'react-router-dom';
import './filmCard.css';
import { useRef } from 'react';
import React from 'react';
import { shortenNumber, setFavorite, removeFavorite, setWatchlist, removeFromWatchlist } from '../../helpers/util.helpers';
import { isLoggedIn } from '../../helpers/session.helpers';

export default function FilmCard({ filmData, searchResult }: { filmData?: any, searchResult: boolean }) {
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
            removeFavorite(filmData!.id, filmData!.type).catch(() => {
                setIsFavorite(true);
            });
            return;
        }

        setIsFavorite(true);
        setFavorite(filmData!.id, filmData!.type)
        .catch(() => {
            setIsFavorite(false);
        });
    }

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isLoggedIn()) return navigate("/login");

        if (isWatchlisted) {
            setIsWatchlisted(false);
            removeFromWatchlist(filmData!.id, filmData!.type).catch(() => {
                setIsWatchlisted(true);
            });
            return;
        }

        setIsWatchlisted(true);
        setWatchlist(filmData!.id, filmData!.type)
        .catch(() => {
            setIsWatchlisted(false);
        });
    }

    const handleFilmSelect = () => {
        if (searchResult) {
            
        }

        console.log("Film selected");
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
                <div onMouseEnter={activateHover} onMouseLeave={deactivateHover} className="film-card">
                    <Link to={filmData.link} onClick={handleFilmSelect} className="card-anchor">
                        <figure className="poster-image-figure">
                            <img loading="lazy" src={filmData.poster_url}/>
                        </figure>
                        <div className="card-info">
                            <h4>{filmData.title}</h4>
                            <p>{filmData.release_date}</p>
                        </div>
                    </Link>
                    <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.poster_url})`}}>
                        <Link to={filmData.link} onClick={handleFilmSelect} className="card-hover-info-content">
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
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
import { Link } from 'react-router-dom';
import './filmCard.css';
import { useRef } from 'react';
import { shortenNumber, saveToHistory } from '../../helpers/util.helpers';
import { isLoggedIn } from '../../helpers/session.helpers';
import FavoriteButton from '../favorite-button-component/favorite-button';
import WatchlistButton from '../watchlist-button-component/watchlist-button';

export default function FilmCard({ filmData, searchResult }: { filmData?: any, searchResult: boolean }) {
    const hoverContentRef = useRef<HTMLDivElement>(null);

    const activateHover = () => {         
        hoverContentRef.current?.classList.add("active");
    }

    const deactivateHover = () => {
        hoverContentRef.current?.classList.remove("active");
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
                    <div className="card-anchor">
                        <figure className="poster-image-figure">
                            <img loading="lazy" src={filmData.poster_url} alt={filmData.title}/>
                        </figure>
                        <div className="card-info">
                            <h4>{filmData.title}</h4>
                            <p>{filmData.release_date}</p>
                        </div>
                    </div>
                    <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.poster_url})`}}>
                        <Link onClick={() => saveToHistory(filmData.title, filmData.id.toString(), filmData.type, searchResult)} to={`/media/${filmData.type}/${filmData.id}`} className="card-hover-info-content">
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
                                    <WatchlistButton 
                                        size='small'
                                        isWatchlisted={filmData.inFavorites}
                                        mediaId={filmData.id}
                                        type={filmData.type}/>  
                                    <FavoriteButton 
                                        size='small'
                                        isFavorite={filmData.inFavorites}
                                        mediaId={filmData.id}
                                        type={filmData.type}/>
                                </>}
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
import { Link } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { shortenNumber, saveSearchResult } from '../../helpers/util.helpers';
import FavoriteButton from '../favorite-button-component/favorite-button';
import WatchlistButton from '../watchlist-button-component/watchlist-button';
import { PersonalListsContext } from '../../contexts/PersonalListsContext';
import React from 'react';
import './filmCard.css';

export default React.memo(function FilmCard({ inWatchlist, inFavorites, searchResult, filmData }: FilmCardProps) {
    const hoverContentRef = useRef<HTMLDivElement>(null);
    const [personalListsState, setPersonalListsState] = useState<{ inWatchlist: boolean, inFavorites: boolean }>({ inWatchlist, inFavorites });
    const { watchlistState, favoriteState } = useContext(PersonalListsContext);

    const activateHover = () => {         
        hoverContentRef.current?.classList.add("active");
    }

    const deactivateHover = (e: React.MouseEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            // If it is a child element, ignore the event
            return;
        }
        hoverContentRef.current?.classList.remove("active");
    }

    const saveSearch = () => {
        if (!searchResult) return;

        saveSearchResult(filmData.title, filmData.id.toString(), filmData.type, `/media/${filmData.type}/${filmData.id}`)
    }

    useEffect(() => {
        const newWatchlistState = watchlistState.get(`${filmData.id}.${filmData.type}`);
        const newFavoriteState = favoriteState.get(`${filmData.id}.${filmData.type}`);

        const inPersonalListsObj = { inWatchlist: false, inFavorites: false };
        if (newWatchlistState !== undefined) {
            inPersonalListsObj.inWatchlist = newWatchlistState;
        }

        if (newFavoriteState !== undefined) {
            inPersonalListsObj.inFavorites = newFavoriteState;
        }
        setPersonalListsState(inPersonalListsObj);
    }, [watchlistState, favoriteState]);

    useEffect(() => {
        const inPersonalListsObj = { inWatchlist: false, inFavorites: false };
        if (inWatchlist !== undefined) {
            inPersonalListsObj.inWatchlist = inWatchlist;
        }

        if (inFavorites !== undefined) {
            inPersonalListsObj.inFavorites = inFavorites;
        }
        setPersonalListsState(inPersonalListsObj);
    }, [inWatchlist, inFavorites]);

    return (
        <div onMouseEnter={activateHover} onMouseOut={deactivateHover} className="film-card">
            <Link 
            onClick={saveSearch}
            onAuxClick={saveSearch}
            to={`/media/${filmData.type}/${filmData.id}`} className="card-anchor">
                <figure className="poster-image-figure">
                    <img loading="lazy" src={filmData.posterUrl} alt={filmData.title}/>
                </figure>
                <div className="card-info">
                    <h4>{filmData.title}</h4>
                    <p>{filmData.releaseDate}</p>
                </div>
            </Link>
            <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.posterUrl})`}}>
                <div className="card-hover-info-content">
                    <Link
                        className="media-link" 
                        onClick={saveSearch}
                        onAuxClick={saveSearch}
                        to={`/media/${filmData.type}/${filmData.id}`}/>
                    <div>
                        <h6>{filmData.title}</h6>
                        <div className="card-hover-info-content-vote">
                            {filmData.voteAverage && filmData.votes &&
                                <>
                                    <p>{filmData.voteAverage.toFixed(1)}★</p>
                                    <p>({shortenNumber(filmData.votes)})</p>
                                </>
                            }
                        </div>
                        <div className="card-hover-info-content-description">
                            <p>{filmData.description}</p>
                        </div>
                    </div>
                    <div className="card-hover-info-content-buttons">
                        <WatchlistButton 
                            size='small'
                            isWatchlisted={personalListsState.inWatchlist}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>  
                        <FavoriteButton 
                            size='small'
                            isFavorite={personalListsState.inFavorites}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>
                    </div>
                </div>
            </div>
        </div>
    );
});
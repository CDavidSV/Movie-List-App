import { Link } from 'react-router-dom';
import './filmCard.css';
import { useRef } from 'react';
import { shortenNumber, saveSearchResult } from '../../helpers/util.helpers';
import FavoriteButton from '../favorite-button-component/favorite-button';
import WatchlistButton from '../watchlist-button-component/watchlist-button';

interface FilmCardData {
    id: number;
    type: string;
    posterUrl: string;
    title: string;
    releaseDate: string;
    voteAverage?: number;
    votes?: number;
    description: string;
}

interface FilmCardProps {
    filmData: FilmCardData;
    inWatchlist: boolean;
    inFavorites: boolean;
    searchResult: boolean;
}

export default function FilmCard({ inWatchlist, inFavorites, searchResult, filmData }: FilmCardProps) {
    const hoverContentRef = useRef<HTMLDivElement>(null);

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
                            isWatchlisted={inWatchlist}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>  
                        <FavoriteButton 
                            size='small'
                            isFavorite={inFavorites}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { FilmCardData, FilmCardProps };
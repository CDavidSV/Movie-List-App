import { Link } from 'react-router-dom';
import './filmCard.css';
import { useRef } from 'react';
import { shortenNumber, saveToHistory } from '../../helpers/util.helpers';
import { isLoggedIn } from '../../helpers/session.helpers';
import FavoriteButton from '../favorite-button-component/favorite-button';
import WatchlistButton from '../watchlist-button-component/watchlist-button';

interface FilmCardData {
    id: number;
    type: string;
    posterUrl: string;
    title: string;
    releaseDate: string;
    voteAverage: number;
    votes: number;
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

    const deactivateHover = () => {
        hoverContentRef.current?.classList.remove("active");
    }

    return (
        <div onMouseEnter={activateHover} onMouseLeave={deactivateHover} className="film-card">
            <div className="card-anchor">
                <figure className="poster-image-figure">
                    <img loading="lazy" src={filmData.posterUrl} alt={filmData.title}/>
                </figure>
                <div className="card-info">
                    <h4>{filmData.title}</h4>
                    <p>{filmData.releaseDate}</p>
                </div>
            </div>
            <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.posterUrl})`}}>
                <Link onClick={() => saveToHistory(filmData.title, filmData.id.toString(), filmData.type, searchResult)} to={`/media/${filmData.type}/${filmData.id}`} className="card-hover-info-content">
                    <div>
                        <h6>{filmData.title}</h6>
                        <div className="card-hover-info-content-vote">
                            <p>{filmData.voteAverage.toFixed(1)}★</p>
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
                                isWatchlisted={inWatchlist}
                                mediaId={filmData.id.toString()}
                                type={filmData.type}/>  
                            <FavoriteButton 
                                size='small'
                                isFavorite={inFavorites}
                                mediaId={filmData.id.toString()}
                                type={filmData.type}/>
                        </>}
                    </div>
                </Link>
            </div>
        </div>
    );
}
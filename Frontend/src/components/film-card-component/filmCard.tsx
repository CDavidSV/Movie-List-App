import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { shortenNumber, saveSearchResult } from '../../helpers/util.helpers';
import FavoriteButton from '../favorite-button-component/favorite-button';
import WatchlistButton from '../watchlist-button-component/watchlist-button';
import React from 'react';
import { Trash2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import './filmCard.css';

export default React.memo(function FilmCard({ inWatchlist, inFavorites, searchResult, filmData, onDelete }: FilmCardProps) {
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

        saveSearchResult(filmData.title, filmData.id.toString(), filmData.type, `/media/${filmData.type}/${filmData.id}`);
    }

    return (
        <div onMouseEnter={activateHover} onMouseOut={deactivateHover} className="film-card">
            <Link
            onClick={saveSearch}
            onAuxClick={saveSearch}
            to={`/media/${filmData.type}/${filmData.id}`} className="card-anchor">
                <figure className="poster-image-figure">
                    <img loading="lazy" src={filmData.posterUrl || "/img/No_Poster.jpeg"} alt={filmData.title}/>
                </figure>
                <div className="card-info">
                    <h4>{filmData.title}</h4>
                    <p>{filmData.releaseDate}</p>
                </div>
            </Link>
            <div ref={hoverContentRef} className="card-hover-info" style={{backgroundImage: `url(${filmData.posterUrl || "/img/No_Poster.jpeg"})`}}>
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
                            size={25}
                            isWatchlisted={inWatchlist}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>
                        <FavoriteButton
                            size={25}
                            isFavorite={inFavorites}
                            mediaId={filmData.id.toString()}
                            type={filmData.type}/>
                        {onDelete &&
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => onDelete(filmData)} className="delete-button ml-auto mr-2 text-muted-foreground hover:text-red-800 transition-all ease-in-out">
                                            <Trash2 size={25} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="m-0 text-sm">Remove from History</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
});

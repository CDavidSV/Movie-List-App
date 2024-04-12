import { useEffect, useRef, useState } from 'react';
import FilmCard from '../film-card-component/filmCard';
import './filmSlider.css';
import FilmCardSkeleton from '../film-card-skeleton-component/film-card-skeleton';
import React from 'react';

export default React.memo(function FilmSlider (props: FilmSliderProps) {
    const slider = useRef<HTMLDivElement>(null);
    const [buttonStates, setButtonStates] = useState({ left: false, right: false });
    let timeout: NodeJS.Timeout | null = null;
    
    const scrollHandler = () => {
        if (!slider.current) return;
        const current = slider.current;

        clearTimeout(timeout!);
        timeout = setTimeout(() => {
            const sliderRect = current.getBoundingClientRect();
            const firstChild = current.firstElementChild as HTMLDivElement;
            const lastChild = current.lastElementChild as HTMLDivElement;

            setButtonStates({
                left: firstChild.getBoundingClientRect().left < sliderRect.left,
                right: lastChild.getBoundingClientRect().right > sliderRect.right
            });
        }, 50);
    }

    useEffect(() => {
        if (!slider.current || props.filmArr.length < 1) return;

        slider.current.addEventListener('scroll', scrollHandler);
        scrollHandler();

        return () => {
            slider.current?.removeEventListener('scroll', scrollHandler);
        }
    }, [props.filmArr]);

    const changePage = (direction: string) => {
        if (!slider.current) return;

        const style = window.getComputedStyle(slider.current);
        const paddingHorizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        if (direction === 'right') {
            slider.current.scrollBy({
                left: slider.current.clientWidth - paddingHorizontal,
                behavior: 'smooth'
            });
        } else if (direction === 'left') {
            slider.current.scrollBy({
                left: -slider.current.clientWidth + paddingHorizontal,
                behavior: 'smooth'
            });
        }
    }

    return (
    <>
        {props.title && 
            <div className="slider-header">
                <h1>{props.title}</h1>
            </div>
        }
        <div className="slider-container">
            <div className="button-wrapper">
                <button className={`slider-button slider-button-left${!buttonStates.left ? ' disabled' : ''}`}  onClick={() => changePage('left')}>
                    <span className="material-icons">
                        arrow_back_ios
                    </span>
                </button>
                <button className={`slider-button slider-button-right${!buttonStates.right ? ' disabled' : ''}`} onClick={() => changePage('right')}>
                    <span className="material-icons">
                        arrow_forward_ios
                    </span>
                </button>
            </div> 
            <div ref={slider} className="slider">
                {props.filmArr.length > 0 ? props.filmArr.map((movie) => (
                    <FilmCard 
                        key={`${movie.filmData.id}.${movie.filmData.type}`} 
                        filmData={{
                            id: movie.filmData.id,
                            type: movie.filmData.type,
                            posterUrl: movie.filmData.posterUrl,
                            title: movie.filmData.title,
                            releaseDate: movie.filmData.releaseDate,
                            voteAverage: movie.filmData.voteAverage,
                            votes: movie.filmData.votes,
                            description: movie.filmData.description
                        }}
                        inWatchlist={movie.inWatchlist}
                        inFavorites={movie.inFavorites}
                        searchResult={false}/>
                )) : 
                    Array.from({length: 10}).map((_, index) => (
                        <FilmCardSkeleton key={index}/>
                    ))
                }
            </div>
        </div>
    </>
    );
});
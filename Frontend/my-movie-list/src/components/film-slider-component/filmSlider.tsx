import { useEffect, useRef, useState } from 'react';
import FilmCard from '../film-card-component/filmCard';
import './filmSlider.css';

export default function FilmSlider (props: {filmArr: any[], title: string}) {
    const slider = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const [buttonStates, setButtonStates] = useState({ left: false, right: false });
    
    const scrollHandler = () => {
        if (!slider.current) return;

        const sliderRect = slider.current.getBoundingClientRect();
        const firstChild = slider.current.firstElementChild as HTMLDivElement;
        const lastChild = slider.current.lastElementChild as HTMLDivElement;

        setButtonStates({
            left: firstChild.getBoundingClientRect().left < sliderRect.left,
            right: lastChild.getBoundingClientRect().right > sliderRect.right
        });

        scrollTimeout.current = null;
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

        if (direction === 'right') {
            slider.current.scrollBy({
                left: slider.current.clientWidth,
                behavior: 'smooth'
            });
        } else if (direction === 'left') {
            slider.current.scrollBy({
                left: -slider.current.clientWidth,
                behavior: 'smooth'
            });
        }
    }

    return (
    <>
        <div className="slider-header">
            <h1>{props.title}</h1>
        </div>
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
                {props.filmArr.length > 0 ? props.filmArr.map((movie, index) => (
                    <FilmCard 
                        key={index} 
                        filmData={movie}
                        searchResult={false}/>
                )) : 
                    Array.from({length: 10}).map((_, index) => (
                        <FilmCard key={`loading-${index}`} searchResult={false}/>
                    ))
                }
            </div>
        </div>
    </>
    );
}
import { useEffect, useRef, useState } from 'react';
import FilmCard from '../film-card-component/filmCard';
import './filmSlider.css';

export default function FilmSlider (props: {filmArr: any[], title: string}) {
    const slider = useRef<HTMLDivElement>(null);
    const pagesPerSlide = 5;
    const totalPages = Math.ceil(props.filmArr.length / pagesPerSlide) - 1;
    const pageRemainder = Math.ceil(props.filmArr.length / pagesPerSlide * 100) - totalPages * 100;
    let [currPage, setCurrPage] = useState(0);
    let [slidePercentage, setSlidePercentage] = useState(0);

    useEffect(() => {
        slider.current!.style.setProperty("--slide-page", `${slidePercentage}%`);
    }, [slidePercentage]);

    // 1 = right, 0 = left
    const changePage = (direction: number) => {
        if (currPage === totalPages && direction === 1) {
            setCurrPage(0)
            setSlidePercentage(0);
            return;
        }

        if (currPage === 0 && direction !== 1) {
            setCurrPage(totalPages);
            setSlidePercentage(-(totalPages - 1) * 100 - pageRemainder);
            return;
        };

        let step = 100;

        if (direction === 1) {
            currPage++;
            setCurrPage(currPage);

            if (currPage === totalPages) step = pageRemainder;
            setSlidePercentage(slidePercentage - step);
        } else {
            if (currPage === totalPages) step = pageRemainder;

            setCurrPage(currPage - 1);
            setSlidePercentage(slidePercentage + step);
        }
    }

    return (
    <>
        <div className="slider-header">
            <h1>{props.title}</h1>
            <div className="slider-page-indicator">
                {currPage + 1} / {totalPages + 1}
            </div>
        </div>
        <div className="slider-container">
            <button className="slider-button slider-button-left" onClick={() => changePage(0)}>
                <span className="material-symbols-outlined">
                    arrow_back_ios
                </span>
            </button>
            <div ref={slider} className="slider">
                {props.filmArr.map((movie) => (
                    <FilmCard key={movie.title} title={movie.title} poster={movie.poster_url} date={movie.release_date}/>
                ))}
            </div>
            <button className="slider-button slider-button-right" onClick={() => changePage(1)}>
                <span className="material-symbols-outlined">
                    arrow_forward_ios
                </span>
            </button>
        </div>
    </>
    );
}
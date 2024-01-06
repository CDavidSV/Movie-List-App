import { useEffect, useRef, useState } from 'react';
import FilmCard from '../film-card-component/filmCard';
import './filmSlider.css';

function PageIndicator({ pages, page }: { pages: number, page: number }) {
    return (
        <div className="slider-page-indicator">
            {Array.from(Array(pages).keys()).map((i) => (
                <span key={i} className={`page-indicator${page === i ? " selected" : ""}`}></span>
            ))}
        </div>
    );
}

export default function FilmSlider (props: {filmArr: any[], title: string}) {
    const slider = useRef<HTMLDivElement>(null);
    const pagesPerSlide = 6;
    const totalPages = Math.ceil(props.filmArr.length / pagesPerSlide) - 1;
    const pageRemainder = Math.ceil(props.filmArr.length / pagesPerSlide * 100) - totalPages * 100;

    let [buttonStates, setButtonStates] = useState({ left: false, right: false });
    let [currPage, setCurrPage] = useState(0);
    let [slidePercentage, setSlidePercentage] = useState(0);

    useEffect(() => {
        slider.current!.style.setProperty("--slide-page", `${slidePercentage}%`);

        setTimeout(() => {
            if (currPage === totalPages) {
                setButtonStates({ left: true, right: false });
            } else if (currPage === 0) {
                setButtonStates({ left: false, right: true });
            } else {
                setButtonStates({ left: true, right: true });
            }
        }, 600);
    }, [slidePercentage]);

    useEffect(() => {
        // Check if the slider should be scrollable
        if (props.filmArr.length > pagesPerSlide) {
            setButtonStates({ left: false, right: true });
        } else {
            setButtonStates({ left: false, right: false });
        }
    }, [props.filmArr.length]);

    // 1 = right, 0 = left
    const changePage = (direction: number) => {
        // Check if the slider should scroll in the given direction.
        if (currPage === totalPages && direction === 1) return;
        if (currPage === 0 && direction !== 1) return;

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
            <PageIndicator pages={totalPages + 1} page={currPage}/> 
        </div>
        <div className="slider-container">
            <button className={`slider-button slider-button-left${!buttonStates.left ? ' disabled' : ''}`}  onClick={() => changePage(0)}>
                <span className="material-icons">
                    arrow_back_ios
                </span>
            </button>
            <div ref={slider} className="slider">
                {props.filmArr.length > 0 ? props.filmArr.map((movie) => (
                    <FilmCard 
                        key={movie.title} 
                        filmData={movie}/>
                )) : 
                    <>
                        {/* Skeleton loaders */}
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                        <FilmCard />
                    </>
                }
            </div>
            <button className={`slider-button slider-button-right${!buttonStates.right ? ' disabled' : ''}`} onClick={() => changePage(1)}>
                <span className="material-icons">
                    arrow_forward_ios
                </span>
            </button>
        </div>
    </>
    );
}
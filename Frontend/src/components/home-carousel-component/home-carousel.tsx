import { useContext, useEffect, useRef, useState } from 'react';
import WatchlistButton from '../watchlist-button-component/watchlist-button';
import FavoriteButton from '../favorite-button-component/favorite-button';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';
import { saveSearchResult, shortenNumber } from '../../helpers/util.helpers';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './home-carousel.css';

const getPageNumber = (slide: number, totalSlides: number) => {
  if (slide === 1 || totalSlides === slide) return 1;
  if (slide === 0) return totalSlides - 1;
  return slide;
}

function SliderPagination(props: { slide: number, slides: number, cooldownSec: number, widthPercentage: number, stopped: boolean, onStop: () => void, onResume: () => void, changeSlide: (slide: number) => void }) {
  const [hovered, setHovered] = useState<boolean>(false);

  const mouseOver = () => {
    setHovered(true);
    props.onStop()
  }

  const mouseLeave = () => {
    setHovered(false);
    props.onResume()
  }
  
  return (
    <div className="slider-pagination">
      {Array.from(Array(props.slides).keys()).map((_, index) => (
        <div 
        onClick={() => props.changeSlide(index + 1)}
        onMouseEnter={mouseOver} 
        onMouseOut={mouseLeave} 
        key={index} 
        className={`pagination-pill${index + 1 === getPageNumber(props.slide, props.slides + 1) ? ` active${hovered || props.stopped ? " hovered" : ""}` : ""}`}>
          <span className="pagination-pill-completion" style={index + 1 === getPageNumber(props.slide, props.slides + 1) ? {transform: `translateX(-${props.widthPercentage}%)`} : {}}></span>
        </div>
      ))}
    </div>
  );
}

export default function HomeCarousel({ items }: { items: SliderItem[] }) {
  const cooldownSec = 12;
  const carouselRef = useRef<HTMLDivElement>(null);
  const stoppedRef = useRef<boolean>(false);
  const timeUntilNextSlide = useRef<number>(cooldownSec * 1000);
  const nextSlideTime = useRef<number>(Date.now() + cooldownSec * 1000);
  const remainingTimeRef = useRef<number>(0);
  const disabledButtons = useRef<boolean>(false);

  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [completion, setCompletion] = useState<number>(-100);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { loggedIn } = useContext(GlobalContext);

  const changeToCustomSlide = (slide: number) => {
    if (disabledButtons.current) return;
    
    setCompletion(0);
    disabledButtons.current = true;
    carouselRef.current!.style.transition = `transform 1s ease`;
    carouselRef.current!.style.transform = `translateX(-${slide * 100}%)`;
    remainingTimeRef.current = cooldownSec * 1000;
    setActiveSlide(slide);
  };

  const handleStopAutoSlide = () => {
    setButtonHovered(true);
    stoppedRef.current = true;
    remainingTimeRef.current = nextSlideTime.current - Date.now();
  }

  const handleResumeAutoSlide = () => {
    setButtonHovered(false);
    stoppedRef.current = false;
    nextSlideTime.current = Date.now() + remainingTimeRef.current;
    handleAutoSlide();
  }

  const handleAutoSlide = () => {
    if (stoppedRef.current) return;

    timeUntilNextSlide.current = nextSlideTime.current - Date.now();
    setCompletion((timeUntilNextSlide.current / (cooldownSec * 1000)) * 100);
    
    if (timeUntilNextSlide.current > 0) { 
      setTimeout(handleAutoSlide, 50);
      return;
    }
    
    disabledButtons.current = true;
    nextSlideTime.current = Date.now() + cooldownSec * 1000;

    setActiveSlide(prevActiveSlide => {
      const nextSlide = prevActiveSlide + 1;
      carouselRef.current!.style.transition = `transform 1s ease`;
      carouselRef.current!.style.transform = `translateX(-${nextSlide * 100}%)`;

      return nextSlide;
    });
    
    setTimeout(handleAutoSlide, 50);
  };

  const handleSlideButton = (direction: 'left' | 'right') => {  
    changeToCustomSlide(activeSlide + (direction === 'right' ? 1 : -1));
  }

  const onTransitionEnd = () => {
    if (activeSlide === slides.length - 1) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-100%)`;
      setActiveSlide(1);
    }

    if (activeSlide === 0) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-${slides.length - 2}00%)`;
      setActiveSlide(slides.length - 2);
    }

    disabledButtons.current = false;
  }

  const saveSearch = (item: SliderItem) => {
    saveSearchResult(item.title, item.id.toString(), item.type, `/media/${item.type}/${item.id}`)
  }

  const handleVisibilityChange = () => {
    document.hidden ? handleStopAutoSlide() : handleResumeAutoSlide();
  }

  useEffect(() => { 
    setSlides([items[items.length - 1], ...items, items[0]]);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, [items]);
  
  useEffect(() => {
      if (!carouselRef.current || slides.length === 0) return;

      handleAutoSlide();
  }, [slides]);

  return (
    <div className="home-carousel">
      <div className="carousel-layout">
        <>
          {slides.length > 0 && items.map((item, index) => (
            <div 
            key={`${item.title}-${index}`} 
            className={`slide-content-wrapper${index + 1 === getPageNumber(activeSlide, slides.length - 1) ? ' active' : ''}`}>
              <div className="slide-logo">
                <Link
                  className="media-link"
                  onClick={() => saveSearch(item)}
                  onAuxClick={() => saveSearch(item)}
                  to={`/media/${item.type}/${item.id}`}/>
                <img src={item.logoUrl} alt={`logo-${item.title}`} loading="eager" />
              </div>
              <div className="title-details">
                <p>{`${item.releaseDate} • ${item.genres.join(", ")}`}</p>
                <p>{item.voteAverage.toFixed(1)}★ ({shortenNumber(item.votes)})</p>
              </div>
              <div className="slide-general-info">
                <p>{item.description}</p>
              </div>
              <div className="slide-interaction">
                {loggedIn ? (
                  <>
                    <WatchlistButton 
                        size={40}
                        isWatchlisted={item.inWatchlist || false}
                        mediaId={item.id.toString()}
                        type={item.type}/>  
                    <FavoriteButton 
                        size={40}
                        isFavorite={item.inFavorites || false}
                        mediaId={item.id.toString()}
                        type={item.type}/>
                  </>
                ) : (
                  <button className="button primary" onClick={() => navigate("/signup")}>Sign Up to add to watchlist</button>
                )}
              </div>
            </div>
          ))}
          {slides.length > 0 && (
            <SliderPagination 
              slide={activeSlide} 
              slides={items.length} 
              cooldownSec={cooldownSec} 
              widthPercentage={completion}
              stopped={buttonHovered}
              onStop={handleStopAutoSlide} 
              onResume={handleResumeAutoSlide}
              changeSlide={changeToCustomSlide}
              />
          )}
        </>
      </div>
      <div 
      onMouseOver={handleStopAutoSlide}
      onMouseLeave={handleResumeAutoSlide}
      onClick={() => handleSlideButton('left')}
      className="carousel-button left">
        <span 
        style={{ pointerEvents: "none" }}>
          <ChevronLeft size={40} />
        </span>
      </div>
      <div ref={carouselRef} onTransitionEnd={onTransitionEnd} className="carousel-container" style={{transform: `translateX(-${1 * 100}%)`}}>
        {slides.map((item, index) => (
          <div key={`${item.backdropUrl}-${index}`} className="slide">
            <img className="slide-backdrop-img" src={item.backdropUrl} alt={`backdrop-${item.title}`} loading="eager" />
          </div>
        ))}
      </div>
      <div
      onMouseOver={handleStopAutoSlide}
      onMouseLeave={handleResumeAutoSlide}
      onClick={() => handleSlideButton('right')}
      className="carousel-button right">
        <span
        style={{ pointerEvents: "none" }}>
          <ChevronRight size={40} /> 
        </span>
      </div>
    </div>
  );
}
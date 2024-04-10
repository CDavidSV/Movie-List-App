import { useContext, useEffect, useRef, useState } from 'react';
import WatchlistButton from '../watchlist-button-component/watchlist-button';
import FavoriteButton from '../favorite-button-component/favorite-button';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';
import './home-carousel.css';

const getPageNumber = (slide: number, totalSlides: number) => {
  if (slide === 1 || totalSlides === slide) return 1;
  if (slide === 0) return totalSlides - 1;
  return slide;
}

function SliderPagination(props: { slide: number, slides: number, cooldownSec: number, widthPercentage: number, onStop: () => void, onResume: () => void, changeSlide: (slide: number) => void }) {
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
        onMouseOver={mouseOver} 
        onMouseLeave={mouseLeave} 
        key={index} 
        className={`pagination-pill${index + 1 === getPageNumber(props.slide, props.slides + 1) ? ` active${hovered ? " hovered" : ""}` : ""}`}>
          <span className="pagination-pill-completion" style={index + 1 === getPageNumber(props.slide, props.slides + 1) ? {transform: `translateX(-${props.widthPercentage}%)`} : {}}></span>
        </div>
      ))}
    </div>
  );
}

export default function HomeCarousel({ items }: { items: SliderItem[] }) {
  const [slides, setSlides] = useState<SliderItem[]>([]);
  const [completion, setCompletion] = useState<number>(-100);
  const stoppedRef = useRef<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const firstUpdate = useRef<boolean>(true);
  const cooldownSec = 10;
  const timeUntilNextSlide = useRef<number>(cooldownSec * 1000);
  const nextSlideTime = useRef<number>(Date.now() + cooldownSec * 1000);
  const currentSlide = useRef<number>(1);
  const remainingTimeRef = useRef<number>(0);
  const navigate = useNavigate();
  const { loggedIn } = useContext(GlobalContext);

  const changeToCustomSlide = (slide: number) => {
    setCompletion(0);

    const prevSlide = currentSlide.current;
    currentSlide.current = slide;

    if (prevSlide === slides.length - 1) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-${1 * 100}%)`;
    } else {
      carouselRef.current!.style.transition = 'transform 1s ease';
      carouselRef.current!.style.transform = `translateX(-${slide * 100}%)`;
    }

    nextSlideTime.current = Date.now() + cooldownSec * 1000;
  };

  const nextSlide = () => {
    setCompletion(0);

    const prevSlide = currentSlide.current;
    const newSlide = prevSlide < slides.length - 1 ? prevSlide + 1 : 2;

    currentSlide.current = newSlide;
    
    if (prevSlide === slides.length - 1) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-${1 * 100}%)`;
      setTimeout(() => {
        carouselRef.current!.style.transition = `transform 1s ease`;
        carouselRef.current!.style.transform = `translateX(-${newSlide * 100}%)`;
      }, 50);
    } else {
      carouselRef.current!.style.transition = `transform 1s ease`;
      carouselRef.current!.style.transform = `translateX(-${newSlide * 100}%)`;
    }

    nextSlideTime.current = Date.now() + cooldownSec * 1000;
  }

  const prevSlide = () => {
    setCompletion(0);

    const prevSlide = currentSlide.current;
    const newSlide = prevSlide > 0 ? prevSlide - 1 : slides.length - 3;

    currentSlide.current = newSlide;
    
    if (prevSlide === 0) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-${(slides.length - 2) * 100}%)`;
      setTimeout(() => {
        carouselRef.current!.style.transition = `transform 1s ease`;
        carouselRef.current!.style.transform = `translateX(-${newSlide * 100}%)`;
      }, 50);
    } else {
      carouselRef.current!.style.transition = `transform 1s ease`;
      carouselRef.current!.style.transform = `translateX(-${newSlide * 100}%)`;
    }

    nextSlideTime.current = Date.now() + cooldownSec * 1000;
  }

  const handleStopAutoSlide = () => {
    stoppedRef.current = true;
    remainingTimeRef.current = nextSlideTime.current - Date.now();
  }

  const handleResumeAutoSlide = () => {
    stoppedRef.current = false;
    nextSlideTime.current = Date.now() + remainingTimeRef.current;
    requestAnimationFrame(handleAutoSlide);
  }

  const handleAutoSlide = () => {
    if (stoppedRef.current) return;

    timeUntilNextSlide.current = nextSlideTime.current - Date.now();
    setCompletion((timeUntilNextSlide.current / (cooldownSec * 1000)) * 100);

    if (timeUntilNextSlide.current > 0) return requestAnimationFrame(handleAutoSlide);

    const prevSlide = currentSlide.current;
    const newSlide = prevSlide < slides.length - 1 ? prevSlide + 1 : 1;

    nextSlideTime.current = Date.now() + cooldownSec * 1000;
    currentSlide.current = newSlide;
    
    if (prevSlide === slides.length - 1) {
      carouselRef.current!.style.transition = 'none';
      carouselRef.current!.style.transform = `translateX(-${1 * 100}%)`;
      timeUntilNextSlide.current = 0;
      nextSlideTime.current = Date.now();
    } else {
      carouselRef.current!.style.transition = `transform 1s ease`;
      carouselRef.current!.style.transform = `translateX(-${newSlide * 100}%)`;
    }
    
    requestAnimationFrame(handleAutoSlide);
  };

  useEffect(() => { 
    if (firstUpdate.current) {
      setSlides([items[items.length - 1], ...items, items[0]]);
      firstUpdate.current = false;
    }

    if (slides.length === 0) return;
    requestAnimationFrame(handleAutoSlide);
  }, [slides]);

  return (
    <div className="home-carousel">
      <div className="carousel-layout">
        <>
          {slides.map((item, index) => (
            <div 
            key={`${item.title}-${index}`} 
            className={`slide-content-wrapper${index === currentSlide.current ? ' active' : ''}`}>
              <div className="slide-logo">
                <img src={item.logoUrl} alt={`logo-${item.title}`} loading="lazy" />
              </div>
              <div className="slide-general-info">
                <p>{item.description}</p>
              </div>
              <div className="slide-interaction">
                {loggedIn ? (
                  <>
                    <WatchlistButton 
                        size='medium'
                        isWatchlisted={item.inWatchlist || false}
                        mediaId={item.id.toString()}
                        type={item.type}/>  
                    <FavoriteButton 
                        size='medium'
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
              slide={currentSlide.current} 
              slides={items.length} 
              cooldownSec={cooldownSec} 
              widthPercentage={completion} 
              onStop={handleStopAutoSlide} 
              onResume={handleResumeAutoSlide}
              changeSlide={changeToCustomSlide}
              />
          )}
        </>
      </div>
      <div ref={carouselRef} className="carousel-container" style={{transform: `translateX(-${1 * 100}%)`}}>
        {slides.map((item, index) => (
          <div key={`${item.backdropUrl}-${index}`} className="slide">
            <img className="slide-backdrop-img" src={item.backdropUrl} alt={`backdrop-${item.title}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
import { memo, useContext, useEffect, useRef, useState } from 'react';
import WatchlistButton from '../watchlist-button-component/watchlist-button';
import FavoriteButton from '../favorite-button-component/favorite-button';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';
import { saveSearchResult, shortenNumber } from '../../helpers/util.helpers';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './home-carousel.css';

const Logo = ({ title, logoUrl }: { title: string, logoUrl: string }) => {
  const [logoError, setLogoError] = useState<boolean>(true);

  return (
    <>
      {logoError ? (
        <h1 className='text-xl sm:text-3xl md:text-6xl'>{title}</h1>
      ) : (
        <img src={logoUrl} alt={`logo-${title}`} loading="eager" onError={() => setLogoError(true)} />
      )}
    </>
  );
}

const SliderPagination = memo((props: { slide: number, slides: number, cooldownSec: number, widthPercentage: number, stopped: boolean, onStop: () => void, onResume: () => void, changeSlide: (slide: number) => void }) => {
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
      {Array.from({ length: props.slides }, (_, index) => (
        <div
        onClick={() => props.changeSlide(index + 1)}
        onMouseEnter={mouseOver}
        onMouseOut={mouseLeave}
        key={index}
        className={`pagination-pill${index + 1 === props.slide ? ` active${hovered || props.stopped ? " hovered" : ""}` : ""}`}>
          <span className="pagination-pill-completion" style={index + 1 === props.slide ? {transform: `translateX(-${props.widthPercentage}%)`} : {}}></span>
        </div>
      ))}
    </div>
  );
});

export default function HomeCarousel({ items }: { items: SliderItem[] }) {
  const cooldownSec = 12;
  const stoppedRef = useRef<boolean>(false);
  const timeUntilNextSlide = useRef<number>(cooldownSec * 1000);
  const nextSlideTime = useRef<number>(Date.now() + cooldownSec * 1000);
  const remainingTimeRef = useRef<number>(0);

  const [activeSlide, setActiveSlide] = useState<number>(1);
  const [slides, setSlides] = useState<SliderItem[]>(items);
  const [completion, setCompletion] = useState<number>(-100);
  const [buttonHovered, setButtonHovered] = useState<boolean>(false);

  const navigate = useNavigate();
  const { loggedIn } = useContext(GlobalContext);

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
      return setTimeout(handleAutoSlide, 50);
    }

    nextSlideTime.current = Date.now() + cooldownSec * 1000;
    handleSlideChange('right');
    setTimeout(handleAutoSlide, 50);
  };

  const handleSlideChange = (direction: 'left' | 'right') => {
    setActiveSlide(prev => {
      const slide = prev + (direction === 'right' ? 1 : -1);

      if (slide > slides.length) {
        return 1;
      }
      if (slide < 1) {
        return slides.length;
      }

      setCompletion(0);
      return slide;
    });
  }

  const saveSearch = (item: SliderItem) => {
    saveSearchResult(item.title, item.id.toString(), item.type, `/media/${item.type}/${item.id}`)
  }

  useEffect(() => {
      if (items.length === 0) return;
      setSlides(items);

      handleAutoSlide();
  }, [items]);

  return (
    <div className="home-carousel">
      <div className="carousel-layout">
        <>
          {slides.length > 0 && slides.map((item, index) => (
            <div
            key={`${item.title}-${index}`}
            className={`slide-content-wrapper${index + 1 === activeSlide ? ' active' : ''}`}>
              <div className="slide-logo">
                <Link
                  className="media-link"
                  onClick={() => saveSearch(item)}
                  onAuxClick={() => saveSearch(item)}
                  to={`/media/${item.type}/${item.id}`}/>
                <Logo title={item.title} logoUrl={item.logoUrl} />
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
              slides={slides.length}
              cooldownSec={cooldownSec}
              widthPercentage={completion}
              stopped={buttonHovered}
              onStop={handleStopAutoSlide}
              onResume={handleResumeAutoSlide}
              changeSlide={(slide) => {
                setActiveSlide(slide);
                setCompletion(0);
                remainingTimeRef.current = cooldownSec * 1000;
              }}
              />
          )}
        </>
      </div>
      <div
      onMouseOver={handleStopAutoSlide}
      onMouseLeave={handleResumeAutoSlide}
      onClick={() => handleSlideChange('left')}
      className="carousel-button left">
        <span
        style={{ pointerEvents: "none" }}>
          <ChevronLeft size={40} />
        </span>
      </div>
      <div className="carousel-container">
        <div className="images-wrapper">
          {slides.map((item, index) => (
            <div key={`${item.backdropUrl}-${index}`} className={`slide${index + 1 === activeSlide ? ' active' : ''}`}>
              <img className="slide-backdrop-img" src={item.backdropUrl} alt={`backdrop-${item.title}`} loading="eager" />
            </div>
          ))}
        </div>
      </div>
      <div
      onMouseOver={handleStopAutoSlide}
      onMouseLeave={handleResumeAutoSlide}
      onClick={() => handleSlideChange('right')}
      className="carousel-button right">
        <span
        style={{ pointerEvents: "none" }}>
          <ChevronRight size={40} />
        </span>
      </div>
    </div>
  );
}

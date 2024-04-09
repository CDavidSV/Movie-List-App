import { useCallback, useEffect, useRef, useState } from 'react';
import './home-carousel.css';

function Slide(props: SliderItem) {
  return (
    <div className="slide">
      <div className="slide-content-wrapper">
        <div className="slide-logo">
          <img src={props.logoUrl} alt={`logo-${props.title}`} loading="lazy" />
        </div>
        <div className="slide-general-info">
          <p>{props.description}</p>
        </div>
        <div className="slide-controlls">

        </div>
      </div>

      <img className="slide-backdrop-img" src={props.backdropUrl} alt={`backdrop-${props.title}`} />
    </div>
  );
}

export default function HomeCarousel({ items }: { items: SliderItem[] }) {
  const [slide, setSlide] = useState(0);
  const [slides, setSlides] = useState<SliderItem[]>(items);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firstUpdate = useRef(true);
  const cooldownSec = 10;
  
  const handleAutoSlide = useCallback(() => {
    setSlide((prevSlide) => {
      const newSlide = prevSlide < slides.length - 1 ? prevSlide + 1 : 1;
      console.log('new slide', newSlide);

      if (timeoutRef.current) clearTimeout(timeoutRef.current!);

      if (prevSlide === slides.length - 1) {
        carouselRef.current!.style.transition = 'none';
        timeoutRef.current = setTimeout(() => handleAutoSlide(), 0);
      } else {
        carouselRef.current!.style.transition = `transform 1s ease`;
        timeoutRef.current = setTimeout(() => handleAutoSlide(), cooldownSec * 1000);
      }
      
      return newSlide;
    });

  }, [slides]);

  useEffect(() => { 
    if (firstUpdate.current) {
      setSlides([items[items.length - 1], ...items, items[0]]);
      firstUpdate.current = false;
    }

    timeoutRef.current = setTimeout(handleAutoSlide, cooldownSec * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current!);
    }
  }, [handleAutoSlide]);

  return (
    <div ref={carouselRef} className="home-carousel" style={carouselRef.current ? {transform: `translateX(-${slide * 100}%)`} : {}}>
      {slides.map((item, index) => (
        <div key={`${item.id}-${item.title}-${index}`} className="slide">
          <img className="slide-backdrop-img" src={item.backdropUrl} alt={`backdrop-${item.title}`} />
        </div>
      ))}
    </div>
  );
}
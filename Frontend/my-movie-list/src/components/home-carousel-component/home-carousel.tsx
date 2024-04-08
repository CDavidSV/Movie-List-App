import { useEffect, useRef, useState } from 'react';
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
  const [style, setStyle] = useState({} as React.CSSProperties);
  const [slides, setSlides] = useState<SliderItem[]>(items);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const firstUpdate = useRef(true);
  const cooldown = useRef(5000);
  
  useEffect(() => { 
    if (firstUpdate.current) {
      setSlides([items[items.length - 1], ...items, items[0]]);
      firstUpdate.current = false;
    }
    
    intervalRef.current = setInterval(() => {
      changeSlide('right');

    }, cooldown.current);

    return () => {
      clearInterval(intervalRef.current!);
    }
  }, [slides]);


  const changeSlide = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSlide((prevSlide) => {
        const newSlide = prevSlide - 1 > 0 ? prevSlide - 1 : items.length - 1;

        setStyle({ transform: `translateX(-${newSlide * 2 * 100}%)`, transition: `${newSlide === 0 ? 'none' : 'transform 1s ease'}`});
        return newSlide;
      });
    } else {
      setSlide((prevSlide) => {
        const newSlide = prevSlide + 1 < slides.length - 1 ? prevSlide + 1 : 0;
        setStyle({ transform: `translateX(-${newSlide * 2 * 100}%)`, transition: `${newSlide === 0 ? 'none' : 'transform 1s ease'}`});
        return newSlide;
      });
    }
  };
  return (
    <div ref={carouselRef} className="home-carousel" style={carouselRef.current ? style : {}}>
      {slides.map((item, index) => (
        <div key={`${item.id}-${item.title}-${index}`} className="slide">
          <img className="slide-backdrop-img" src={item.backdropUrl} alt={`backdrop-${item.title}`} />
        </div>
      ))}
    </div>
  );
}
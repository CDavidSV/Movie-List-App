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
  return (
    <div className="home-carousel">
      <Slide
        id={items[0].id}
        backdropUrl={items[0].backdropUrl}
        posterUrl={items[0].posterUrl}
        releaseDate={items[0].releaseDate}
        logoUrl={items[0].logoUrl}
        title={items[0].title}
        type={items[0].type}
        voteAverage={items[0].voteAverage}
        votes={items[0].votes}
        description={items[0].description}
      />
    </div>
  );
}
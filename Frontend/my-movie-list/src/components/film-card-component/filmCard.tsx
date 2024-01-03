import config from '../../config/config';
import './filmCard.css';

export default function FilmCard(props: {title: string, poster: string, date: string}) {
    return (
        <div className="film-card">
            <figure className="poster-image-figure">
                <img src={`${config.tmbdImageBaseUrl}${props.poster}`}/>
            </figure>
            <div className="card-info">
                <h4>{props.title}</h4>
                <p>{props.date}</p>
            </div>
        </div>
    );
}
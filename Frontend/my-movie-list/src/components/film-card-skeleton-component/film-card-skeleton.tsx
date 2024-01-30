import "./film-card-skeleton.css";

export default function FilmCardSkeleton() {
    return (
        <div className="film-skeleton-loader">
            <div className="skeleton-poster"></div>
            <div className="skeleton-info">
                <div className="card-info skeleton-title"></div>
                <div className="skeleton-release-date"></div>
            </div>
        </div>
    );
}
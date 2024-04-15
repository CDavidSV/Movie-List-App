import { useState, useEffect, useContext } from "react";
import FilmSlider from "../../components/film-slider-component/filmSlider";
import PersonalListsProvider from "../../contexts/PersonalListsContext";
import HomeCarousel from "../../components/home-carousel-component/home-carousel";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import "./home.css";
import { ScrollRestoration } from "react-router-dom";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<FilmCardProps[]>([]);
    const [upcoming, setUpcoming] = useState<FilmCardProps[]>([]);
    const [topRated, setTopRated] = useState<FilmCardProps[]>([]);
    const [watchlist, setWatchlist] = useState<FilmCardProps[]>([]);
    const [carouselData, setCarouselData] = useState<SliderItem[]>([]);
    const { loggedIn, mml_api, mml_api_protected, getSavedItems } = useContext(GlobalContext);
    const toast = useContext(ToastContext);

    const parseFilmData = (film: any): FilmCardProps[] => {
        return film.map((film: any) => {
            return {
                filmData: {
                    id: film.id,
                    type: "movie",
                    posterUrl: film.posterUrl,
                    title: film.title,
                    releaseDate: film.releaseDate,
                    description: film.description,
                    voteAverage: film.voteAverage,
                    votes: film.votes
                } as FilmCardData,
                inWatchlist: film.inWatchlist,
                inFavorites: film.inFavorites,
                searchResult: false
            } as FilmCardProps;
        });
    }

    useEffect((() => {
        document.title = "My Movie List";

        mml_api.get("api/v1/media/movies/home-carousel").then((response) => {
            setCarouselData(response.data.responseData);
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setCarouselData(films);
            });
        }).catch(() => {
            toast.open("Error loading carousel data", "error");
        });

        mml_api.get("api/v1/media/movies/popular").then((response) => {
            setPopularMovies(parseFilmData(response.data.responseData));
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setPopularMovies(parseFilmData(films));
            });
        }).catch(() => {
            toast.open("Error loading popular movies", "error");
        });

        mml_api.get("api/v1/media/movies/upcoming").then((response) => {
            setUpcoming(parseFilmData(response.data.responseData));
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setUpcoming(parseFilmData(films));
            });
        }).catch(() => {
            toast.open("Error loading upcoming movies", "error");
        });

        mml_api.get("api/v1/media/movies/top-rated").then((response) => {
            setTopRated(parseFilmData(response.data.responseData));
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setTopRated(parseFilmData(films));
            });
        }).catch(() => {
            toast.open("Error loading top rated movies", "error");
        });

        if (!loggedIn) return;

        mml_api_protected.get(`api/v1/watchlist?status=3`).then((response) => {
            setWatchlist(response.data.responseData.watchlist.map((film: any) => {
                return {
                    filmData: {
                        id: film.media_id,
                        type: film.type,
                        posterUrl: film.posterUrl,
                        title: film.title,
                        releaseDate: film.releaseDate,
                        description: film.description
                    } as FilmCardData,
                    inWatchlist: true,
                    inFavorites: film.favorited,
                } as FilmCardProps;
            }));
        });
    }), []);

    return (
        <PersonalListsProvider>
            <ScrollRestoration />
            <div className="content">
                <div className="sliders-container">
                    { carouselData.length > 0 ? <HomeCarousel items={carouselData}/> : <div className="skeleton-carousel"></div> }
                    <div style={{ top: "-125px", position: "relative", zIndex: 3 }}>
                        <FilmSlider title="Popular" filmArr={popularMovies}/>
                        <FilmSlider title="Upcoming" filmArr={upcoming}/>
                        {watchlist.length > 0 && <FilmSlider title="Your Watchlist" filmArr={watchlist}/>}
                        <FilmSlider title="Top Rated" filmArr={topRated}/>
                    </div>
                </div>
            </div>
        </PersonalListsProvider>
    );
}
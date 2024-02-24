import { useState, useEffect } from "react";
import { mml_api, mml_api_protected } from "../../axios/mml_api_intances";
import FilmSlider from "../../components/film-slider-component/filmSlider";
import { getSavedItems } from "../../helpers/util.helpers";
import "./home.css";
import { isLoggedIn } from "../../helpers/session.helpers";
import PersonalListsProvider from "../../contexts/PersonalListsContext";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<FilmCardProps[]>([]);
    const [upcoming, setUpcoming] = useState<FilmCardProps[]>([]);
    const [topRated, setTopRated] = useState<FilmCardProps[]>([]);
    const [watchlist, setWatchlist] = useState<FilmCardProps[]>([]);

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

        mml_api.get("api/v1/media/movies/popular").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setPopularMovies(parseFilmData(films));
            });
        });

        mml_api.get("api/v1/media/movies/upcoming").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setUpcoming(parseFilmData(films));
            });
        });

        mml_api.get("api/v1/media/movies/top-rated").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                setTopRated(parseFilmData(films));
            });
        });

        if (!isLoggedIn()) return;

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
            <div className="content">
                <div className="sliders-container">
                    <FilmSlider title="Popular" filmArr={popularMovies}/>
                    <FilmSlider title="Upcoming" filmArr={upcoming}/>
                    {watchlist.length > 0 && <FilmSlider title="Your Watchlist" filmArr={watchlist}/>}
                    <FilmSlider title="Top Rated" filmArr={topRated}/>
                </div>
            </div>
        </PersonalListsProvider>
    );
}
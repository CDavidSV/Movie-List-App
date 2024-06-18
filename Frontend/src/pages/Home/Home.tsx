import { useState, useEffect, useContext } from "react";
import FilmSlider from "../../components/film-slider-component/filmSlider";
import PersonalListsProvider from "../../contexts/PersonalListsContext";
import HomeCarousel from "../../components/home-carousel-component/home-carousel";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { ScrollRestoration } from "react-router-dom";
import { MediaContext } from "../../contexts/MediaContext";
import { LoaderCircle } from "lucide-react";
import "./home.css";

export default function Home() {
    const { homeData, setHomeData } = useContext(MediaContext);
    const { loggedIn, mml_api, mml_api_protected, getSavedItems } = useContext(GlobalContext);

    const [popularMovies, setPopularMovies] = useState<FilmCardProps[]>([]);
    const [upcoming, setUpcoming] = useState<FilmCardProps[]>([]);
    const [topRated, setTopRated] = useState<FilmCardProps[]>([]);
    const [watchlist, setWatchlist] = useState<FilmCardProps[]>([]);
    const [carouselData, setCarouselData] = useState<SliderItem[]>([]);
    const toast = useContext(ToastContext);

    const parseFilmData = (film: any): FilmCardProps[] => {
        return film.map((film: any) => {
            return {
                filmData: {
                    id: film.id || film.media_id,
                    type: film.type || "movie",
                    posterUrl: film.posterUrl,
                    title: film.title,
                    releaseDate: film.releaseDate,
                    description: film.description,
                    voteAverage: film.voteAverage,
                    votes: film.votes
                } as FilmCardData,
                inWatchlist: film.inWatchlist !== undefined ? film.inWatchlist : true,
                inFavorites: film.inFavorites || film.favorited,
                searchResult: false
            } as FilmCardProps;
        });
    }
    
    const fetchHandler = {
        carouselData: async () => {
            await mml_api.get("api/v1/media/movies/home-carousel").then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setCarouselData(films);
                });
            });
        },
        popularMovies: async () => {
            await mml_api.get("api/v1/media/movies/popular").then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setPopularMovies(parseFilmData(films));
                });
            });
        },
        upcoming: async () => {
            await mml_api.get("api/v1/media/movies/upcoming").then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setUpcoming(parseFilmData(films));
                });
            });
        },
        topRated: async () => {
            await mml_api.get("api/v1/media/movies/top-rated").then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setTopRated(parseFilmData(films));
                });
            });
        },
        watchlist: async () => {
            if (!loggedIn) return;

            await mml_api_protected.get(`api/v1/watchlist?status=3`).then((response) => {
                setWatchlist(parseFilmData(response.data.responseData.watchlist));
            });
        }
    }

    useEffect(() => {  
        setHomeData((prev) => ({
            carouselData: carouselData || prev?.carouselData || [],
            popularMovies: popularMovies || prev?.popularMovies || [],
            upcoming: upcoming || prev?.upcoming || [],
            topRated: topRated || prev?.topRated || [],
            watchlist: watchlist || prev?.watchlist || []
        }));
    }, [carouselData, popularMovies, upcoming, topRated, watchlist]);

    useEffect((() => {
        document.title = "My Movie List";

        setCarouselData(homeData?.carouselData || []);
        setPopularMovies(homeData?.popularMovies || []);
        setUpcoming(homeData?.upcoming || []);
        setTopRated(homeData?.topRated || []);
        setWatchlist(homeData?.watchlist || []);

        if (!homeData) return
        const promises: Promise<void>[] = [];

        Object.entries(fetchHandler).forEach(([key, fetchFunction]) => {
            if (!homeData[key as keyof HomeData]?.length) {
                promises.push(fetchFunction());
            }
        });

        Promise.all(promises).catch(() => {
            toast.open("An error ocurred while loading your home page", "error");
        });
    }), []);

    return (
        <PersonalListsProvider>
            <ScrollRestoration />
            <div className="content">
                <div className="sliders-container">
                    { carouselData.length ? <HomeCarousel items={carouselData}/> : 
                    <>
                        <div className="skeleton-carousel flex justify-center items-center">
                            <LoaderCircle className="animate-spin" size={40} />
                        </div>
                    </>
                    }
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
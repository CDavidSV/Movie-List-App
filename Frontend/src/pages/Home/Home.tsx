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
    const { loggedIn, mml_api, mml_api_protected, getSavedItems, userData } = useContext(GlobalContext);
    const toast = useContext(ToastContext);

    const [homeState, setHomeState] = useState<HomeData>({
        carouselData: [],
        popularMovies: [],
        upcoming: [],
        topRated: [],
        watchlist: []
    });
    const [loading, setLoading] = useState<boolean>(false);

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
            await mml_api.get(`api/v1/media/movies/home-carousel?mature_content=${userData?.matureContent}`).then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setHomeState((prev) => ({
                        ...prev,
                        carouselData: films
                    }));
                });
            });
        },
        popularMovies: async () => {
            await mml_api.get(`api/v1/media/movies/popular?mature_content=${userData?.matureContent}`).then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setHomeState((prev) => ({
                        ...prev,
                        popularMovies: parseFilmData(films)
                    }));
                });
            });
        },
        upcoming: async () => {
            await mml_api.get(`api/v1/media/movies/upcoming?mature_content=${userData?.matureContent}`).then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setHomeState((prev) => ({
                        ...prev,
                        upcoming: parseFilmData(films)
                    }));
                });
            });
        },
        topRated: async () => {
            await mml_api.get(`api/v1/media/movies/top-rated?mature_content=${userData?.matureContent}`).then((response) => {
                getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                    setHomeState((prev) => ({
                        ...prev,
                        topRated: parseFilmData(films)
                    }));
                });
            });
        },
        watchlist: async () => {
            if (!loggedIn) return;

            await mml_api_protected.get(`api/v1/watchlist?status=3`).then((response) => {
                setHomeState((prev) => ({
                    ...prev,
                    watchlist: parseFilmData(response.data.responseData.watchlist)
                }));
            });
        }
    }

    useEffect(() => {
        setHomeData(homeState);
    }, [homeState]);

    useEffect((() => {
        document.title = "My Movie List";

        if (!homeData) return
        setHomeState(homeData);
        
        const promises: Promise<void>[] = [];

        Object.entries(fetchHandler).forEach(([key, fetchFunction]) => {
            if (!homeData[key as keyof HomeData]?.length) {
                promises.push(fetchFunction());
            }
        });

        if (!promises.length) return;
        setLoading(true);
        Promise.all(promises).catch(() => {
            toast.open("An error ocurred while loading your home page", "error");
        }).finally(() => {
            setLoading(false);
        });
    }), []);

    return (
        <PersonalListsProvider>
            <ScrollRestoration />
            <div className="content">
                <div className="sliders-container">
                    { homeState.carouselData.length ? <HomeCarousel items={homeState.carouselData}/> : loading ?
                    <>
                        <div className="skeleton-carousel flex justify-center items-center">
                            <LoaderCircle className="animate-spin" size={40} />
                        </div>
                    </>
                    : <div className="skeleton-carousel flex justify-center items-center"></div>
                    }
                    <div style={{ top: "-125px", position: "relative", zIndex: 3 }}>
                        <FilmSlider title="Popular" filmArr={homeState.popularMovies}/>
                        <FilmSlider title="Upcoming" filmArr={homeState.upcoming}/>
                        {homeState.watchlist.length > 0 && <FilmSlider title="Your Watchlist" filmArr={homeState.watchlist}/>}
                        <FilmSlider title="Top Rated" filmArr={homeState.topRated}/>
                    </div>
                </div>
            </div>
        </PersonalListsProvider>
    );
}
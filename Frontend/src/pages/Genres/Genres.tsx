import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageNotFound from "../PageNotFound/PageNotFound";
import FilmCard from "../../components/film-card-component/filmCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import {
    Clapperboard,
    Zap,
    Map,
    Brush,
    Drama,
    Laugh,
    Siren,
    FileVideo2,
    Heart,
    Baby,
    WandSparkles,
    BookOpenText,
    Ghost,
    Music,
    MessageCircleQuestion,
    Rocket,
    Skull,
    Swords,
    CircleDollarSign
} from "lucide-react";

interface GenreInfo {
    icon: JSX.Element;
    message: string;
}

interface GenreMap {
    [key: string]: GenreInfo;
}

const genereMap: GenreMap = {
    "Action": {
        icon: <Zap size={40} />,
        message: "For all the adrenaline junkies out there!"
    },
    "Adventure": {
        icon: <Map size={40} />,
        message: "For those who love to exploration!"
    },
    "Animation": {
        icon: <Brush size={40} />,
        message: "Magical worlds brought to life with colorful characters and incredible stories."
    },
    "Comedy": {
        icon: <Laugh size={40} />,
        message: "Laughter guaranteed! Hilarious mishaps and funny moments that tickle your funny bone."
    },
    "Crime": {
        icon: <Siren size={40} />,
        message: "Heists, detectives, and the ultimate game of cat and mouse. Whodunit?"
    },
    "Documentary": {
        icon: <FileVideo2 size={40} />,
        message: "Real-life stories, fascinating facts, and a closer look at the world around us."
    },
    "Drama": {
        icon: <Drama size={40} />,
        message: "Deep emotions, intense conflicts, and stories that tug at your heartstrings."
    },
    "Family": {
        icon: <Baby size={40} />,
        message: "Fun for the whole family! Movies that bring everyone together."
    },
    "Fantasy": {
        icon: <WandSparkles size={40} />,
        message: "Wizards, dragons, and mythical realms where anything is possible."
    },
    "History": {
        icon: <BookOpenText size={40} />,
        message: "Step back in time to epic events and legendary figures that shaped our world."
    },
    "Horror": {
        icon: <Ghost size={40} />,
        message: "Spooky thrills, chilling screams, and the stuff of nightmares. Don't watch alone!"
    },
    "Music": {
        icon: <Music />,
        message: "Toe-tapping tunes, incredible performances, and the power of song."
    },
    "Mystery": {
        icon: <MessageCircleQuestion size={40} />,
        message: "Puzzling plots, hidden clues, and the thrill of solving the unknown."
    },
    "Romance": {
        icon: <Heart size={40} />,
        message: "Heartfelt love stories, swoon-worthy moments, and happily ever afters... Sometimes."
    },
    "Science Fiction": {
        icon: <Rocket size={40} />,
        message: "Space adventures, futuristic technology, and mind-bending concepts that push the boundaries of reality."
    },
    "Thriller": {
        icon: <Skull size={40} />,
        message: "Nail-biting suspense, heart-pounding action, and edge-of-your-seat excitement."
    },
    "War": {
        icon: <Swords size={40} />,
        message: "Epic battles, heroic sacrifices, and the human cost of conflict."
    },
    "Western": {
        icon: <CircleDollarSign size={40} />,
        message: "Dusty trails, showdowns at high noon, and the spirit of the Wild West."
    }
}

export default function Genres() {
    const { genreName } = useParams<{ genreName: string }>();
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const { getSavedItems, mml_api, userData } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `${genreName} | My Movie List`;

        setPage(1);
        setMedia([]);
        setLoading(true);

        mml_api.get(`api/v1/media/movies/genres?name=${genreName}&mature_content=${userData?.matureContent}`).then((response) => {
            setLoading(false);

            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type})), (films: any) => {
                setMedia(films);
            });
        }).catch(() => {
            toast.open("Error loading genre", "error");
            navigate("/genres");
        });
    }, [navigate, genreName]);

    const getNextPage = () => {
        const nextPage = page + 1;

        setLoading(true);
        mml_api.get(`api/v1/media/movies/genres?name=${genreName}&page=${nextPage}&mature_content=${userData?.matureContent}`).then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => ({ id: film.id, type: film.type})), (films: any) => {
                setMedia((prev) => [...prev, ...films]);
            });
            setPage(nextPage);
            setLoading(false);
        }).catch(() => {
            toast.open("Error loading genre", "error");
            setLoading(false);
        });
    }

    useInfiniteScroll(() => getNextPage(), loading);

    if (!genreName) return <PageNotFound />;

    return (
        <div className="content">
            <div className="page-title-container flex flex-col mt-6">
                <div className="flex gap-4">
                    {genereMap[genreName] ? genereMap[genreName].icon : <Clapperboard size={40} /> }
                    <h1 className="m-0">{genreName}</h1>
                </div>
                <p className="text-center">{genereMap[genreName] ? genereMap[genreName].message: ""}</p>
            </div>
            <div className="content-wrapper">
                <div className="movies-container">
                    {media.map((movie: any, index) => (
                        <FilmCard
                            key={`${index}.${movie.id}`}
                            filmData={movie}
                            inWatchlist={movie.inWatchlist}
                            inFavorites={movie.inFavorites}
                            searchResult={false}/>
                    ))}
                </div>
                <div className={loading ? "loader active" : "loader"}><div className="spinning-loader"></div></div>
            </div>
        </div>
    );
}

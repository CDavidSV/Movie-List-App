import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { calculateMovieRuntime } from "../../helpers/util.helpers";
import WatchlistProgress from "../../components/watchlist-progress-component/watchlist-progress";
import FavoriteButton from "../../components/favorite-button-component/favorite-button";
import PersonCard from "../../components/person-card-component/person-card";
import { GlobalContext } from "../../contexts/GlobalContext";
import FilmSlider from "../../components/film-slider-component/filmSlider";
import PageNotFound from "../PageNotFound/PageNotFound";
import Modal from "../../components/modal-component/modal";
import { MediaContext } from "../../contexts/MediaContext";
import { ToastContext } from "../../contexts/ToastContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlay } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import "./media.css";
import TabHandler from "@/components/tab-handler/tab-handler";

function SidebarSection(props: { title: string, children: React.ReactNode }) {
    return (
        <div className="sidebar-section">
            <h5 className="title">{props.title}</h5>
            {props.children}
        </div>
    );
}

function InteractiveMediaOptions(props: { mediaId: string, type: string, totalProgress: number }) {
    const [watchlistStatus, setWatchlistStatus] = useState<number>(1); // 0 = watching, 1 = plan to watch, 2 = finished
    const [itemProgress, setItemProgress] = useState<{ progress: number, totalProgress: number }>({ progress: 0, totalProgress: props.totalProgress });
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
    const [inFavorites, setInFavorites] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { loggedIn, mml_api_protected, setWatchlist } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loggedIn) return;

        mml_api_protected.post(`/api/v1/user/status-in-personal-lists?media_id=${props.mediaId}&type=${props.type}`).then((response) => {
            const responseData = response.data.responseData;

            if (responseData.watchlist) {
                const status = responseData.watchlist.status;
                const progress = responseData.watchlist.progress;
                const totalProgress = responseData.watchlist.totalProgress;

                setWatchlistStatus(status);
                setIsWatchlisted(true);
                setItemProgress({ progress: progress, totalProgress: totalProgress });
            }

            if (responseData.favorite) {
                setInFavorites(true);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            toast.open("Error loading watchlist status", "error");
        });
    }, []);

    const handleAddToWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsWatchlisted(true);

        setWatchlist(props.mediaId, props.type, 1, 0).then(() => {
            setIsWatchlisted(true);
        }).catch(() => {
            setIsWatchlisted(false);
        });
    }

    const handleStatusSelect = (value: string) => {
        let status = parseInt(value);
        const prevStatus = watchlistStatus;
        setWatchlistStatus(status);

        let newProgress = itemProgress.progress;
        if (status === 2) {
            newProgress = props.type === 'movie' ? 1 : props.totalProgress;
        }

        setWatchlist(props.mediaId, props.type, status, newProgress).then(() => {
            if (status === 2) {
                setItemProgress({ ...itemProgress, progress: props.totalProgress });
            }
        }).catch(() => {
            setWatchlistStatus(prevStatus);
        });
    }

    const updateProgress = (newProgress: number) => {
        let status = 0;
        if (newProgress === itemProgress.totalProgress) {
            status = 2;
        };

        setItemProgress({ ...itemProgress, progress: newProgress });
        setWatchlist(props.mediaId, props.type, status, newProgress).then(() => {
            setWatchlistStatus(status);
        });
    }

    return (
        <div className="film-interaction-container">
            {loggedIn ?
                <div className={loading ? "film-interaction disabled" : "film-interaction"}>
                    <FavoriteButton size={36} mediaId={props.mediaId} type={props.type} isFavorite={inFavorites}/>
                    {isWatchlisted ?
                        <>
                            <Select value={watchlistStatus.toString()} onValueChange={handleStatusSelect}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="watchlist-status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Watching</SelectItem>
                                    <SelectItem value="1">Plan to Watch</SelectItem>
                                    <SelectItem value="2">Finished</SelectItem>
                                </SelectContent>
                            </Select>
                            <WatchlistProgress
                                progressState={itemProgress}
                                mediaId={props.mediaId}
                                type={props.type}
                                updateProgress={updateProgress}/>
                        </>
                        :
                        <button className="button primary" onClick={handleAddToWatchlist}>Add to Watchlist</button>
                    }
                </div>
                :
                <button className="button primary" onClick={() => navigate("/signup")}>Sign Up to add to watchlist</button>
            }
        </div>
    );
}

function Overview({ mediaData, recommendations }: { mediaData: any, recommendations: FilmCardProps[] }) {
    return (
        <>
            {mediaData.castMembers.length > 0 &&
                <>
                    <h3>Cast</h3>
                    <div className="credits-container">
                        {mediaData.castMembers.map((person: any) =>
                            <PersonCard
                                key={`${person.id}.${person.character}`}
                                id={person.id}
                                name={person.name}
                                character={person.character}
                                profileUrl={person.profilePath}
                            />)}
                    </div>
                </>}
            {mediaData.crewMembers.length > 0 &&
                <>
                    <h3>Crew</h3>
                    <div className="credits-container">
                        {mediaData.crewMembers.map((person: any) =>
                            <PersonCard
                                key={`${person.id}.${person.job}`}
                                id={person.id}
                                name={person.name}
                                character={person.job}
                                profileUrl={person.profilePath}
                            />)}
                    </div>
                </>}
            {mediaData.trailer && mediaData.trailer.site === "YouTube" &&
                <>
                    <h3>Trailer</h3>
                    <iframe className="youtube-video-container"
                        key={`${mediaData.trailer.key}`}
                        title={mediaData.trailer.name}
                        src={`https://www.youtube.com/embed/${mediaData.trailer.key}?autoplay=0`}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowFullScreen
                        loading="lazy"
                        style={{ maxWidth: "450px", borderRadius: "10px" }}/>
                </>}
            {mediaData.recommendations.length > 0 &&
                <>
                    <h3>Recommended</h3>
                    <FilmSlider key={`${mediaData.id}.${mediaData.type}`} filmArr={recommendations}/>
                </>}
        </>
    );
}

function Images({ type, id }: { type: string, id: string }) {
    const [images, setImages] = useState<any>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const toast = useContext(ToastContext);
    const { mml_api, userData } = useContext(GlobalContext);

    useEffect(() => {
        mml_api.get(`/api/v1/media/${type}/${id}/images?mature_content=${userData?.matureContent}`).then((response) => {
            setImages(response.data.responseData);
            setSelectedImages(response.data.responseData.backdrops);
        }).catch(() => {
            toast.open("Error loading images", "error");
        });
    }, [type, id]);

    const handleSelectImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowModal(true);
    }

    const handleSelectType = (value: string) => {
        if (images) setSelectedImages(images[value]);
    }

    return (
        <>
            <div>
                <Modal background={false} open={showModal} onClose={() => setShowModal(false)}>
                    <div>
                        <img src={selectedImage} alt="selected-image" style={{ objectFit: "contain", maxHeight: "800px", maxWidth: "1300px", width: "100%" }}/>
                    </div>
                </Modal>
                <Select defaultValue="backdrops" onValueChange={handleSelectType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="image" />
                    </SelectTrigger>
                    <SelectContent ref={(ref) => ref?.addEventListener('touchend', (e) => e.preventDefault())}>
                        <SelectItem value="backdrops">Backdrops</SelectItem>
                        <SelectItem value="posters">Posters</SelectItem>
                        <SelectItem value="logos">Logos</SelectItem>
                    </SelectContent>
                </Select>
                <div className="imgs-container">
                    {selectedImages.map((backdrop: any) => (
                        <div key={backdrop.previewFilePath} className="image-wrapper" onClick={() => handleSelectImage(backdrop.originalFilePath)}>
                            <img loading="lazy" key={backdrop.previewFilePath} src={backdrop.previewFilePath} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

function Videos({ type, id }: { type: string, id: string }) {
    const [videos, setVideos] = useState<any[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<{ name: string, key: string } | null>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const toast = useContext(ToastContext);
    const { mml_api } = useContext(GlobalContext);

    useEffect(() => {
        mml_api.get(`/api/v1/media/${type}/${id}/videos`).then((response) => {
            setVideos(response.data.responseData);
        }).catch(() => {
            toast.open("Error loading videos", "error");
        });
    }, [type, id]);

    const handleSelectVideo = (key: string, name: string) => {
        setSelectedVideo({ name: name, key: key });
        setShowModal(true);
    }

    return (
        <div className="videos-container">
            <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            style={{ width: "95%", minWidth: "200px", maxWidth: "1300px" }}>
                <div className="video-preview-modal">
                    { selectedVideo &&
                        <iframe className="youtube-video-container"
                            key={`${selectedVideo.key}`}
                            title={selectedVideo.name}
                            src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=0`}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-presentation"
                            allowFullScreen
                            loading="lazy"/>
                    }
                </div>
            </Modal>
            {videos.map((video: any) => (
                <div key={video.key} className="video-card">
                    <div className="video-thumbnail" onClick={() => handleSelectVideo(video.key, video.name)}>
                        <span className="play-btn material-icons">
                            <CirclePlay size={45} />
                        </span>
                        <img src={video.thumbnail} alt={video.name} loading="lazy" />
                    </div>
                    <div className="video-details">
                        <h4>{video.name}</h4>
                        <p>{video.site}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Cast({ type, id }: { type: string, id: string }) {
    const [cast, setCast] = useState<any[]>([]);
    const toast = useContext(ToastContext);
    const { mml_api } = useContext(GlobalContext);

    useEffect(() => {
        mml_api.get(`/api/v1/media/${type}/${id}/cast`).then((response) => {
            setCast(response.data.responseData);
        }).catch(() => {
            toast.open("Error loading cast data", "error");
        });
    }, [type, id]);

    return (
        <div className="cast-tab-container">
            {cast.map((person: any) =>
                <PersonCard
                    key={`${person.id}.${person.character}`}
                    id={person.id}
                    name={person.name}
                    character={person.character}
                    profileUrl={person.profilePath}
                />
            )}
        </div>
    );
}

function Crew({ type, id }: { type: string, id: string }) {
    const [crew, setCrew] = useState<{ name: string, members: any[] }[]>([]);
    const toast = useContext(ToastContext);
    const { mml_api } = useContext(GlobalContext);

    useEffect(() => {
        mml_api.get(`/api/v1/media/${type}/${id}/crew`).then((response) => {
            const crew: Map<string, {name: string, members: any[]}> = new Map();

            response.data.responseData.forEach((member: any) => {
                if (crew.has(member.department)) {
                    crew.get(member.department)!.members.push(member);
                } else {
                    crew.set(member.department, { name: member.department, members: [member] });
                }
            });

            setCrew(Array.from(crew.values()));
        }).catch(() => {
            toast.open("Error loading crew data", "error");
        });
    }, [type, id]);

    return (
        <div className="crew-container">
            {crew.map(department => (
                <div style={{ overflowX: "scroll" }}>
                    <h3>{department.name}</h3>
                    <div className="credits-container">
                        {department.members.map((person: any) =>
                            <PersonCard
                                key={`${person.id}.${person.job}`}
                                id={person.id}
                                name={person.name}
                                character={person.job}
                                profileUrl={person.profilePath}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Media() {
    let { type, id } = useParams<{ type: string, id: string }>();
    const [mediaData, setMediaData] = useState<any>(null);
    const [facts, setFacts] = useState<string>("");
    const [recommendations, setRecommendations] = useState<FilmCardProps[]>([]);
    const { loggedIn, getSavedItems, saveToHistory } = useContext(GlobalContext);
    const { getMediaData } = useContext(MediaContext);
    const navigate = useNavigate();

    // I case no id or type is provided
    if (!type || !id || (type !== 'movie' && type !== 'series')) return <PageNotFound />;

    // Setup tabs
    const tabs: Tab[] = [
        {
            id: "1",
            title: "Overview",
            tab: <Overview mediaData={mediaData} recommendations={recommendations}/>
        },
        {
            id: "2",
            title: "Images",
            tab: <Images type={type} id={id} />
        },
        {
            id: "3",
            title: "Videos",
            tab: <Videos type={type} id={id} />
        },
        {
            id: "4",
            title: "Cast",
            tab: <Cast type={type} id={id} />
        },
        {
            id: "5",
            title: "Crew",
            tab: <Crew type={type} id={id} />
        }
    ];

    useEffect(() => {
        // Fetch media data based on type
        setMediaData(null);
        getMediaData(id as string, type as string).then((data) => {
            const mediaData = data;
            setMediaData(data);

            getSavedItems(mediaData.recommendations, mediaData.recommendations.map((film: any) => ({ id: film.id, type: film.type })), (films: any) => {
                const recommendations = films.map((recommendation: any) => {
                    return {
                        filmData: {
                            id: recommendation.id,
                            type: recommendation.type,
                            posterUrl: recommendation.posterUrl,
                            title: recommendation.title,
                            releaseDate: recommendation.releaseDate,
                            voteAverage: recommendation.voteAverage,
                            votes: recommendation.votes,
                            description: recommendation.description
                        } as FilmCardData,
                        inWatchlist: recommendation.inWatchlist,
                        inFavorites: recommendation.inFavorites,
                        searchResult: false
                    } as FilmCardProps;
                });
                setRecommendations(recommendations);
            });

            // Set the page title
            document.title = `${mediaData.name || mediaData.title} | My Movie List`;

            let genres = "";
            let facts = "";
            mediaData.genres.map((genre: any) => genres += ", " + genre.name);
            facts = `${mediaData.releaseDate || mediaData.firstAirDate} • ${genres.substring(2)}`;

            if (type === 'movie') facts += ` • ${calculateMovieRuntime(mediaData.runtime)}`;
            setFacts(facts);

            saveToHistory(mediaData.id.toString(), type as string, loggedIn);
        });
    }, [navigate, id, type]);

    return (
        <div className="content">
            {mediaData ?
            <>
                <div className="film-backdrop-container" style={{backgroundImage: `url(${mediaData.backdropPath})`}}>
                    <div className="film-info-content">
                        <div className="film-poster-container">
                            <img className="film-poster" src={mediaData.posterPath} alt={mediaData.title || mediaData.name}/>
                        </div>
                        <div className="film-overview-info">
                            <h2 className="film-title">{mediaData.name || mediaData.title}</h2>
                            <div className="relevant-info">
                                <p>{facts}</p>
                                <p>{mediaData.voteAverage} ({mediaData.voteCount} votes)</p>
                            </div>
                            {type === 'series' &&
                                <div className="series-info">
                                    <p>{mediaData.numberOfSeasons} Seasons</p>
                                    <p>{mediaData.numberOfEpisodes} Episodes</p>
                                </div>
                            }
                            <InteractiveMediaOptions
                                key={`${mediaData.id}.${mediaData.type}`}
                                mediaId={mediaData.id}
                                type={type as string}
                                totalProgress={type === 'movie' ? 1 : mediaData.numberOfEpisodes}
                            />
                            <h2 className="description-title">Description</h2>
                            <p>{mediaData.overview}</p>
                        </div>
                    </div>
                </div>

                <div className="film-content-wrapper">
                    <div className="film-content-sidebar">
                        <SidebarSection title="Original Title">
                            <p>{mediaData.originalTitle || mediaData.originalName}</p>
                        </SidebarSection>
                        <SidebarSection title="Original Language">
                            <p>{mediaData.originalLanguage}</p>
                        </SidebarSection>
                        <SidebarSection title="Genres">
                            {mediaData.genres.map((genre: any) => <p key={genre.id}>{genre.name}</p>)}
                        </SidebarSection>
                        {mediaData.homepage &&
                            <SidebarSection title="Homepage">
                                <a href={mediaData.homepage} target="_blank">{mediaData.homepage}</a>
                            </SidebarSection>
                        }
                        {type === 'movie' ?
                        <>
                            <SidebarSection title="Release Date">
                                <p>{mediaData.releaseDate}</p>
                            </SidebarSection>
                            <SidebarSection title="Runtime">
                                <p>{calculateMovieRuntime(mediaData.runtime)}</p>
                            </SidebarSection>
                        </>
                        :
                        <>
                            <SidebarSection title="First Air Date">
                                <p>{mediaData.firstAirDate}</p>
                            </SidebarSection>
                            { mediaData.lastEpisodeToAir &&
                                <SidebarSection title="Last Air Date">
                                    <p>{mediaData.lastEpisodeToAir.airDate}</p>
                                </SidebarSection>
                            }
                            { mediaData.nextEpisodeToAir &&
                                <SidebarSection title="Next Air Date">
                                    <p>{mediaData.nextEpisodeToAir.airDate}</p>
                                </SidebarSection>
                            }
                            <SidebarSection title="Episodes">
                                <p>{mediaData.numberOfEpisodes}</p>
                            </SidebarSection>
                            <SidebarSection title="Seasons">
                                <p>{mediaData.numberOfSeasons}</p>
                            </SidebarSection>
                        </>}
                        <SidebarSection title="Status">
                            <p>{mediaData.status}</p>
                        </SidebarSection>
                        <SidebarSection title="Popularity">
                            <p>{mediaData.popularity}</p>
                        </SidebarSection>
                        <SidebarSection title="Rating">
                            <p>{mediaData.voteAverage}</p>
                        </SidebarSection>
                        <SidebarSection title="Production Countries">
                            {mediaData.productionCountries.map((country: any) => <p key={country.iso31661}>{country.name}</p>)}
                        </SidebarSection>
                        <SidebarSection title="Production Companies">
                            {mediaData.productionCompanies.map((company: any) => <p key={company.id}>{company.name}</p>)}
                        </SidebarSection>
                        <SidebarSection title="Source">
                            <p>TMDB</p>
                        </SidebarSection>
                    </div>

                    <div className="film-content-main">
                        <TabHandler tabs={tabs} key={ type + id }/>
                    </div>
                </div>
            </>
            :
            <div className="film-backdrop-container h-[100vh]">
                <div className="film-info-content">
                    <div className="film-poster-container min-w-[270px] min-h-[410px] max-h-[410px] md:h-[430px] md:min-w-[280px] lg:h-[560px] lg:min-w-[370px] lg:max-h-[560px]">
                        <Skeleton className="w-full h-full rounded-2xl"></Skeleton>
                    </div>
                    <div className="film-overview-info">
                        <Skeleton className="w-[90%] min-h-[40px] max-w-[400px]"></Skeleton>

                        <Skeleton className="mt-3 w-[80%] min-h-[20px] rounded-sm"></Skeleton>
                        <Skeleton className="my-1 w-[40%] min-h-[20px] rounded-sm"></Skeleton>

                        <Skeleton className="w-[90%] min-h-[40px] mt-28 mb-2 max-w-[300px] lg:mt-20"></Skeleton>
                        <Skeleton className="my-1 w-[80%] min-h-[20px] rounded-sm"></Skeleton>
                        <Skeleton className="w-[75%] min-h-[20px] rounded-sm"></Skeleton>
                        <Skeleton className="my-1 w-[78%] min-h-[20px] rounded-sm"></Skeleton>
                        <Skeleton className="w-[72%] min-h-[20px] rounded-sm"></Skeleton>
                    </div>
                </div>
            </div>
            }
        </div>
    );
}

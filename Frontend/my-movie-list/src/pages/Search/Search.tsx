import { useEffect, useState } from "react";
import InputField from "../../components/inputField-component/inputField";
import FilmCard from "../../components/film-card-component/filmCard";
import "./search.css";
import { mml_api } from "../../axios/mml_api_intances";
import { getSavedItems, removeSearchResultHistoryItem } from "../../helpers/util.helpers";
import { getSearchResultsHistory } from "../../helpers/util.helpers";
import { Link } from "react-router-dom";

function PrevSearchResultCard(props: { name: string, url: string, remove: React.MouseEventHandler }) {
    return (
        <div className="searched-media-card">
            <Link to={props.url}>
                <p>{props.name}</p>
            </Link>
            <div className="remove-searched-card" onClick={props.remove}>
                <span className="material-icons">close</span>
            </div>
        </div>
    );
}

export default function Browse() {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [timeoutFunc, setTimeoutFunc] = useState<NodeJS.Timeout | null>(null);
    const cooldown = 400;
    const [searchHistory, setSearchHistory] = useState<SearchResultItem[]>(getSearchResultsHistory());

    useEffect(() => {
        document.title = "Search - My Movie List";

        const params = new URLSearchParams(window.location.search);
        const query = params.get("query");

        if (query) {
            search(query);
        }
    }, []);

    const search = (query: string) => {
        setLoading(true);

        mml_api.get(`api/v1/media/search?title=${query}`).then((response) => {
            setLoading(false);
            setMedia([]);
            window.history.pushState({}, "", `/search?query=${query}`);
            
            if (response.data.responseData.length > 0) getSavedItems(response.data.responseData, response.data.responseData.map((media: any) => ({ id: media.id, type: media.type })), (media: any) => setMedia(media));
        });
    }

    const querySearchCooldown = (query: string) => {
        if (query.length <= 2) {
            window.history.replaceState({}, "", `/search`);
            return;
        };

        window.history.replaceState({}, "", `/search?query=${query}`);
        if (timeoutFunc) clearTimeout(timeoutFunc);

        setTimeoutFunc(setTimeout(() => {
            search(query);
        }, cooldown));
    }

    const handlePrevSearchRemove = (index: number) => {
        removeSearchResultHistoryItem(index);

        setSearchHistory(getSearchResultsHistory());
    }

    return (
        <div className="content">
            <div className="search-bar">
                <InputField
                    type="text" 
                    id="search-query" 
                    required={false} 
                    label="Search"
                    onInputChange={(value: string) => querySearchCooldown(value)}
                    clearButton={true}
                    autofocus={true}
                />
            </div>
            <div style={{paddingTop: "130px"}} className="content-wrapper">
                {searchHistory.length > 0 &&
                <div className="search-history-list">
                    <h3>Recently Searched</h3>
                    <div className="search-history-list-container">
                        {searchHistory.map((item, index) => (
                            <PrevSearchResultCard key={index} name={item.name} url={item.link} remove={() => handlePrevSearchRemove(index)}/>
                        ))}
                    </div>
                </div>
                }
                <div>
                    <div className={loading ? "loader active" : "loader"}><div className="spinning-loader"></div></div>
                    {media.filter(movie => movie.type === "movie").length > 0 &&
                        <div className="search-results">
                            <h2>Movies</h2>
                            <div className="search-results-container">  
                                {media.map((movie) => {
                                    if (movie.type === "movie") {
                                        return (
                                        <FilmCard
                                            key={`${movie.id}.${movie.type}`}
                                            filmData={{
                                                id: movie.id,
                                                type: movie.type,
                                                posterUrl: movie.posterUrl,
                                                title: movie.title,
                                                description: movie.description,
                                                releaseDate: movie.releaseDate,
                                                voteAverage: movie.voteAverage,
                                                votes: movie.votes,
                                            }}
                                            inFavorites={movie.inFavorites}
                                            inWatchlist={movie.inWatchlist}
                                            searchResult={true}/>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    }
                    {media.filter(movie => movie.type === "series").length > 0 &&
                        <div className="search-results">
                            <h2>Series</h2>
                            <div className="search-results-container">  
                                {media.map((show) => {
                                    if (show.type === "series") {
                                        return (
                                            <FilmCard 
                                                key={`${show.id}.${show.type}`}
                                                filmData={{
                                                    id: show.id,
                                                    type: show.type,
                                                    posterUrl: show.posterUrl,
                                                    title: show.title,
                                                    description: show.description,
                                                    releaseDate: show.releaseDate,
                                                    voteAverage: show.voteAverage,
                                                    votes: show.votes,
                                                }}
                                                inFavorites={show.inFavorites}
                                                inWatchlist={show.inWatchlist}
                                                searchResult={true}
                                            />
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
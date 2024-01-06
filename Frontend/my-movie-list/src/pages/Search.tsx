import { useEffect, useState } from "react";
import InputField from "../components/inputField-component/inputField";
import FilmCard from "../components/film-card-component/filmCard";
import "./search.css";
import { mml_api } from "../axios/mml_api_intances";
import { getSavedItems } from "../helpers/util.helpers";

export default function Browse() {
    const [movies, setMovies] = useState<any[]>([]);
    const [shows, setShows] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [timeoutFunc, setTimeoutFunc] = useState<NodeJS.Timeout | null>(null);
    const cooldown = 400;

    useEffect(() => {
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
            setMovies([]);
            setShows([]);
            window.history.pushState({}, "", `/search?query=${query}`);
            
            if (response.data.responseData.movies.length > 0) getSavedItems(response.data.responseData.movies, response.data.responseData.movies.map((film: any) => film.id).join(','), (movies: any) => setMovies(movies));
            if (response.data.responseData.shows.length > 0) getSavedItems(response.data.responseData.shows, response.data.responseData.shows.map((film: any) => film.id).join(','), (shows: any) => setShows(shows));
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

    return (
        <div className="content">
            <div className="search-bar">
                <InputField
                    type="text" 
                    id="search-query" 
                    required={false} 
                    label="Search"
                    onInputChange={(value: string) => querySearchCooldown(value)}
                />
            </div>
            <div className="results-container">
                {loading && <div className="search-loader"><div className="spinning-loader"></div></div>}
                {movies.length > 0 &&
                    <div className="search-results">
                        <h2>Movies</h2>
                        <div className="search-results-container">  
                            {movies.map((movie, index) => (
                                <FilmCard 
                                    key={index} 
                                    filmData={movie}/>  
                            ))}
                        </div>
                    </div>
                }
                {shows.length > 0 &&
                    <div className="search-results">
                        <h2>Shows</h2>
                        <div className="search-results-container">  
                            {shows.map((show, index) => (
                                <FilmCard 
                                    key={index} 
                                    filmData={show}/>  
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { mml_api } from "../axios/mml_api_intances";
import FilmSlider from "../components/film-slider-component/filmSlider";
import { getSavedItems } from "../helpers/util.helpers";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);

    useEffect((() => {
        mml_api.get("api/v1/media/movies/popular").then((response) => {
            getSavedItems(response.data.responseData, setPopularMovies);
        });

        mml_api.get("api/v1/media/movies/upcoming").then((response) => {
            getSavedItems(response.data.responseData, setUpcoming);
        });
    }), [])

    return (
        <div className="content">
            { popularMovies.length > 0 && <FilmSlider title="Popular" filmArr={popularMovies}/>}
            { upcoming.length > 0 && <FilmSlider title="Upcoming" filmArr={upcoming}/> }
        </div>
    );
}
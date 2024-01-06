import { useState, useEffect } from "react";
import { mml_api } from "../axios/mml_api_intances";
import FilmSlider from "../components/film-slider-component/filmSlider";
import { getSavedItems } from "../helpers/util.helpers";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [topRated, setTopRated] = useState<any[]>([]);

    useEffect((() => {
        mml_api.get("api/v1/media/movies/popular").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => film.id).join(','), setPopularMovies);
        });

        mml_api.get("api/v1/media/movies/upcoming").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => film.id).join(','), setUpcoming);
        });

        mml_api.get("api/v1/media/movies/top-rated").then((response) => {
            getSavedItems(response.data.responseData, response.data.responseData.map((film: any) => film.id).join(','), setTopRated);
        });
    }), [])

    return (
        <div className="content">
            <FilmSlider title="Popular" filmArr={popularMovies}/> 
            <FilmSlider title="Upcoming" filmArr={upcoming}/>
            <FilmSlider title="Top Rated" filmArr={topRated}/>
        </div>
    );
}
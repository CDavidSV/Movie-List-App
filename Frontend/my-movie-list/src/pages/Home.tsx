import { useState, useEffect } from "react";
import mml_api from "../axios/mml_api_intance";
import FilmSlider from "../components/film-slider-component/filmSlider";

export default function Home() {
    const [popularMovies, setPopularMovies] = useState<any[]>([]);

    useEffect((() => {
        mml_api.get("api/v1/media/movies/popular").then((response) => {
            console.log(response.data);
            setPopularMovies(response.data.responseData);
        });
    }), [])

    return (
        <div className="content">
            <FilmSlider title="Popular" filmArr={popularMovies}/>
        </div>
    );
}
import defaultPfp from '../../assets/profile-default.png';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
    const pages = [
        "/",
        "/movies",
        "/shows",
        "/browse",
        "/search",
        "/my-lists"
    ];

    const currentPage = window.location.pathname;

    const selectedPage = (path: string) => {
        return `header-hoverable ${currentPage === path ? "selected" : ""}`;
    }

    return (
        <header>
            <div className="header-section">
                <h2 className="app-title">My Movie List</h2>

                <div className="header-pages">
                    <Link to="/" className={selectedPage("/")}>
                        <p>Home</p>
                    </Link>
                    <Link to="/movies" className={selectedPage("/movies")}>
                        <p>Movies</p>
                    </Link>
                    <Link to="/shows" className={selectedPage("/shows")}>
                        <p>Shows</p>
                    </Link>
                    <Link to="/browse" className={selectedPage("/browse")}>
                        <p>Browse</p>
                        <span className="material-symbols-outlined">
                            arrow_drop_down
                        </span>
                    </Link>
                </div>
            </div>

            <div className="header-section">
                <Link to="/search" className={selectedPage("/search" )}>
                    <span className="material-symbols-outlined">search</span>     
                </Link>
                <Link to="/my-lists" className={selectedPage("/my-lists")}>
                    <span className="material-symbols-outlined">lists</span>     
                </Link>
                
                <div className="header-hoverable">
                    <div className="profile-img">
                        <img src={defaultPfp} alt="Profile"/>
                    </div>
                    <span className="material-symbols-outlined">
                        arrow_drop_down
                    </span>
                </div>
            </div>
        </header>
    );
}
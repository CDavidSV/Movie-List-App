import defaultPfp from '../../assets/profile-default.png';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
    return (
        <header>
            <div className="header-section">
                <h2 className="app-title">My Movie List</h2>

                <div className="header-pages">
                    <Link to="/home" className="header-hoverable">
                        <p>Home</p>
                    </Link>
                    <Link to="/movies" className="header-hoverable">
                        <p>Movies</p>
                    </Link>
                    <Link to="/shows" className="header-hoverable">
                        <p>Shows</p>
                    </Link>
                    <Link to="/browse" className="header-hoverable">
                        <p>Browse</p>
                        <span className="material-symbols-outlined">
                            arrow_drop_down
                        </span>
                    </Link>
                </div>
            </div>

            <div className="header-section">
                <div className="header-hoverable">
                    <span className="material-symbols-outlined">search</span>     
                </div>
                <div className="header-hoverable">
                    <span className="material-symbols-outlined">lists</span>     
                </div>
                
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
/// <reference types="vite-plugin-svgr/client" />

import { NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import defaultPfp from '../../assets/images/profile-default.png';
import Logo from '../../assets/logos/mml_logo.svg?react';
import LogoWithName from '../../assets/logos/mml_logo_with_name.svg?react';
import onRouteChange from '../../hooks/onRouteChange';
import { getSessionData, logOut, SessionData } from '../../helpers/session.helpers';
import './navbar.css';

const genres = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"];

function useDropdown() {
    const [menuState, setMenuState] = useState(false);
    const node = useRef<HTMLDivElement>(null);
    
    const toggleMenu = () => setMenuState(!menuState);
    const handleClick = (e: MouseEvent) => {
        if (node.current!.contains(e.target as Node)) {
            return;
        }

        setMenuState(false);
    };
    
    // Hook to detect when the user clicks outside the dropdown menu
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
    
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    // Hook to detect when the user changes the route to close the dropdown menu
    onRouteChange(() => setMenuState(false));

    return { node, menuState, toggleMenu };
}

function GenresDropdown() {
    const { node, menuState, toggleMenu } = useDropdown();

    return (
        <div 
            ref={node} 
            style={{
                height: "100%",
                width: "100%",
                display: "flex"
            }}
            >
            <div className="select-button" onClick={toggleMenu}>
                <p>Browse</p>
                <span className={menuState ? "select-arrow select-active" : "select-arrow"}></span>
            </div>
            <div className={menuState ? "dropdown genre-dropdown select-active" : "dropdown genre-dropdown"}>
                {genres.map((genre) => (
                    <li key={genre} className="menu-item">
                        <NavLink className={({isActive}) => isActive ? "menu-item-title selected" : "menu-item-title"} to="/genres">{genre}</NavLink>
                    </li>
                ))}
            </div>
        </div>
    );
}

function ProfileDropdown() {
    const { node, menuState, toggleMenu } = useDropdown();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    useEffect(() => {
        setSessionData(getSessionData());
    }, []);

    return (
        <div 
            ref={node} 
            style={{
                height: "100%", 
                display: "flex",
                justifyContent: "flex-end"
            }}
            >
            <div className="select-button" onClick={toggleMenu}>
                <div className="profile-img">
                    <img src={defaultPfp} alt="profile-picture"/>
                </div>
                <span className={menuState ? "select-arrow select-active" : "select-arrow"}></span>
            </div>
            { sessionData && <div className={menuState ? "dropdown profile-dropdown select-active" : "dropdown profile-dropdown"}>
                <div className="menu-profile-section">
                    <div className="menu-user-profile-item">
                        <img src={defaultPfp} alt="profile-picture"/>
                        <div className="profile-name">
                            <p>{sessionData.username || "Username"}</p>
                            <p>{sessionData.email || "Email"}</p>
                        </div>
                    </div>
                </div>
                <div className="profile-dropdown-section">   
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/profile">
                        <span className="material-icons">account_circle</span>
                        <div>
                            My Profile
                            <p className="menu-item-subtext">Manage your profile settings</p>
                        </div>
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/watchlist">
                        <span className="material-icons">bookmark_border</span>
                        Watchlist
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/my-lists">
                        <span className="material-icons">list</span>
                        My lists
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/history">
                    <span className="material-icons">history</span>
                        History
                    </NavLink>
                </div>
                <div className="profile-dropdown-section">
                    <NavLink className="menu-profile-item" to="/login" onClick={logOut}>
                        <span className="material-icons">logout</span>
                        Log out
                    </NavLink>
                </div>
            </div>}
            {!sessionData && <div className={menuState ? "dropdown profile-dropdown select-active" : "dropdown profile-dropdown"}>
            <div className="menu-profile-section">   
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/login">
                        <span className="material-icons">login</span>
                        <div>
                            Log in
                            <p className="menu-item-subtext">Log in to your existing account</p>
                        </div>
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/signup">
                        <span className="material-icons">person_add</span>
                        <div>
                            Create Account
                            <p className="menu-item-subtext">Don't have an account? Create one now.</p>
                        </div>
                    </NavLink>
                </div>
            </div>}
        </div>
    );
}

export default function Navbar() {
    const { node, menuState, toggleMenu } = useDropdown();

    return (
        <header>
            <div ref={node} className="header-section">
                <div className="header-section" onClick={toggleMenu}>
                    <div className="header-hoverable hamburger-btn">
                        <span className="material-icons">menu</span>
                    </div>
                </div>
                <NavLink to="/" className="logo-container"> 
                    <LogoWithName className="logo-desktop"/>
                    <Logo className="logo-mobile"/>
                </NavLink>
                <div className={`header-pages${menuState ? " active-hamburger-menu" : ""}`}>
                    <NavLink to="/" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                        <p>Home</p>
                    </NavLink>
                    <NavLink to="/movies" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                        <p>Movies</p>
                    </NavLink>
                    <NavLink to="/shows" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                        <p>Shows</p>
                    </NavLink>
                    <GenresDropdown/>
                </div>
            </div>

            <div className="header-section">
                <NavLink to="/search" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                    <span className="material-icons">search</span>     
                </NavLink>
                <NavLink to="/watchlist" className={({ isActive }) => isActive ? "header-hoverable lists-icon selected " : "header-hoverable lists-icon"}>
                    <span className="material-icons">bookmark_border</span>     
                </NavLink>
                
                <ProfileDropdown/>
            </div>
        </header>
    );
}
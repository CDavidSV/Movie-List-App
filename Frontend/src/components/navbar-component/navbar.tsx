/// <reference types="vite-plugin-svgr/client" />

import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import defaultPfp from '../../assets/images/profile-default.png';
import Logo from '../../assets/logos/mml_logo.svg?react';
import LogoWithName from '../../assets/logos/mml_logo_with_name.svg?react';
import useRouteChange from '../../hooks/useRouteChange';
import { GlobalContext } from '../../contexts/GlobalContext';
import { Search, Bookmark, CircleUserRound, Heart, LogOut, History, LogIn, UserRoundPlus, Menu, Users2 } from 'lucide-react';
import './navbar.css';

const genres = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"];

function useDropdown(onMenuStateChange: (isOpen: boolean) => void) {
    const [menuState, setMenuState] = useState(false);
    const node = useRef<HTMLDivElement>(null);
    
    const toggleMenu = () => setMenuState(!menuState);
    const handleClick = (e: MouseEvent) => {
        if (node.current!.contains(e.target as Node)) {
            return;
        }

        setMenuState(false);
    };

    useEffect(() => {
        onMenuStateChange(menuState);
    }, [menuState]);
    
    // Hook to detect when the user clicks outside the dropdown menu
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
    
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    // Hook to detect when the user changes the route to close the dropdown menu
    useRouteChange(() => setMenuState(false));

    return { node, menuState, toggleMenu };
}

function GenresDropdown({handleMenuStateChange}: {handleMenuStateChange: (isOpen: boolean) => void}) {
    const { node, menuState, toggleMenu } = useDropdown(handleMenuStateChange);

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
                        <NavLink className={({isActive}) => isActive ? "menu-item-title selected" : "menu-item-title"} to={`/genres/${genre}`}>{genre}</NavLink>
                    </li>
                ))}
            </div>
        </div>
    );
}

function ProfileDropdown({handleMenuStateChange}: {handleMenuStateChange: (isOpen: boolean) => void}) {
    const { node, menuState, toggleMenu } = useDropdown(handleMenuStateChange);
    const { logOut, userData } = useContext(GlobalContext);

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
                    <img src={userData && userData.profilePictureUrl ? `${userData.profilePictureUrl}` : defaultPfp} alt="profile-picture" loading="lazy"/>
                </div>
                <span className={menuState ? "select-arrow select-active" : "select-arrow"}></span>
            </div>
            { userData && <div className={menuState ? "dropdown profile-dropdown select-active" : "dropdown profile-dropdown"}>
                <div className="menu-profile-section">
                    <div className="menu-user-profile-item">
                        <img src={userData && userData.profilePictureUrl ? `${userData.profilePictureUrl}` : defaultPfp} alt="profile-picture" loading="lazy"/>
                        <div className="profile-name">
                            <p>{userData.username || "Username"}</p>
                            <p>{userData.email || "Email"}</p>
                        </div>
                    </div>
                </div>
                <div className="profile-dropdown-section">   
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/profile">
                        <CircleUserRound />
                        <div>
                            My Profile
                            <p className="menu-item-subtext">Manage your profile settings</p>
                        </div>
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/watchlist">
                        <Bookmark />
                        Watchlist
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/favorites">
                        <Heart />
                        Favorites
                    </NavLink>
                    {
                    // TODO: Implement user lists
                    /* <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/my-lists">
                        <span className="material-icons">list</span>
                        My lists
                    </NavLink> */}
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/history">
                        <History />
                        History
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/search-users">
                        <Users2 />
                        Search Users
                    </NavLink>
                </div>
                <div className="profile-dropdown-section">
                    <button className="menu-profile-item" onClick={logOut}>
                        <LogOut />
                        Log out
                    </button>
                </div>
            </div>}
            {!userData && <div className={menuState ? "dropdown profile-dropdown select-active" : "dropdown profile-dropdown"}>
            <div className="menu-profile-section">   
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/login">
                        <LogIn />
                        <div>
                            Log in
                            <p className="menu-item-subtext">Log in to your existing account</p>
                        </div>
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? "menu-profile-item selected" : "menu-profile-item"} to="/signup">
                        <UserRoundPlus />
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

function HanburgerMenu({handleMenuStateChange}: {handleMenuStateChange: (isOpen: boolean) => void}) {
    const { node, menuState, toggleMenu } = useDropdown(handleMenuStateChange);
    const [genreMenuState, setGenreMenuState] = useState(false);

    return (
        <div style={{ height: "100%", left: 0 }}>
            <div 
                ref={node} 
                style={{ height: "100%" }}
                >
                <div className="header-hoverable hamburger-btn" onClick={toggleMenu}>
                    <Menu/>
                </div>
                <div className={menuState ? "dropdown hamburger-menu select-active" : "dropdown hamburger-menu"}>
                    <div className="hamburger-links">
                        <NavLink to="/" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Home</p>
                        </NavLink>
                        <NavLink to="/movies" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Movies</p>
                        </NavLink>
                        <NavLink to="/series" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Series</p>
                        </NavLink>
                        <div className="header-hoverable" onClick={() => setGenreMenuState(!genreMenuState)}>
                            <p>Genres</p>
                            <span style={{ marginLeft: "15px" }} className={genreMenuState ? "select-arrow select-active" : "select-arrow"}></span>
                        </div>
                        <div className={`hamburger-menu-genres${genreMenuState ? " open": ""}`}>
                            {genres.map((genre) => (
                                <li key={genre} className="menu-item">
                                    <NavLink className={({isActive}) => isActive ? "menu-item-title selected" : "menu-item-title"} to={`/genres/${genre}`}>{genre}</NavLink>
                                </li>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { loggedIn } = useContext(GlobalContext);

    const handleMenuStateChange = (isOpen: boolean) => {
        setDropdownOpen(isOpen);
    }

    return (
        <>
            <div className={dropdownOpen ? "dropdown-select-cover active" : "dropdown-select-cover"}></div>
            <header>
                <div className="header-section">
                    <HanburgerMenu handleMenuStateChange={handleMenuStateChange}/>
                    <NavLink to="/" className="logo-container">
                        <LogoWithName className="logo-desktop"/>
                        <Logo className="logo-mobile"/>
                    </NavLink>
                    <div className="header-pages">
                        <NavLink to="/" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Home</p>
                        </NavLink>
                        <NavLink to="/movies" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Movies</p>
                        </NavLink>
                        <NavLink to="/series" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                            <p>Series</p>
                        </NavLink>
                        <GenresDropdown handleMenuStateChange={handleMenuStateChange}/>
                    </div>
                </div>

                <div className="header-section">
                    <NavLink to="/search" className={({ isActive }) => isActive ? "header-hoverable selected" : "header-hoverable"}>
                        <Search />    
                    </NavLink>
                    {loggedIn && 
                        <NavLink to="/watchlist" className={({ isActive }) => isActive ? "header-hoverable lists-icon selected " : "header-hoverable lists-icon"}>
                            <Bookmark />
                        </NavLink>
                    }
                    <ProfileDropdown handleMenuStateChange={handleMenuStateChange}/>
                </div>
            </header>
        </>
    );
}
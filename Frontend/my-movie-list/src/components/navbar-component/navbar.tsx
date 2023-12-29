/// <reference types="vite-plugin-svgr/client" />

import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import defaultPfp from '../../assets/images/profile-default.png';
import Logo from '../../assets/logos/mml_logo.svg?react';
import LogoWithName from '../../assets/logos/mml_logo_with_name.svg?react';
import './navbar.css';

function NavDropdown(props: { children: React.ReactNode, button: React.ReactNode, flexJustifyContent?: string }) {
    const [menuState, setMenuState] = useState(false);
    const node = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const handleClick = (e: MouseEvent) => {
        if (node.current!.contains(e.target as Node)) {
            return;
        }

        setMenuState(false);
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        setMenuState(false);
    }, [location]);
    
    return (
        <div 
            ref={node} 
            style={{
                height: "100%", 
                display: "flex", 
                justifyContent: `${props.flexJustifyContent || "flex-start"}`
            }}
            className={menuState ? "select-active" : ""}
            >
            <div className="select-button" onClick={() => setMenuState(!menuState)}>
                {props.button}
                <span className="select-arrow"></span>
            </div>
            {props.children}
        </div>
    );
}

function GenresDropdown() {
    const genres = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western"]

    return (
        <NavDropdown
            button={<p>Browse</p>}
        >
            <div className="genre-dropdown">
                {genres.map((genre) => (
                    <li key={genre} className="menu-item">
                        <Link className="menu-item-title" to="/genres">{genre}</Link>
                    </li>
                ))}
            </div>
        </NavDropdown>
    );
}

function ProfileDropdown() {
    return (
        <NavDropdown
            button={
                <div className="profile-img">
                    <img src={defaultPfp} alt="profile-picture"/>
                </div>
            }
            flexJustifyContent="flex-end"
        >
        <div className="profile-dropdown">
            <div className="menu-profile-section">
                <li className="menu-profile-item">
                    <img src={defaultPfp} alt="profile-picture"/>
                    <div className="profile-name">
                        <p>Username</p>
                        <p>Email</p>
                    </div>
                </li>
            </div>
            <div className="profile-dropdown-section">
                <li className="menu-item">
                    <Link className="menu-item-title" to="/profile">My Profile</Link>
                </li>
                <li className="menu-item">
                    <Link className="menu-item-title" to="/my-lists">Watchlist</Link>
                </li>
                <li className="menu-item">
                    <Link className="menu-item-title" to="/my-lists">My lists</Link>
                </li>
                <li className="menu-item">
                    <Link className="menu-item-title" to="/history">History</Link>
                </li>
            </div>
            <div className="profile-dropdown-section">
                <li className="menu-item">
                    <Link className="menu-item-title" to="/logout">Log out</Link>
                </li>
            </div>
        </div>
        </NavDropdown>
    );
}

export default function Navbar() {
    const currentPage = useLocation().pathname;

    const selectedPage = (path: string) => {
        return `header-hoverable ${currentPage === path ? "selected" : ""}`;
    }

    return (
        <header>
            <div className="header-section">
                <div className="hamburger-icon header-hoverable">
                    <span className="material-symbols-outlined">menu</span>
                </div>
                <div className="logo-container">
                    <LogoWithName className="logo-desktop"/>
                    <Logo className="logo-mobile"/>
                </div>

                <div className="header-pages">
                    <Link to="/" className="header-hoverable">
                        <p>Home</p>
                    </Link>
                    <Link to="/movies" className="header-hoverable">
                        <p>Movies</p>
                    </Link>
                    <Link to="/shows" className="header-hoverable">
                        <p>Shows</p>
                    </Link>
                    <GenresDropdown/>
                </div>
            </div>

            <div className="header-section">
                <Link to="/search" className="header-hoverable">
                    <span className="material-symbols-outlined">search</span>     
                </Link>
                <Link to="/my-lists" className="header-hoverable lists-icon">
                    <span className="material-symbols-outlined">lists</span>     
                </Link>
                
                <ProfileDropdown/>
            </div>
        </header>
    );
}
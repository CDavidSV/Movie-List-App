import { useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import LogoWithName from '../../assets/logos/mml_logo_with_name.svg';
import TMDBLogo from '../../assets/logos/blue_short-tmdb.svg'
import { NavLink } from "react-router-dom";
import { SquarePlay } from "lucide-react";
import "./footer.css";

function FooterLink({ icon, text, link }: { icon?: string, text: string, link: string }) {
    return (
        <a className="footer-link" href={link}>
            {icon && <span className="material-icons">{icon}</span>}
            <p>{text}</p>
        </a>
    );
}

export default function Footer() {
    const { loggedIn } = useContext(GlobalContext);

    return (
        <footer className="page-footer">
            <div className="main-footer">
                <div className="footer-section">
                <NavLink to="/">
                    <img src={LogoWithName} className="footer-logo" alt="mml-logo" loading="lazy"/>
                </NavLink>
                <a href="https://www.themoviedb.org/" target="_blank">
                    <img src={TMDBLogo} className="footer-logo" alt="tmbd-logo" loading="lazy"/>
                </a>
                </div>
                <div className="footer-section">
                    <h4>My Movie List</h4>
                    <FooterLink text="Home" link="/"/>
                    <FooterLink text="Movies" link="/movies"/>
                    <FooterLink text="Series" link="/series"/>
                </div>
                <div className="footer-section">
                    <h4>Account</h4>
                    {loggedIn ? <>
                            <FooterLink text="My Profile" link="/profile"/>
                            {/* <FooterLink text="My Lists" link="/my-lists"/> */}
                            <FooterLink text="Favorites" link="/favorites"/>
                            <FooterLink text="History" link="/history"/>
                            <FooterLink text="Users" link="/search-users"/>
                        </>:<>
                            <FooterLink text="Login" link="/login"/>
                            <FooterLink text="Sign Up" link="/signup"/>
                        </>}
                </div>
            </div>
            <div className="footer-separator"></div>
            <div className="bottom-footer">
                <div className="flex items-center gap-1">
                    <SquarePlay />
                    <p>My Movie List</p>
                </div>
                <span>Made with ❤ by <a href="https://cdavidsv.dev/" target="_blank">Carlos David Sandoval Vargas</a></span>
            </div>
        </footer>
    );
}

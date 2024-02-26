import "./footer.css";
import { isLoggedIn } from "../../helpers/session.helpers";

function FooterLink({ icon, text, link }: { icon?: string, text: string, link: string }) {
    return (
        <a className="footer-link" href={link}>
            {icon && <span className="material-icons">{icon}</span>}
            <p>{text}</p>
        </a>
    );
}

export default function Footer() {
    return (
        <footer className="page-footer">
            <div className="main-footer">
                <div className="footer-section">
                    <h4>My Movie List</h4>
                    <FooterLink text="Home" link="/"/>
                    <FooterLink text="Movies" link="/movies"/>
                    <FooterLink text="Series" link="/series"/>
                </div>
                <div className="footer-section">
                    <h4>Account</h4>
                    {isLoggedIn() ? <>
                            <FooterLink text="My Profile" link="/profile"/>
                            {/* <FooterLink text="My Lists" link="/my-lists"/> */}
                            <FooterLink text="Favorites" link="/favorites"/>
                            <FooterLink text="History" link="/history"/>
                        </>:<>
                            <FooterLink text="Login" link="/login"/>
                            <FooterLink text="Sign Up" link="/signup"/>
                        </>}
                </div>
            </div>
            <div className="footer-separator"></div>
            <div className="bottom-footer">
                <p>My Movie List</p>
                <p>Made with <span className="material-icons">favorite</span> by <a href="">Carlos David Sandoval Vargas</a></p>
            </div>
        </footer>
    );
}
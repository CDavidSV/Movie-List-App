import { Link } from "react-router-dom";
import Logo from  "../../assets/logos/mml_logo_with_name.svg?react";

export default function Header() {
    return (
        <div className="title-header">
            <Link className="logo-container" to="/">
                <Logo style={{height: "40px"}} />
            </Link>
        </div>
    );
}
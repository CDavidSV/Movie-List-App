import { Link } from "react-router-dom";

export default function Home() {
    return <div>
        <div className="page-flex">
            <h1 style={{fontSize: '74px', margin: '20px 0 0 0'}}>404</h1>
            <h2>Page Not Found</h2>
            <p>Nothing to see here. At least that's what I think anyway...</p>
            <Link to="/">
            <button className="primary-button">
                TAKE ME BACK
            </button>
            </Link>
        </div>
    </div>
}
export default function PageNotFound() {
    document.title = "Page Not Found | My Movie List";

    return <div>
        <div className="page-flex">
            <h1 style={{fontSize: '74px', margin: '20px 0 0 0'}}>404</h1>
            <h2>Page Not Found</h2>
            <p>Nothing to see here. At least that's what I think anyway...</p>
            <a href="/">
                <button className="button primary">
                    TAKE ME BACK
                </button>
            </a>
        </div>
    </div>
}
import { Frown } from "lucide-react";

export default function Error() {
    document.title = "Unnexpected Error | My Movie List";

    return (
        <div className="page-flex">
            <Frown size={120} />
            <h1 className="text-5xl text-center m-0 my-2">An unnexpected error has occurred</h1>
            <p className="m-0 my-2">
                We're sorry, you seem to have encountered an error that we didn't expect. Please try again.
            </p>
            <a href="/">
                <button className="button primary">
                    RELOAD PAGE
                </button>
            </a>
        </div>
    );
}
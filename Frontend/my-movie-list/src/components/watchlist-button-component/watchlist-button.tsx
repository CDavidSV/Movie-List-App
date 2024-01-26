import { useState } from "react";
import { isLoggedIn } from "../../helpers/session.helpers";
import { removeFromWatchlist, setWatchlist } from "../../helpers/util.helpers";

export default function WatchlistButton(props: { size: string, isWatchlisted: boolean, mediaId: string, type: string }) {
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(props.isWatchlisted);

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn()) return window.location.href = "/login";

        if (isWatchlisted) {
            setIsWatchlisted(false);
            removeFromWatchlist(props.mediaId, props.type).catch(() => {
                setIsWatchlisted(true);
            });
            return;
        }

        setIsWatchlisted(true);
        setWatchlist(props.mediaId, props.type)
        .catch(() => {
            setIsWatchlisted(false);
        });
    }

    return (
        <span className={`material-icons icon-btn blue ${props.size}`} onClick={handleWatchlistClick}>{!isWatchlisted ? "bookmark_border" : "bookmark"}</span>
    );
}
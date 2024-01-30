import { isLoggedIn } from "../../helpers/session.helpers";
import { useEffect, useState } from "react";
import { removeFavorite, setFavorite } from "../../helpers/util.helpers";

export default function FavoriteButton(props: { size: string, isFavorite: boolean, mediaId: string, type: string }) {
    const [isFavorite, setIsFavorite] = useState<boolean>(props.isFavorite);

    useEffect(() => {
        setIsFavorite(props.isFavorite);
    }, [props.isFavorite]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn()) return window.location.href = "/login";

        if (isFavorite) {
            setIsFavorite(false);
            removeFavorite(props.mediaId, props.type).catch(() => {
                setIsFavorite(true);
            });
            return;
        }

        setIsFavorite(true);
        setFavorite(props.mediaId, props.type)
        .catch(() => {
            setIsFavorite(false);
        });
    }

    return (
        <span className={`material-icons icon-btn blue ${props.size}`} onClick={handleFavoriteClick}>{!isFavorite ? "favorite_border" : "favorite"}</span>
    );
}
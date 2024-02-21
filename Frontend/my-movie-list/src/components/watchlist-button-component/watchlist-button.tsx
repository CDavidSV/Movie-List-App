import { useContext, useEffect, useState } from "react";
import { isLoggedIn } from "../../helpers/session.helpers";
import { removeFromWatchlist, setWatchlist } from "../../helpers/util.helpers";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-component/modal";
import { PersonalListsContext } from "../../contexts/PersonalListsContext";

export default function WatchlistButton(props: { size: string, isWatchlisted: boolean, mediaId: string, type: string }) {
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(props.isWatchlisted);
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
    const { handleWatchlistState } = useContext(PersonalListsContext);
    const navigate = useNavigate();

    useEffect(() => {
        setIsWatchlisted(props.isWatchlisted);
    }, [props.isWatchlisted]);

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn()) {
            setLoginModalOpen(true);
            return;
        };

        if (isWatchlisted) {
            setIsWatchlisted(false);
            handleWatchlistState(props.mediaId, props.type, false);

            // Remove from the watchlist
            removeFromWatchlist(props.mediaId, props.type).catch(() => {
                // Reset the state if the request fails
                setIsWatchlisted(true);
                handleWatchlistState(props.mediaId, props.type, true);
            });
            return;
        }

        setIsWatchlisted(true);
        handleWatchlistState(props.mediaId, props.type, true);

        setWatchlist(props.mediaId, props.type)
        .catch(() => {
            // Reset the state if the request fails
            handleWatchlistState(props.mediaId, props.type, false);
            setIsWatchlisted(false);
        });
    }

    return (
        <>
            <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
                <h2 style={{textAlign: "center"}}>Login Required</h2>
                <p>You must be logged in to add this film to your watchlist.</p>
                <div className="modal-buttons">
                    <button className="button primary" onClick={() => navigate("/login")}>Login</button>
                    <button className="button primary" onClick={() => navigate("signup")}>Create Account</button>
                </div>
            </Modal>
            <span className={`material-icons icon-btn blue ${props.size}`} onClick={handleWatchlistClick}>{!isWatchlisted ? "bookmark_border" : "bookmark"}</span>
        </>
    );
}
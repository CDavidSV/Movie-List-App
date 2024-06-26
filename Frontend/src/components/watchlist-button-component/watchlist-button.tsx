import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-component/modal";
import { PersonalListsContext } from "../../contexts/PersonalListsContext";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WatchlistButton(props: { size: number, isWatchlisted: boolean, mediaId: string, type: string }) {
    const [isWatchlisted, setIsWatchlisted] = useState<boolean>(props.isWatchlisted);
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
    const { handleWatchlistState, watchlistState } = useContext(PersonalListsContext);
    const { loggedIn, removeFromWatchlist, setWatchlist } = useContext(GlobalContext);
    const navigate = useNavigate();

    useEffect(() => {
        const newState = watchlistState.get(`${props.mediaId}.${props.type}`);
        if (newState === undefined) return;

        setIsWatchlisted(newState);
    }, [watchlistState]);

    useEffect(() => {
        setIsWatchlisted(props.isWatchlisted);
    }, [props.isWatchlisted]);

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loggedIn) {
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
                <h2 style={{ textAlign: "center" }}>Login Required</h2>
                <p>You must be logged in to add this film to your watchlist.</p>
                <div className="modal-buttons">
                    <button className="button primary" onClick={() => navigate("/login")}>Login</button>
                    <button className="button primary" onClick={() => navigate("signup")}>Create Account</button>
                </div>
            </Modal>
            <Bookmark size={props.size} className={cn(`icon-btn blue`, isWatchlisted && "fill-primary")} onClick={handleWatchlistClick} />
        </>
    );
}
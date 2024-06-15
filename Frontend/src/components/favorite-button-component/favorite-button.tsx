import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-component/modal";
import { PersonalListsContext } from "../../contexts/PersonalListsContext";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FavoriteButton(props: { size: number, isFavorite: boolean, mediaId: string, type: string }) {
    const [isFavorite, setIsFavorite] = useState<boolean>(props.isFavorite);
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleFavoriteState, favoriteState } = useContext(PersonalListsContext);
    const { loggedIn, removeFavorite, setFavorite } = useContext(GlobalContext);

    useEffect(() => {
        const newState = favoriteState.get(`${props.mediaId}.${props.type}`);
        if (newState === undefined) return;

        setIsFavorite(newState);
    }, [favoriteState]);

    useEffect(() => {
        setIsFavorite(props.isFavorite);
    }, [props.isFavorite]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loggedIn) {
            setLoginModalOpen(true);
            return;
        };

        if (isFavorite) {
            setIsFavorite(false);
            handleFavoriteState(props.mediaId, props.type, false);

            removeFavorite(props.mediaId, props.type).catch(() => {
                handleFavoriteState(props.mediaId, props.type, true);
                setIsFavorite(true);
            });
            return;
        }

        setIsFavorite(true);
        handleFavoriteState(props.mediaId, props.type, true);

        setFavorite(props.mediaId, props.type)
        .catch(() => {
            handleFavoriteState(props.mediaId, props.type, false);
            setIsFavorite(false);
        });
    }

    return (
        <>
            <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
                <h2 style={{textAlign: "center"}}>Login Required</h2>
                <p>You must be logged in to add a favorite.</p>
                <div className="modal-buttons">
                    <button className="button primary" onClick={() => navigate("/login")}>Login</button>
                    <button className="button primary" onClick={() => navigate("/signup")}>Create Account</button>
                </div>
            </Modal>
            <Heart size={props.size} className={cn(`icon-btn blue`, isFavorite && "fill-primary")} onClick={handleFavoriteClick} />
        </>
    );
}
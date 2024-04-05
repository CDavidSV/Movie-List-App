import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-component/modal";
import { PersonalListsContext } from "../../contexts/PersonalListsContext";
import { GlobalContext } from "../../contexts/GlobalContext";

export default function FavoriteButton(props: { size: string, isFavorite: boolean, mediaId: string, type: string }) {
    const [isFavorite, setIsFavorite] = useState<boolean>(props.isFavorite);
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleFavoriteState } = useContext(PersonalListsContext);
    const { loggedIn, removeFavorite, setFavorite } = useContext(GlobalContext);

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
                    <button className="button primary" onClick={() => navigate("signup")}>Create Account</button>
                </div>
            </Modal>
            <span className={`material-icons icon-btn blue ${props.size}`} onClick={handleFavoriteClick}>{!isFavorite ? "favorite_border" : "favorite"}</span>
        </>
    );
}
import { isLoggedIn } from "../../helpers/session.helpers";
import { useEffect, useState } from "react";
import { removeFavorite, setFavorite } from "../../helpers/util.helpers";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-component/modal";

export default function FavoriteButton(props: { size: string, isFavorite: boolean, mediaId: string, type: string }) {
    const [isFavorite, setIsFavorite] = useState<boolean>(props.isFavorite);
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsFavorite(props.isFavorite);
    }, [props.isFavorite]);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn()) {
            setLoginModalOpen(true);
            return;
        };

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
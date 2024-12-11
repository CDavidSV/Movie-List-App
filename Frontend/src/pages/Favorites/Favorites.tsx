import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WatchlistButton from "../../components/watchlist-button-component/watchlist-button";
import Modal from "../../components/modal-component/modal";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";
import { ToastContext } from "../../contexts/ToastContext";
import { GripVertical, Trash2 } from "lucide-react";
import { closestCorners, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import "./favorites.css";

function FilmListCard({ filmData, removeItem }: { filmData: any, removeItem: Function }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const toast = useContext(ToastContext);
    const { removeFavorite } = useContext(GlobalContext);

    const { attributes, listeners, transform, transition, setNodeRef, isDragging } = useSortable({ id: filmData.favorite_id });

    const removeFromFavorites = (e: React.MouseEvent) => {
        e.preventDefault();

        setDeleteModalOpen(false);
        removeFavorite(filmData.media_id, filmData.type).then(() => {
            removeItem();
            toast.open("Item removed from favorites", "success");
        });
    }

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={{
                transition,
                transform: CSS.Transform.toString(transform),
            }}
            className={isDragging ? "list-card-container dragging" : "list-card-container"}
        >
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <div>
                    <h3 style={{textAlign: "center"}}>Delete {filmData.title} from your favorites?</h3>
                    <div className="modal-buttons">
                        <button className="button" onClick={() => setDeleteModalOpen(false)}>No</button>
                        <button className="button primary" onClick={removeFromFavorites}>Yes</button>
                    </div>
                </div>
            </Modal>
            <div className={isDragging ? "list-drag dragging" : "list-drag"} {...attributes} {...listeners} >
                <GripVertical/>
            </div>
            <Link to={`/media/${filmData.type}/${filmData.media_id}`} className="list-card-main-container">
                <figure className="list-card-img-container">
                    <picture>
                        <source media="(max-width: 768px)" srcSet={filmData.posterUrl} />
                        <img loading="lazy" src={filmData.backdropUrl} alt={filmData.title}/>
                    </picture>
                </figure>
                <div className="list-card-content">
                    <h4>{filmData.title}</h4>
                    <p>{filmData.description}</p>
                    <div>
                        <WatchlistButton size={24} mediaId={filmData.media_id} type={filmData.type} isWatchlisted={filmData.watchlisted}/>
                    </div>
                </div>
            </Link>
            <div className="list-card-delete">
                <span className="material-icons remove-list-item-btn" onClick={() => setDeleteModalOpen(true)}>
                    <Trash2/>
                </span>
            </div>
        </div>
    );
}

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [lastRank, setlastRank] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { mml_api_protected } = useContext(GlobalContext);
    const toast = useContext(ToastContext);

    useInfiniteScroll(() => getNextPage(), loading, !lastRank);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        document.title = "Favorites | My Movie List";

        mml_api_protected.get("api/v1/favorites").then((res) => {
            setFavorites(res.data.responseData.favorites);
            setLoading(false);

            if (res.data.responseData.lastRank) setlastRank(res.data.responseData.lastRank);
        }).catch(() => {
            toast.open("Error loading favorites", "error");
        });
    }, []);

    const getNextPage = () => {
        if (!lastRank) return;
        setLoading(true);

        mml_api_protected.get(`api/v1/favorites?last_rank=${lastRank}`).then((res) => {
            setFavorites([...favorites, ...res.data.responseData.favorites]);
            setLoading(false);

            if (res.data.responseData.lastRank) {
                setlastRank(res.data.responseData.lastRank);
            } else {
                setlastRank(null);
            }
        }).catch(() => {
            toast.open("Error loading favorites", "error");
        });
    }

    const removeItemFromFavorites = (i: number) => {
        favorites.splice(i, 1);
        setFavorites([...favorites]);
    }

    const handleOnDragEnd = (result: DragEndEvent) => {
        const { active, over } = result;
        if (!over || active.id === over.id) return;

        const activeIndex = favorites.findIndex((item) => item.favorite_id === active.id);
        const overIndex = favorites.findIndex((item) => item.favorite_id === over.id);

        const original = [...favorites];
        // Call the api to reorder the items
        mml_api_protected.post("api/v1/favorites/reorder", {
            ref_id: favorites[overIndex].favorite_id,
            target_id: favorites[activeIndex].favorite_id,
            position: overIndex > activeIndex ? "after" : "before"
        }).catch(() => {
            toast.open("Error reordering favorites", "error");
            setFavorites(original);
        });

        // Move the reordered items
        const updatedFavorites = [...favorites];
        const [temp] = updatedFavorites.splice(activeIndex, 1);
        updatedFavorites.splice(overIndex, 0, temp);

        setFavorites(updatedFavorites);
    }

    return (
        <div className="content">
            <div className="content-wrapper">
                <div className="favorites-container">
                    <h1>Favorites</h1>
                    {!loading && favorites.length < 1 ?
                    <div className="no-favorites">
                        <p style={{textAlign: "center", filter: "brightness(0.6)"}}>You have no favorites</p>
                        <Link to="/">
                            <button className="button primary">
                                Go to Home Feed
                            </button>
                        </Link>
                    </div>
                    :
                    <DndContext collisionDetection={closestCorners} onDragEnd={handleOnDragEnd} sensors={sensors}>
                        <SortableContext
                            items={favorites.map((i) => i.favorite_id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {favorites.map((film, index) => (
                                <FilmListCard
                                    key={film.favorite_id}
                                    filmData={film}
                                    removeItem={() => removeItemFromFavorites(index)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    }
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

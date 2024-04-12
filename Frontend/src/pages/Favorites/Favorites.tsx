import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import WatchlistButton from "../../components/watchlist-button-component/watchlist-button";
import Modal from "../../components/modal-component/modal";
import "./favorites.css";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { GlobalContext } from "../../contexts/GlobalContext";

function FilmListCard({ filmData, removeItem, provided, snapshot }: { filmData: any, removeItem: Function, provided: DraggableProvided, snapshot: DraggableStateSnapshot}) {
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const { removeFavorite } = useContext(GlobalContext);
    
    const removeFromFavorites = (e: React.MouseEvent) => {
        e.preventDefault();

        setDeleteModalOpen(false);
        removeFavorite(filmData.media_id, filmData.type).then(() => {
            removeItem();
        });
    }

    return (
        <div className={snapshot.isDragging ? "list-card-container dragging" : "list-card-container"}>
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <div>
                    <h3 style={{textAlign: "center"}}>Delete {filmData.title} from your favorites?</h3>
                    <div className="modal-buttons">
                        <button className="button" onClick={() => setDeleteModalOpen(false)}>No</button>
                        <button className="button primary" onClick={removeFromFavorites}>Yes</button>
                    </div>
                </div>
            </Modal>
            <div className="list-drag" {...provided.dragHandleProps}>
                <span className="material-icons" >drag_indicator</span>
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
                        <WatchlistButton size="" mediaId={filmData.media_id} type={filmData.type} isWatchlisted={filmData.watchlisted}/>
                    </div>
                </div>
            </Link>
            <div className="list-card-delete">
                <span className="material-icons remove-list-item-btn" onClick={() => setDeleteModalOpen(true)}>delete_outline</span>
            </div>
        </div>
    );
}

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [lastId, setLastId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { mml_api_protected } = useContext(GlobalContext);

    useInfiniteScroll(() => getNextPage(), loading, !lastId);

    useEffect(() => {
        document.title = "Favorites | My Movie List";

        mml_api_protected.get("api/v1/favorites").then((res) => {
            setFavorites(res.data.responseData.favorites);
            setLoading(false);

            if (res.data.responseData.lastId) setLastId(res.data.responseData.lastId);
        });
    }, []);

    const getNextPage = () => {
        if (!lastId) return;
        setLoading(true);

        mml_api_protected.get(`api/v1/favorites?last_id=${lastId}`).then((res) => {
            setFavorites([...favorites, ...res.data.responseData.favorites]);
            setLoading(false);

            if (res.data.responseData.lastId) {
                setLastId(res.data.responseData.lastId);
            } else {
                setLastId(null);
            }
        });
    }

    const removeItemFromFavorites = (i: number) => {
        favorites.splice(i, 1);
        setFavorites([...favorites]);
    }

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination || !result.source) return;
        const startIndex = result.source.index;
        const finalIndex = result.destination.index;

        if (startIndex === finalIndex) return;
        const original = [...favorites];
        
        // Call the api to reorder the items
        mml_api_protected.post("api/v1/favorites/reorder", {
            ref_id: favorites[finalIndex].id,
            target_id: favorites[startIndex].id,
            position: finalIndex > startIndex ? "after" : "before"
        }).catch((err) => {
            setFavorites(original);
            console.error("Unable to reorder: ", err);
        });

        // Move the reordered items
        const [temp] = favorites.splice(startIndex, 1);
        favorites.splice(finalIndex, 0, temp);

        setFavorites([...favorites]);
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
                    : <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="favorites">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {favorites.map((film, index) => (
                                        <Draggable key={`${index}.${film.id}.${film.type}`} draggableId={`${index}.${film.id}.${film.type}`} index={index}>
                                            {(providedDraggable, snapshotDraggable) => (
                                                <div {...providedDraggable.draggableProps} ref={providedDraggable.innerRef} className={snapshot.isDraggingOver && !snapshotDraggable.isDragging ? "drag-over" : ""}>
                                                    <FilmListCard
                                                        filmData={film} 
                                                        removeItem={() => removeItemFromFavorites(index)} 
                                                        provided={providedDraggable}
                                                        snapshot={snapshotDraggable}/>
                                                </div>
                                            )}
                                        </Draggable>
                                        // <span className="list-separator"></span>
                                    ))}
                                    {provided.placeholder}  
                                </div>
                            )}
                        </Droppable>

                    </DragDropContext>
                    }
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
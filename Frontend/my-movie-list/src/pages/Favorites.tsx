import React, { useEffect, useState } from "react";
import { mml_api_protected } from "../axios/mml_api_intances";
import { Link } from "react-router-dom";
import { removeFavorite } from "../helpers/util.helpers";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import "./favorites.css";
import WatchlistButton from "../components/watchlist-button-component/watchlist-button";

function FilmListCard({ filmData, removeItem, provided, snapshot }: { filmData: any, removeItem: Function, provided: DraggableProvided, snapshot: DraggableStateSnapshot}) {
    const removeFromFavorites = (e: React.MouseEvent) => {
        e.preventDefault();
        removeFavorite(filmData.media_id, filmData.type).then(() => {
            removeItem();
        });
    }

    return (
        <div className={snapshot.isDragging ? "list-card-container dragging" : "list-card-container"}>
            <div className="list-drag" {...provided.dragHandleProps}>
                <span className="material-icons" >drag_indicator</span>
            </div>
            <Link to={`/media/${filmData.type}/${filmData.media_id}`} className="list-card-main-container">
                <figure className="list-card-img-container">
                    <picture>
                        <source media="(max-width: 768px)" srcSet={filmData.poster_url} />
                        <img loading="lazy" src={filmData.backdrop_url} alt={filmData.title}/>
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
                <span className="material-icons remove-list-item-btn" onClick={removeFromFavorites}>delete_outline</span>
            </div>
        </div>
    );
}

export default function Favorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        mml_api_protected.get("api/v1/favorites").then((res) => {
            setFavorites(res.data.responseData.favorites);
            setLoading(false);
        });
    }, []);

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
                    <div className={loading ? "loader active" : "loader"}>
                        <div className="spinning-loader"></div>
                    </div>
                    {!loading && favorites.length < 1 ? 
                    <div className="no-favorites">
                        <p style={{textAlign: "center", filter: "brightness(0.6)"}}>You have no favorites</p>
                        <Link to="/">
                            <button className="primary-button">
                                Go to Home Feed
                            </button>
                        </Link>
                    </div>
                    : <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="favorites">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {favorites.map((film, index) => (
                                        <Draggable key={film.id} draggableId={film.id} index={index}>
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
                </div>
            </div>
        </div>
    );
}
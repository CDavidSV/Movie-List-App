import { createContext, useState } from "react";

interface PersonalListsContextProps {
    watchlistState: Map<string, boolean>;
    favoriteState: Map<string, boolean>;
    handleWatchlistState: (mediaId: string, type: string, state: boolean) => void;
    handleFavoriteState: (mediaId: string, type: string, state: boolean) => void;
};

export const PersonalListsContext = createContext<PersonalListsContextProps>({
    watchlistState: new Map(),
    favoriteState: new Map(),
    handleWatchlistState: () => {},
    handleFavoriteState: () => {}
});

export default function PersonalListsProvider({ children }: { children: React.ReactNode }) {
    const [watchlistState, setWatchlistState] = useState(new Map<string, boolean>());
    const [favoriteState, setFavoriteState] = useState(new Map<string, boolean>());

    const handleWatchlistState = (mediaId: string, type: string, state: boolean) => {
        const uniqueId = `${mediaId}.${type}`;
        const newWatchlistState = new Map(watchlistState);
        newWatchlistState.set(uniqueId, state);
        setWatchlistState(newWatchlistState);
    }

    const handleFavoriteState = (mediaId: string, type: string, state: boolean) => {
        const uniqueId = `${mediaId}.${type}`;
        const newFavoriteState = new Map(favoriteState);
        newFavoriteState.set(uniqueId, state);
        setFavoriteState(newFavoriteState);
    }

    return (
        <PersonalListsContext.Provider value={{
            watchlistState,
            favoriteState,
            handleWatchlistState,
            handleFavoriteState
            }}>
            {children}
        </PersonalListsContext.Provider>
    )
};
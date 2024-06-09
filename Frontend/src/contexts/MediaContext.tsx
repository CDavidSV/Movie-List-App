import { createContext, useContext, useState } from 'react';
import { GlobalContext } from './GlobalContext';
import { ToastContext } from './ToastContext';
interface MediaContextProps {
    getMediaData: (mediaId: string, type: string) => Promise<any>;
    homeData?: HomeData;
    setHomeData: React.Dispatch<React.SetStateAction<HomeData>>;
}

export const MediaContext = createContext<MediaContextProps>({
    getMediaData: async () => {},
    homeData: undefined,
    setHomeData: () => {}
});

export default function MediaProvider({ children }: { children: React.ReactNode }) {
    const { mml_api } = useContext(GlobalContext);
    const toast = useContext(ToastContext);
    
    const [mediaData, setMediaData] = useState(new Map<string, any>());
    const [homeData, setHomeData] = useState<HomeData>({
        popularMovies: [],
        upcoming: [],
        topRated: [],
        watchlist: [],
        carouselData: []
    });

    const getMediaData = async (mediaId: string, type: string): Promise<any> => {
        const uniqueId = `${mediaId}.${type}`;
        if (mediaData.has(uniqueId)) {
            return mediaData.get(uniqueId);
        } else {
            // Fetch the data store it and return it
            return await mml_api.get(`/api/v1/media/fetch-by-id?media_id=${mediaId}&type=${type}`).then((res) => {
                const newMediaData = new Map(mediaData);
                newMediaData.set(uniqueId, res.data.responseData);
                setMediaData(newMediaData);
                return res.data.responseData;
            }).catch(() => {
                toast.open("Error fetching media data", "error");
                return null;
            });
        }
    };

    return (
        <MediaContext.Provider value={{
            getMediaData,
            homeData,
            setHomeData
        }}>
            {children}
        </MediaContext.Provider>
    );
}
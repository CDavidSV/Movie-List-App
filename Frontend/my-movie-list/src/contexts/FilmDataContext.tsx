import { createContext, useState } from "react";
import { mml_api } from "../axios/mml_api_intances";

export const MediaDataContext = createContext<(mediaId: string, type: string) => Promise<any>>(async () => {});

export default function MediaDataProvider({ children }: { children: React.ReactNode }) {
    const [mediaData, setMediaData] = useState(new Map<string, any>());

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
            }).catch((err) => {
                console.error("Error fetching media data: ", err);
                return null;
            });
        }
    };

    return (
        <MediaDataContext.Provider value={getMediaData}>
            {children}
        </MediaDataContext.Provider>
    )
}
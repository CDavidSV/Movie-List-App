import { useEffect } from "react";

const useInfiniteScroll = (loadData: () => void, isLoading: boolean, isDisabled?: boolean) => {
    let endedScroll = true;

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight) {
            endedScroll = true;
        }
        
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 500 && endedScroll) {
            endedScroll = false;

            if (isLoading) return;
            loadData();
            console.log("loading");
        }
    }

    useEffect(() => {
        if (isDisabled) return;
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [isLoading, isDisabled]);
};

export default useInfiniteScroll;
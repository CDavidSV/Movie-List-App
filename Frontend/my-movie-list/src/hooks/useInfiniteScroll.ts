import { useEffect } from "react";

const useInfiniteScroll = (loadData: () => void, isLoading: boolean) => {
    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 500) {

            if (isLoading) return;
            loadData();
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [isLoading]);
};

export default useInfiniteScroll;
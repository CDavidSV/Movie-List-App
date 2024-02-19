import { useEffect } from "react";

const useInfiniteScroll = (loadData: () => void, isLoading: boolean, isDisabled?: boolean) => {
    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 500) {

            if (isLoading) return;
            loadData();
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
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useRouteChange(callback: Function) {
  const location = useLocation();

  useEffect(() => {
    callback();
  }, [location]);
}

export default useRouteChange;
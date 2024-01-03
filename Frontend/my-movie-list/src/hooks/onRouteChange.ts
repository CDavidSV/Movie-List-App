import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function onRouteChange(callback: Function) {
  const location = useLocation();

  useEffect(() => {
    callback();
  }, [location]);
}

export default onRouteChange;
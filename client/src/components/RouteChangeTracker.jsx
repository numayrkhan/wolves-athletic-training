// in client/src/components/RouteChangeTracker.jsx

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Send a pageview event to Google Analytics every time the path changes
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]); // This effect runs every time the location object changes

  return null; // This component does not render anything
};

export default RouteChangeTracker;
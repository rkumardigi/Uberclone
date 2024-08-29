// contexts.js
import React from 'react';

export const OriginContext = React.createContext();
export const DestinationContext = React.createContext();

export const OriginContextProvider = ({ children }) => {
  const [origin, setOrigin] = React.useState({
    latitude: 0,
    longitude: 0,
  });

  const dispatchOrigin = (action) => {
    switch (action.type) {
      case "ADD_ORIGIN":
        setOrigin(action.payload);
        break;
      default:
        break;
    }
  };

  return (
    <OriginContext.Provider value={{ origin, dispatchOrigin }}>
      {children}
    </OriginContext.Provider>
  );
};

export const DestinationContextProvider = ({ children }) => {
  const [destination, setDestination] = React.useState({
    latitude: 0,
    longitude: 0,
  });

  const dispatchDestination = (action) => {
    switch (action.type) {
      case "ADD_DESTINATION":
        setDestination(action.payload);
        break;
      default:
        break;
    }
  };

  return (
    <DestinationContext.Provider value={{ destination, dispatchDestination }}>
      {children}
    </DestinationContext.Provider>
  );
};

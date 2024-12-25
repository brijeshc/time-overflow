import React, { createContext, useContext, useState } from 'react';

type TimeLoggingContextType = {
  refreshTrigger: number;
  triggerRefresh: () => void;
};

const TimeLoggingContext = createContext<TimeLoggingContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const TimeLoggingProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <TimeLoggingContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </TimeLoggingContext.Provider>
  );
};

export const useTimeLogging = () => useContext(TimeLoggingContext);

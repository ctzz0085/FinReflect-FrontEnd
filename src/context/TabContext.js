import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('income');
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    triggerRefresh();
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, switchTab, refreshKey, triggerRefresh }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

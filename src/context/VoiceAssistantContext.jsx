import React, { createContext, useContext, useRef } from 'react';

const VoiceAssistantContext = createContext(null);

export const VoiceAssistantProvider = ({ children }) => {
  const openVoiceAssistantRef = useRef(null);

  const setOpenHandler = (handler) => {
    openVoiceAssistantRef.current = handler;
  };

  const openVoiceAssistant = () => {
    if (openVoiceAssistantRef.current) {
      openVoiceAssistantRef.current();
    }
  };

  return (
    <VoiceAssistantContext.Provider value={{ setOpenHandler, openVoiceAssistant }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  }
  return context;
};

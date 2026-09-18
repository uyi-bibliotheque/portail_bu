// contexts/CookieContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import useCookieConsent from '../hooks/useCookieConsent';

const CookieContext = createContext(null);

export function CookieProvider({ children }) {
  const cookieConsent = useCookieConsent();

  // Appliquer les préférences automatiquement au chargement
  useEffect(() => {
    if (cookieConsent.consentGiven) {
      cookieConsent.applyCookieSettings(cookieConsent.preferences);
    }
  }, [cookieConsent.consentGiven]);

  return (
    <CookieContext.Provider value={cookieConsent}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
}

export default CookieContext;
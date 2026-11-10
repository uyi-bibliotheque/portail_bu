// contexts/CookieContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import useCookieConsent from '../hooks/useCookieConsent';

const CookieContext = createContext(null);

export function CookieProvider({ children }) {
  const cookieConsent = useCookieConsent();
  const {
    hasConsentChoice,
    preferences,
    applyCookieSettings,
  } = cookieConsent;

  // Apply the stored choice on load; edited preferences take effect only after saving.
  useEffect(() => {
    if (hasConsentChoice) {
      applyCookieSettings(preferences);
    }
  }, [hasConsentChoice]);

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
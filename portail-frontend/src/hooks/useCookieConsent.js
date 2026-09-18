// hooks/useCookieConsent.js
import { useState, useEffect, useCallback } from 'react';
import {
  getCookiePreferences,
  getCookieConsent,
  saveCookiePreferences,
  clearCookiePreferences,
  hasConsented,
  revokeConsent,
  DEFAULT_COOKIE_PREFERENCES,
  COOKIE_TYPES
} from '../utils/cookieUtils';

export function useCookieConsent() {
  const [preferences, setPreferences] = useState(DEFAULT_COOKIE_PREFERENCES);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPrefs = getCookiePreferences();
    const hasConsent = getCookieConsent();
    
    if (savedPrefs && hasConsent) {
      setPreferences(savedPrefs);
      setConsentGiven(true);
    } else {
      setPreferences(DEFAULT_COOKIE_PREFERENCES);
      setConsentGiven(false);
    }
    setIsLoading(false);
  }, []);

  const acceptAll = useCallback(() => {
    const allEnabled = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true
    };
    setPreferences(allEnabled);
    setConsentGiven(true);
    saveCookiePreferences(allEnabled);
    applyCookieSettings(allEnabled);
  }, []);

  const acceptNecessary = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    };
    setPreferences(necessaryOnly);
    setConsentGiven(true);
    saveCookiePreferences(necessaryOnly);
    applyCookieSettings(necessaryOnly);
  }, []);

  const savePreferences = useCallback((newPreferences) => {
    const validated = { ...DEFAULT_COOKIE_PREFERENCES, ...newPreferences };
    setPreferences(validated);
    setConsentGiven(true);
    saveCookiePreferences(validated);
    applyCookieSettings(validated);
  }, []);

  const togglePreference = useCallback((type) => {
    if (type === COOKIE_TYPES.NECESSARY) return;
    
    setPreferences(prev => {
      const newPrefs = { ...prev, [type]: !prev[type] };
      return newPrefs;
    });
  }, []);

  const rejectAll = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    };
    setPreferences(necessaryOnly);
    setConsentGiven(false);
    revokeConsent();
    applyCookieSettings(necessaryOnly);
  }, []);

  const revoke = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    };
    setPreferences(necessaryOnly);
    setConsentGiven(false);
    revokeConsent();
    applyCookieSettings(necessaryOnly);
  }, []);

  const reset = useCallback(() => {
    clearCookiePreferences();
    setPreferences(DEFAULT_COOKIE_PREFERENCES);
    setConsentGiven(false);
  }, []);

  const isEnabled = useCallback((type) => {
    return preferences[type] === true;
  }, [preferences]);

  const isFullyAccepted = useCallback(() => {
    return Object.values(preferences).every(value => value === true);
  }, [preferences]);

  const isEssentialOnly = useCallback(() => {
    return (
      preferences.necessary === true &&
      preferences.preferences === false &&
      preferences.statistics === false &&
      preferences.marketing === false
    );
  }, [preferences]);

  const applyCookieSettings = useCallback((prefs) => {
    // Émettre un événement pour que les autres composants puissent réagir
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
      detail: prefs
    }));
    
    // Appliquer les préférences à Google Analytics si disponible
    if (typeof gtag !== 'undefined') {
      try {
        gtag('consent', 'update', {
          'analytics_storage': prefs.statistics ? 'granted' : 'denied',
          'ad_storage': prefs.marketing ? 'granted' : 'denied',
          'ad_user_data': prefs.marketing ? 'granted' : 'denied',
          'ad_personalization': prefs.marketing ? 'granted' : 'denied'
        });
      } catch (e) {
        console.warn('Erreur lors de la mise à jour du consentement Google Analytics:', e);
      }
    }
    
    // Appliquer les préférences à Facebook Pixel si disponible
    if (typeof fbq !== 'undefined') {
      try {
        if (prefs.marketing) {
          fbq('consent', 'grant');
        } else {
          fbq('consent', 'revoke');
        }
      } catch (e) {
        console.warn('Erreur lors de la mise à jour du consentement Facebook Pixel:', e);
      }
    }
  }, []);

  return {
    preferences,
    consentGiven,
    isLoading,
    acceptAll,
    acceptNecessary,
    savePreferences,
    togglePreference,
    rejectAll,
    revoke,
    reset,
    isEnabled,
    isFullyAccepted,
    isEssentialOnly,
    applyCookieSettings
  };
}

export default useCookieConsent;
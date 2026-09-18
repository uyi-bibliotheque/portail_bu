// utils/cookieUtils.js

export const COOKIE_TYPES = {
  NECESSARY: 'necessary',
  PREFERENCES: 'preferences',
  STATISTICS: 'statistics',
  MARKETING: 'marketing'
};

export const DEFAULT_COOKIE_PREFERENCES = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false
};

export function getCookiePreferences() {
  try {
    const saved = localStorage.getItem('cookiePreferences');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_COOKIE_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Erreur lors du chargement des préférences cookies:', e);
  }
  return null;
}

export function getCookieConsent() {
  return localStorage.getItem('cookieConsent') === 'true';
}

export function isCookieAllowed(type) {
  const prefs = getCookiePreferences();
  if (!prefs) return false;
  return prefs[type] === true;
}

export function isStatisticsAllowed() {
  return isCookieAllowed(COOKIE_TYPES.STATISTICS);
}

export function isMarketingAllowed() {
  return isCookieAllowed(COOKIE_TYPES.MARKETING);
}

export function isPreferencesAllowed() {
  return isCookieAllowed(COOKIE_TYPES.PREFERENCES);
}

export function isNecessaryAllowed() {
  return true;
}

export function saveCookiePreferences(preferences) {
  try {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsent', 'true');
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde des préférences cookies:', e);
  }
}

export function clearCookiePreferences() {
  try {
    localStorage.removeItem('cookiePreferences');
    localStorage.removeItem('cookieConsent');
  } catch (e) {
    console.warn('Erreur lors de la suppression des préférences cookies:', e);
  }
}

export function revokeConsent() {
  try {
    localStorage.setItem('cookieConsent', 'false');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    }));
  } catch (e) {
    console.warn('Erreur lors de la révocation du consentement:', e);
  }
}

export function getAllCookieConfigs() {
  return [
    {
      id: 'necessary',
      label: 'Cookies essentiels',
      description: 'Nécessaires au bon fonctionnement du site. Ils ne peuvent pas être désactivés.',
      required: true,
      icon: '🔒',
      duration: 'Session'
    },
    {
      id: 'preferences',
      label: 'Cookies de préférences',
      description: 'Permettent de mémoriser vos préférences (langue, affichage) pour personnaliser votre expérience.',
      required: false,
      icon: '⚙️',
      duration: '30 jours'
    },
    {
      id: 'statistics',
      label: 'Cookies statistiques',
      description: 'Collectent des informations anonymes sur votre navigation pour améliorer le site.',
      required: false,
      icon: '📊',
      duration: '30 jours'
    },
    {
      id: 'marketing',
      label: 'Cookies marketing',
      description: 'Utilisés pour vous proposer du contenu et des publicités pertinents.',
      required: false,
      icon: '🎯',
      duration: '30 jours'
    }
  ];
}

export function hasConsented() {
  return localStorage.getItem('cookieConsent') === 'true';
}
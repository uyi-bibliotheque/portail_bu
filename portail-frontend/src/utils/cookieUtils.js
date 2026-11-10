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

const CONSENT_STORAGE_KEY = 'cookieConsent';
const CONSENT_UPDATED_AT_KEY = 'cookieConsentUpdatedAt';
const CONSENT_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

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

export function hasCookieChoice() {
  try {
    const storedChoice = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedChoice !== 'true' && storedChoice !== 'false') {
      return false;
    }

    const storedAt = localStorage.getItem(CONSENT_UPDATED_AT_KEY);
    if (!storedAt) {
      // Preserve consent recorded by older versions and start its retention period now.
      localStorage.setItem(CONSENT_UPDATED_AT_KEY, String(Date.now()));
      return true;
    }

    const updatedAt = Number(storedAt);
    const now = Date.now();
    if (
      !Number.isFinite(updatedAt)
      || updatedAt > now
      || now - updatedAt >= CONSENT_VALIDITY_MS
    ) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      localStorage.removeItem(CONSENT_UPDATED_AT_KEY);
      localStorage.setItem('cookiePreferences', JSON.stringify(DEFAULT_COOKIE_PREFERENCES));
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Erreur lors du chargement du choix de consentement:', e);
    return false;
  }
}

export function getCookieConsent() {
  try {
    return hasCookieChoice() && localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
  } catch (e) {
    console.warn('Erreur lors du chargement du consentement cookies:', e);
    return false;
  }
}

export function isCookieAllowed(type) {
  const prefs = getCookiePreferences();
  if (!prefs || !hasCookieChoice()) return false;
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
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    localStorage.setItem(CONSENT_UPDATED_AT_KEY, String(Date.now()));
  } catch (e) {
    console.warn('Erreur lors de la sauvegarde des préférences cookies:', e);
  }
}

export function clearCookiePreferences() {
  try {
    localStorage.removeItem('cookiePreferences');
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem(CONSENT_UPDATED_AT_KEY);
  } catch (e) {
    console.warn('Erreur lors de la suppression des préférences cookies:', e);
  }
}

export function revokeConsent() {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'false');
    localStorage.setItem(CONSENT_UPDATED_AT_KEY, String(Date.now()));
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
  return getCookieConsent();
}
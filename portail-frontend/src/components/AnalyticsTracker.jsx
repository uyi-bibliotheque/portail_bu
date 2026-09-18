// components/AnalyticsTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isStatisticsAllowed, getCookiePreferences } from '../utils/cookieUtils';

/**
 * Composant AnalyticsTracker - Suivi des pages visitées
 * Ne collecte des données que si l'utilisateur a accepté les cookies statistiques
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Vérifier si les cookies statistiques sont autorisés
    const isAllowed = isStatisticsAllowed();
    
    if (!isAllowed) {
      return;
    }

    // Envoyer une vue de page à Google Analytics
    if (typeof window.gtag !== 'undefined') {
      try {
        window.gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_title: document.title || location.pathname,
          page_location: window.location.href
        });
      } catch (error) {
        // Silencieux
      }
    }

    // Envoyer une vue de page à Matomo/Piwik si disponible
    if (typeof window._paq !== 'undefined') {
      try {
        window._paq.push(['setCustomUrl', window.location.href]);
        window._paq.push(['setDocumentTitle', document.title]);
        window._paq.push(['trackPageView']);
      } catch (error) {
        // Silencieux
      }
    }

    // Envoyer un événement personnalisé
    sendCustomAnalyticsEvent('page_view', {
      path: location.pathname,
      search: location.search,
      title: document.title,
      referrer: document.referrer
    });

  }, [location]);

  return null;
}

/**
 * Envoyer un événement d'analyse personnalisé
 */
function sendCustomAnalyticsEvent(eventName, data) {
  if (!isStatisticsAllowed()) {
    return;
  }

  try {
    // Stocker dans localStorage pour analyse ultérieure
    const analyticsData = JSON.parse(localStorage.getItem('analytics_data') || '[]');
    analyticsData.push({
      event: eventName,
      data: data,
      timestamp: new Date().toISOString()
    });
    if (analyticsData.length > 1000) {
      analyticsData.shift();
    }
    localStorage.setItem('analytics_data', JSON.stringify(analyticsData));
  } catch (error) {
    // Silencieux
  }
}

/**
 * Suivre un événement personnalisé
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!isStatisticsAllowed()) {
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    try {
      window.gtag('event', eventName, eventParams);
    } catch (error) {
      // Silencieux
    }
  }

  sendCustomAnalyticsEvent(eventName, eventParams);
}

/**
 * Suivre une conversion
 */
export function trackConversion(conversionType, value = null) {
  if (!isStatisticsAllowed()) {
    return;
  }

  const params = {
    event_category: 'conversion',
    event_label: conversionType,
    value: value,
    non_interaction: false
  };

  if (typeof window.gtag !== 'undefined') {
    try {
      window.gtag('event', 'conversion', params);
    } catch (error) {
      // Silencieux
    }
  }

  sendCustomAnalyticsEvent('conversion', {
    type: conversionType,
    value: value,
    url: window.location.href
  });
}
// components/layout/Layout.jsx - VERSION AVEC ONBOARDING
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Reveal from '../Reveal';
import CookieConsent from '../CookieConsent';
import AnalyticsTracker from '../AnalyticsTracker';
import CookiePreferenceManager from '../CookiePreferenceManager';
import WelcomeModal from '../onboarding/WelcomeModal';
import TourOverlay from '../onboarding/TourOverlay';
import HelpButton from '../onboarding/HelpButton';
import { CookieProvider } from '../../contexts/CookieContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';

const HINTS_BY_ROUTE = {
  '/': [
    { title: 'Astuce', text: 'Utilisez la recherche pour trouver un document ou ouvrez l’OPAC PMB pour explorer la collection complète.' },
  ],
  '/catalogue': [
    { title: 'Catalogue', text: 'Vous pouvez chercher ici ou ouvrir directement l’OPAC PMB si vous souhaitez parcourir toute la collection.' },
  ],
  '/depot/soumettre': [
    { title: 'Dépôt', text: 'Le dépôt de mémoire et de thèse est actuellement en cours de développement et ne sera pas encore disponible.' },
  ],
  '/archives': [
    { title: 'Archives', text: 'Consultez les mémoires et thèses déjà disponibles dans le répertoire institutionnel.' },
  ],
};

function FirstVisitHints() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const key = 'bcu_first_visit_hints';
    const routeHints = HINTS_BY_ROUTE[location.pathname] || HINTS_BY_ROUTE['/'];
    const stored = JSON.parse(localStorage.getItem(key) || '{}');

    if (!stored[location.pathname]) {
      setVisible(true);
      setHintIndex(0);
    } else {
      setVisible(false);
    }

    const dismissHint = () => {
      const updated = { ...stored, [location.pathname]: true };
      localStorage.setItem(key, JSON.stringify(updated));
      setVisible(false);
    };

    // Nettoyage
    return () => {
      // rien
    };
  }, [location.pathname]);

  return null; // Désactiver les hints pour simplifier
}

function LayoutContent({ children, noFooter = false, noReveal = false }) {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="main" role="main" style={{ flex: 1 }} className="page-enter">
        {noReveal ? (
          children
        ) : (
          <Reveal className="reveal-fade">{children}</Reveal>
        )}
      </main>
      {!noFooter && <Footer />}
      <CookieConsent />
      <CookiePreferenceManager />
      <AnalyticsTracker />
      <WelcomeModal />
      <TourOverlay />
      <HelpButton />
    </div>
  );
}

export default function Layout({ children, noFooter = false, noReveal = false }) {
  return (
    <CookieProvider>
      <NotificationProvider>
        <OnboardingProvider>
          <LayoutContent noFooter={noFooter} noReveal={noReveal}>
            {children}
          </LayoutContent>
        </OnboardingProvider>
      </NotificationProvider>
    </CookieProvider>
  );
}
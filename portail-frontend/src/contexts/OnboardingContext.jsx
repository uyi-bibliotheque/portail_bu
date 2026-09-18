// contexts/OnboardingContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'bcu_onboarding_v1';
const STORAGE_COMPLETED = 'bcu_onboarding_completed';
const STORAGE_TOUR_SEEN = 'bcu_tour_seen';

export function OnboardingProvider({ children }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_COMPLETED);
      const tourSeen = localStorage.getItem(STORAGE_TOUR_SEEN);
      const visited = localStorage.getItem(STORAGE_KEY);

      if (visited) {
        setHasVisitedBefore(true);
      } else {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      }

      // Afficher le welcome si jamais complété
      if (!completed) {
        const timer = setTimeout(() => setShowWelcome(true), 1500);
        setIsReady(true);
        return () => clearTimeout(timer);
      }
      setIsReady(true);
    } catch (err) {
      console.warn('Erreur onboarding storage:', err);
      setIsReady(true);
    }
  }, []);

  const startTour = useCallback(() => {
    setShowTour(true);
    setTourStep(0);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);

  const prevTourStep = useCallback(() => {
    setTourStep(prev => Math.max(0, prev - 1));
  }, []);

  const endTour = useCallback((completed = true) => {
    setShowTour(false);
    setTourStep(0);
    if (completed) {
      try {
        localStorage.setItem(STORAGE_TOUR_SEEN, new Date().toISOString());
      } catch {}
    }
  }, []);

  const completeWelcome = useCallback((startTourImmediately = false) => {
    setShowWelcome(false);
    try {
      localStorage.setItem(STORAGE_COMPLETED, new Date().toISOString());
    } catch {}
    if (startTourImmediately) {
      setTimeout(() => startTour(), 300);
    }
  }, [startTour]);

  const reopenWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  const restartOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_COMPLETED);
      localStorage.removeItem(STORAGE_TOUR_SEEN);
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setShowWelcome(true);
    setShowTour(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        showWelcome,
        showTour,
        tourStep,
        hasVisitedBefore,
        isReady,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        completeWelcome,
        reopenWelcome,
        restartOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
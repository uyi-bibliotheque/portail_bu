// components/CookiePreferenceManager.jsx
import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { useCookieContext } from '../contexts/CookieContext';

export default function CookiePreferenceManager() {
  const [isHovered, setIsHovered] = useState(false);
  const { consentGiven } = useCookieContext();

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  // Si l'utilisateur n'a pas encore consenti, ne pas afficher le bouton
  if (!consentGiven) {
    return null;
  }

  return (
    <button
      onClick={openSettings}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: 'clamp(16px, 2vw, 24px)',
        right: 'clamp(16px, 2vw, 24px)',
        zIndex: 9998,
        background: isHovered ? 'rgba(27, 20, 100, 0.95)' : 'rgba(27, 20, 100, 0.8)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%',
        width: 'clamp(44px, 4vw, 52px)',
        height: 'clamp(44px, 4vw, 52px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}
      aria-label="Gérer les cookies"
    >
      <Cookie size={20} />
    </button>
  );
}
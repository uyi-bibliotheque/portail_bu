// src/components/CookieStatusBar.jsx
import { useState, useEffect } from 'react';
import { useCookieContext } from '../contexts/CookieContext';
import { CheckCircle, AlertCircle, XCircle, Settings } from 'lucide-react';

/**
 * Barre de statut des cookies (optionnelle)
 */
export default function CookieStatusBar() {
  const { preferences, consentGiven } = useCookieContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Afficher la barre de statut après 5 secondes si l'utilisateur a consenti
    if (consentGiven) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [consentGiven]);

  if (!visible || !consentGiven) {
    return null;
  }

  const totalAccepted = Object.values(preferences).filter(v => v === true).length;
  const totalTypes = Object.keys(preferences).length;

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(80px, 10vw, 100px)',
        right: 'clamp(16px, 2vw, 24px)',
        zIndex: 9997,
        background: 'rgba(27, 20, 100, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 'clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 16px)',
        borderRadius: 50,
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        animation: 'fadeInCookie 0.3s ease',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={openSettings}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(27, 20, 100, 0.95)';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(27, 20, 100, 0.9)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {totalAccepted === totalTypes ? (
        <CheckCircle size={16} color="#10B981" />
      ) : totalAccepted === 1 ? (
        <AlertCircle size={16} color="#F59E0B" />
      ) : (
        <XCircle size={16} color="#EF4444" />
      )}
      <span style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: 'clamp(11px, 0.8vw, 12px)',
        fontWeight: 500
      }}>
        {totalAccepted}/{totalTypes} cookies acceptés
      </span>
      <Settings size={14} color="rgba(255,255,255,0.4)" />
    </div>
  );
}
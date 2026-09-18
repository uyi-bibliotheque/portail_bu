// components/onboarding/HelpButton.jsx - PALETTE CORRIGÉE
import { useState, useEffect } from 'react';
import { HelpCircle, X, Sparkles, RotateCcw } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',
  orDark: '#6D28D9',
  orLight: '#8B5CF6',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  texte: '#1E293B',
  texteMuted: '#64748b',
  texteLight: '#94a3b8',
};

export default function HelpButton() {
  const { startTour, reopenWelcome, restartOnboarding } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes helpPop {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulsePurple {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(90px, 12vw, 110px)',
          right: 'clamp(16px, 2vw, 24px)',
          zIndex: 9997,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {open && (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 12,
              boxShadow: '0 16px 48px rgba(27,20,100,0.18)',
              border: `1px solid ${COLORS.beigeDark}`,
              animation: 'helpPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              minWidth: 240,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.or,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
                paddingLeft: 6,
              }}
            >
              Besoin d'aide ?
            </div>
            <button
              onClick={() => { setOpen(false); startTour(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                color: COLORS.bleuNuit, fontSize: 13, fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.beige}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: COLORS.beigeDark,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.or, flexShrink: 0,
              }}>
                <Sparkles size={15} />
              </div>
              Visite guidée
            </button>

            <button
              onClick={() => { setOpen(false); reopenWelcome(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                color: COLORS.bleuNuit, fontSize: 13, fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.beige}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(27,20,100,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.bleuNuit, flexShrink: 0,
              }}>
                <HelpCircle size={15} />
              </div>
              Présentation du site
            </button>

            <div style={{
              height: 1, background: COLORS.beigeDark,
              margin: '6px 4px',
            }} />

            <button
              onClick={() => {
                setOpen(false);
                if (window.confirm('Relancer l\'onboarding depuis le début ?')) {
                  restartOnboarding();
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 12px', borderRadius: 10,
                background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                color: COLORS.texteLight, fontSize: 12,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.beige}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RotateCcw size={14} />
              Réinitialiser l'onboarding
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Fermer l\'aide' : 'Ouvrir l\'aide'}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: open
              ? `linear-gradient(135deg, ${COLORS.bleuNuit}, ${COLORS.bleuNuitLight})`
              : `linear-gradient(135deg, ${COLORS.or}, ${COLORS.orDark})`,
            border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !open ? 'pulsePurple 2.5s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {open ? <X size={22} /> : <HelpCircle size={24} />}
        </button>
      </div>
    </>
  );
}
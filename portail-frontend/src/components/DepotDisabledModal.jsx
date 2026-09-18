// src/components/DepotDisabledModal.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X, Mail, Clock, ShieldAlert } from 'lucide-react';
import { FEATURES } from '../config/features';

const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',
  orDark: '#6D28D9',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  texteMuted: '#64748b',
};

export default function DepotDisabledModal({ isOpen, onClose }) {
  // Fermer avec Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 20, 100, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'depotFadeIn 0.3s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes depotFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes depotSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseWarn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
        }
        .depot-modal-card {
          animation: depotSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div
        className="depot-modal-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(27,20,100,0.4)',
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: COLORS.bleuNuit,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(90deg) scale(1.08)';
            e.currentTarget.style.background = COLORS.or;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
            e.currentTarget.style.color = COLORS.bleuNuit;
          }}
        >
          <X size={18} />
        </button>

        {/* Header avec dégradé */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 100%)`,
            padding: '36px 28px 28px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(245,158,11,0.2)',
                border: '2px solid rgba(245,158,11,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                animation: 'pulseWarn 2s ease-in-out infinite',
              }}
            >
              <ShieldAlert size={32} color="#FCD34D" />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#FCD34D',
                padding: '4px 12px',
                borderRadius: 50,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              <Clock size={11} /> EN COURS DE FINALISATION
            </div>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.25,
                marginBottom: 8,
                fontFamily: 'var(--font-serif, serif)',
              }}
            >
              {FEATURES.DEPOT_DISABLED_TITLE}
            </h2>

            <p
              style={{
                fontSize: 13.5,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
              }}
            >
              Cette fonctionnalité sera prochainement disponible.
            </p>
          </div>
        </div>

        {/* Corps du message */}
        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '14px 16px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p
              style={{
                fontSize: 13.5,
                color: '#92400E',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {FEATURES.DEPOT_DISABLED_MESSAGE}
            </p>
          </div>

          {/* Info ETA */}
          {FEATURES.DEPOT_DISABLED_ETA && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: COLORS.beige,
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 12.5,
                color: COLORS.bleuNuit,
              }}
            >
              <Clock size={14} color={COLORS.or} />
              <span>
                <strong>Disponibilité :</strong> {FEATURES.DEPOT_DISABLED_ETA}
              </span>
            </div>
          )}

          {/* Info contact */}
          {FEATURES.DEPOT_DISABLED_CONTACT && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: COLORS.beige,
                borderRadius: 10,
                marginBottom: 24,
                fontSize: 12.5,
                color: COLORS.bleuNuit,
                wordBreak: 'break-all',
              }}
            >
              <Mail size={14} color={COLORS.or} style={{ flexShrink: 0 }} />
              <span>
                <strong>Contact :</strong>{' '}
                <a
                  href={`mailto:${FEATURES.DEPOT_DISABLED_CONTACT}`}
                  style={{ color: COLORS.or, textDecoration: 'underline' }}
                >
                  {FEATURES.DEPOT_DISABLED_CONTACT}
                </a>
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                minWidth: 140,
                padding: '12px 20px',
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.bleuNuit}, ${COLORS.bleuNuitLight})`,
                color: 'white',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(27,20,100,0.3)',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,20,100,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(27,20,100,0.3)';
              }}
            >
              J'ai compris
            </button>
            <Link
              to="/archives"
              onClick={onClose}
              style={{
                flex: 1,
                minWidth: 140,
                padding: '12px 20px',
                borderRadius: 10,
                background: 'white',
                border: `1.5px solid ${COLORS.beigeDark}`,
                color: COLORS.bleuNuit,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.or;
                e.currentTarget.style.background = COLORS.beige;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.beigeDark;
                e.currentTarget.style.background = 'white';
              }}
            >
              Voir les archives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
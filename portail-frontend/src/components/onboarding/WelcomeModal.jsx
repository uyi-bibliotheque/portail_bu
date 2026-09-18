// components/onboarding/WelcomeModal.jsx - VERSION CORRIGÉE ET COMPLÈTE
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, BookOpen, Search, GraduationCap, FileText,
  Wifi, Globe, X, PlayCircle, SkipForward, Heart
} from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

// ═══════════════════════════════════════════════════════════════════
// ─── PALETTE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// ─── FEATURES BILINGUES ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: <Search size={22} />,
    color: COLORS.bleuNuit,
    bg: 'rgba(27,20,100,0.08)',
    title: { fr: 'Catalogue documentaire', en: 'Documentary catalog' },
    desc: {
      fr: 'Recherchez parmi plus de 85 000 ouvrages, thèses et mémoires via l\'OPAC PMB.',
      en: 'Search among more than 85,000 books, theses and dissertations through the PMB OPAC.',
    },
  },
  {
    icon: <GraduationCap size={22} />,
    color: COLORS.or,
    bg: 'rgba(124,58,237,0.10)',
    title: { fr: 'Thèses & Mémoires', en: 'Theses & Dissertations' },
    desc: {
      fr: 'Consultez et téléchargez les travaux de recherche de l\'Université de Yaoundé I.',
      en: 'View and download the research work of the University of Yaoundé I.',
    },
  },
  {
    icon: <FileText size={22} />,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    title: { fr: 'Dépôt institutionnel', en: 'Institutional repository' },
    desc: {
      fr: 'Déposez votre mémoire ou thèse en ligne en quelques clics.',
      en: 'Submit your dissertation or thesis online in a few clicks.',
    },
  },
  {
    icon: <Globe size={22} />,
    color: COLORS.or,
    bg: 'rgba(124,58,237,0.10)',
    title: { fr: 'Ressources électroniques', en: 'Electronic resources' },
    desc: {
      fr: 'Accédez à Research4Life, DOAJ, OpenEdition et des milliers de revues scientifiques.',
      en: 'Access Research4Life, DOAJ, OpenEdition and thousands of scientific journals.',
    },
  },
  {
    icon: <Wifi size={22} />,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    title: { fr: 'Services numériques', en: 'Digital services' },
    desc: {
      fr: 'WiFi haut débit, médiation documentaire, formation et bien plus.',
      en: 'High-speed WiFi, documentary mediation, training and much more.',
    },
  },
  {
    icon: <Heart size={22} />,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    title: { fr: 'Espace personnel', en: 'Personal area' },
    desc: {
      fr: 'Suivez vos prêts, favoris, réservations et notifications en temps réel.',
      en: 'Track your loans, favorites, reservations and notifications in real time.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANT ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function WelcomeModal() {
  // ✅ Utilisation du contexte au lieu des props (cohérent avec Layout.jsx)
  const { showWelcome, completeWelcome, startTour } = useOnboarding();
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!showWelcome) return null;

  const handleStart = () => {
    completeWelcome(false);
    setTimeout(() => startTour(), 350);
  };

  const handleSkip = () => completeWelcome(false);

  const t = (key) => {
    const translations = {
      fr: {
        badge: 'BIENVENUE À LA BCUYI',
        titleLine1: 'Votre porte d\'entrée',
        titleLine2: 'vers le',
        titleHighlight: 'savoir',
        description: 'La Bibliothèque Centrale de l\'Université de Yaoundé I vous accompagne dans vos recherches. Découvrez en 30 secondes ce que nous vous offrons.',
        skip: 'Passer',
        exploreCatalog: 'Explorer le catalogue',
        startTour: 'Faire la visite guidée',
        close: 'Fermer',
      },
      en: {
        badge: 'WELCOME TO BCUYI',
        titleLine1: 'Your gateway',
        titleLine2: 'to',
        titleHighlight: 'knowledge',
        description: 'The Central Library of the University of Yaoundé I supports you in your academic and research journey. Discover in 30 seconds what we offer you.',
        skip: 'Skip',
        exploreCatalog: 'Explore the catalog',
        startTour: 'Start the guided tour',
        close: 'Close',
      },
    };
    return translations[language]?.[key] || translations.fr[key];
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27, 20, 100, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 12 : 24,
        animation: 'welcomeFadeIn 0.4s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <style>{`
        @keyframes welcomeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes welcomeSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(10deg); }
        }
        .welcome-modal-card {
          animation: welcomeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .welcome-feature-card {
          transition: all 0.25s ease;
        }
        .welcome-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.12);
        }
      `}</style>

      <div
        className="welcome-modal-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          background: 'white',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(27,20,100,0.4)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ═══ BOUTON FERMER ═══ */}
        <button
          onClick={handleSkip}
          aria-label={t('close')}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            width: 38,
            height: 38,
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
          <X size={20} />
        </button>

        {/* ═══ HEADER ═══ */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 50%, ${COLORS.or} 100%)`,
            padding: isMobile ? '28px 20px 24px' : '40px 40px 32px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Décorations */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              left: -40,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white',
                padding: '5px 14px',
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: 16,
              }}
            >
              <Sparkles size={13} style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
              {t('badge')}
            </div>

            {/* Titre */}
            <h1
              id="welcome-title"
              className="font-serif"
              style={{
                fontSize: isMobile ? 26 : 36,
                fontWeight: 400,
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {t('titleLine1')}
              <br />
              {t('titleLine2')}{' '}
              <span style={{ color: '#E9D5FF' }}>{t('titleHighlight')}</span>
            </h1>

            {/* Description — CORRIGÉE */}
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: isMobile ? 13 : 15,
                lineHeight: 1.6,
                maxWidth: 520,
                margin: 0,
              }}
            >
              {t('description')}
            </p>
          </div>
        </div>

        {/* ═══ CONTENU : FEATURES ═══ */}
        <div
          style={{
            padding: isMobile ? '20px 20px' : '28px 40px 24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="welcome-feature-card"
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  background: COLORS.beige,
                  borderRadius: 14,
                  border: `1px solid ${COLORS.beigeDark}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: f.bg,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: COLORS.bleuNuit,
                      marginBottom: 3,
                    }}
                  >
                    {f.title[language] || f.title.fr}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.texteMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {f.desc[language] || f.desc.fr}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FOOTER : ACTIONS ═══ */}
        <div
          style={{
            padding: isMobile ? '16px 20px 20px' : '20px 40px 28px',
            borderTop: `1px solid ${COLORS.beigeDark}`,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 10,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            background: 'white',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: 'transparent',
              border: `1px solid ${COLORS.beigeDark}`,
              color: COLORS.texteMuted,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.or;
              e.currentTarget.style.color = COLORS.or;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.beigeDark;
              e.currentTarget.style.color = COLORS.texteMuted;
            }}
          >
            <SkipForward size={14} /> {t('skip')}
          </button>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <button
              onClick={() => {
                handleSkip();
                navigate('/catalogue');
              }}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                background: 'white',
                border: `1.5px solid ${COLORS.bleuNuit}`,
                color: COLORS.bleuNuit,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.beige;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <BookOpen size={15} /> {t('exploreCatalog')}
            </button>

            <button
              onClick={handleStart}
              style={{
                padding: '12px 22px',
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.or}, ${COLORS.orDark})`,
                border: 'none',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)';
              }}
            >
              <PlayCircle size={15} /> {t('startTour')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ⚠️ EXPORT PAR DÉFAUT — NÉCESSAIRE POUR LE BUILD
// ═══════════════════════════════════════════════════════════════════
export default WelcomeModal;
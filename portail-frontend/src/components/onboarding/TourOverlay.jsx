// components/onboarding/TourOverlay.jsx - VERSION CORRIGÉE AVEC PALETTE
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

// 🎨 Palette exacte du site
const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',          // ← violet principal
  orDark: '#6D28D9',
  orLight: '#8B5CF6',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  texte: '#1E293B',
  texteMuted: '#64748b',
  texteLight: '#94a3b8',
};

const TOUR_STEPS = [
  {
    id: 'welcome',
    selector: null,
    title: 'Bienvenue à la BCU UYI 👋',
    text: "Suivez ce guide rapide pour découvrir les fonctionnalités essentielles du portail documentaire. Cliquez sur Suivant pour continuer.",
    position: 'center',
    icon: '🎓',
    pointer: null,
  },
  {
    id: 'logo',
    selector: '.logo-link',
    title: 'Retour à l\'accueil',
    text: 'Ce logo vous ramène à la page d\'accueil à tout moment.',
    position: 'bottom',
    icon: '🏠',
    pointer: '👆',
  },
  {
    id: 'accueil',
    selector: '.desktop-nav .nav-item:first-child .nav-link',
    title: 'Accueil',
    text: 'Cliquez ici pour revenir à la page d\'accueil depuis n\'importe quelle page.',
    position: 'bottom',
    icon: '🏠',
    pointer: '👆',
  },
  {
    id: 'bibliotheque',
    selector: '.desktop-nav .nav-item:nth-child(2) .nav-link',
    title: 'La Bibliothèque',
    text: 'Découvrez notre histoire, notre organisation, nos départements et notre politique documentaire.',
    position: 'bottom',
    icon: '📚',
    pointer: '👆',
  },
  {
    id: 'services',
    selector: '.desktop-nav .nav-item:nth-child(3) .nav-link',
    title: 'Nos services',
    text: 'Espace consultation, WiFi, reliure, médiation et formation documentaire : découvrez tous nos services.',
    position: 'bottom',
    icon: '🛠️',
    pointer: '👆',
  },
  {
    id: 'ressources',
    selector: '.desktop-nav .nav-item:nth-child(4) .nav-link',
    title: 'Ressources',
    text: 'Livres électroniques, catalogue OPAC, thèses & mémoires, bases de données scientifiques : accédez à toutes nos ressources.',
    position: 'bottom',
    icon: '🌐',
    pointer: '👆',
  },
  {
    id: 'depot',
    selector: '.desktop-nav .nav-item:nth-child(5) .nav-link',
    title: 'Dépôt institutionnel',
    text: 'Les étudiants peuvent déposer leur mémoire ou thèse en ligne en quelques clics.',
    position: 'bottom',
    icon: '📤',
    pointer: '👆',
  },
  {
    id: 'actualites',
    selector: '.desktop-nav .nav-item:nth-child(6) .nav-link',
    title: 'Actualités',
    text: 'Restez informé des événements, acquisitions et annonces de la bibliothèque.',
    position: 'bottom',
    icon: '📰',
    pointer: '👆',
  },
  {
    id: 'contact',
    selector: '.desktop-nav .nav-item:nth-child(7) .nav-link',
    title: 'Contact',
    text: 'Besoin d\'aide ? Contactez-nous via le formulaire ou passez directement à la bibliothèque.',
    position: 'bottom',
    icon: '📧',
    pointer: '👆',
  },
  {
    id: 'search',
    selector: '.search-toggle',
    title: 'Recherche rapide',
    text: 'Cliquez sur cette loupe pour lancer une recherche rapide dans tout le catalogue.',
    position: 'bottom-right',
    icon: '🔍',
    pointer: '👆',
  },
  {
    id: 'connexion',
    selector: '.btn-login, .profile-btn',
    title: 'Votre espace personnel',
    text: 'Connectez-vous pour accéder à vos emprunts, favoris, dépôts et notifications.',
    position: 'bottom-right',
    icon: '👤',
    pointer: '👆',
  },
  {
    id: 'hero-search',
    selector: '.hero-search-bar',
    title: 'Recherche dans le catalogue',
    text: 'Utilisez cette barre pour rechercher un titre, un auteur, un ISBN ou un mot-clé dans le catalogue complet.',
    position: 'top',
    icon: '🔎',
    pointer: '👆',
  },
  {
    id: 'hero-actions',
    selector: '.hero-quick-links',
    title: 'Accès rapides',
    text: 'Accédez directement à l\'OPAC PMB, aux thèses et mémoires, ou à Research4Life.',
    position: 'top',
    icon: '⚡',
    pointer: '👆',
  },
  {
    id: 'news-widget',
    selector: '.hero-widget',
    title: 'Actualités en un coup d\'œil',
    text: 'Consultez les dernières nouvelles de la bibliothèque directement depuis l\'accueil.',
    position: 'left',
    icon: '📰',
    pointer: '👈',
  },
  {
    id: 'hours-widget',
    selector: '.hours-widget',
    title: 'Horaires d\'ouverture',
    text: 'Vérifiez nos horaires avant de vous déplacer : du lundi au vendredi de 07h30 à 15h30, et le samedi de 08h00 à 13h00.',
    position: 'left',
    icon: '🕐',
    pointer: '👈',
  },
  {
    id: 'end',
    selector: null,
    title: 'Vous êtes prêt ! 🎉',
    text: 'Vous connaissez maintenant l\'essentiel. Bonne exploration ! Vous pouvez relancer cette visite depuis le bouton d\'aide en bas à droite.',
    position: 'center',
    icon: '✨',
    pointer: null,
  },
];

function getVisibleSteps() {
  return TOUR_STEPS.filter(step => {
    if (!step.selector) return true;
    try {
      const el = document.querySelector(step.selector);
      return !!el;
    } catch {
      return false;
    }
  });
}

export default function TourOverlay() {
  const { showTour, tourStep, nextTourStep, prevTourStep, endTour } = useOnboarding();
  const [rect, setRect] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768);
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (showTour) setVisibleSteps(getVisibleSteps());
  }, [showTour]);

  const currentStep = visibleSteps[tourStep];
  const isLast = tourStep === visibleSteps.length - 1;
  const isFirst = tourStep === 0;

  const updateRect = useCallback(() => {
    if (!currentStep || !currentStep.selector) {
      setRect(null);
      return;
    }
    try {
      const el = document.querySelector(currentStep.selector);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top, left: r.left, width: r.width, height: r.height,
        bottom: r.bottom, right: r.right,
      });
    } catch {
      setRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!showTour) return;
    updateRect();

    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showTour, updateRect]);

  useEffect(() => {
    if (!showTour || !currentStep?.selector) return;
    try {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        setTimeout(updateRect, 450);
      }
    } catch {}
  }, [showTour, tourStep, currentStep, updateRect]);

  useEffect(() => {
    if (!showTour) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') endTour(false);
      if (e.key === 'ArrowRight' && !isLast) nextTourStep();
      if (e.key === 'ArrowLeft' && !isFirst) prevTourStep();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showTour, isFirst, isLast, nextTourStep, prevTourStep, endTour]);

  if (!showTour || !currentStep) return null;

  const getBubblePosition = () => {
    const bubbleWidth = isMobile ? Math.min(viewportSize.w - 32, 320) : 360;
    const bubbleHeight = isMobile ? 240 : 220;
    const gap = 18;

    if (!rect || currentStep.position === 'center') {
      return {
        top: `${viewportSize.h / 2}px`,
        left: `${viewportSize.w / 2}px`,
        transform: 'translate(-50%, -50%)',
        width: `${bubbleWidth}px`,
        arrow: null,
      };
    }

    let top, left, arrow;

    switch (currentStep.position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
        arrow = { top: -7, left: rect.left + rect.width / 2 };
        break;
      case 'top':
        top = rect.top - bubbleHeight - gap;
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
        arrow = { bottom: -7, left: rect.left + rect.width / 2 };
        break;
      case 'left':
        top = rect.top + rect.height / 2 - bubbleHeight / 2;
        left = rect.left - bubbleWidth - gap;
        arrow = { right: -7, top: rect.top + rect.height / 2 };
        break;
      case 'bottom-right':
        top = rect.bottom + gap;
        left = rect.right - bubbleWidth;
        arrow = { top: -7, left: rect.left + rect.width / 2 };
        break;
      default:
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
        arrow = { top: -7, left: rect.left + rect.width / 2 };
    }

    const margin = 16;
    if (left < margin) left = margin;
    if (left + bubbleWidth > viewportSize.w - margin) {
      left = viewportSize.w - bubbleWidth - margin;
    }
    if (top + bubbleHeight > viewportSize.h - margin) {
      if (rect.top > bubbleHeight + gap + margin) {
        top = rect.top - bubbleHeight - gap;
      } else {
        top = Math.max(margin, viewportSize.h - bubbleHeight - margin);
      }
    }
    if (top < margin) top = margin;

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none',
      width: `${bubbleWidth}px`,
      arrow,
    };
  };

  const bubbleStyle = getBubblePosition();
  const highlightPadding = 8;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes fingerBounceDown {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-15deg); }
          50% { transform: translate(-50%, -50%) translateY(-12px) rotate(-15deg); }
        }
        @keyframes fingerBounceUp {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(15deg) scaleY(-1); }
          50% { transform: translate(-50%, -50%) translateY(12px) rotate(15deg) scaleY(-1); }
        }
        @keyframes fingerBounceLeft {
          0%, 100% { transform: translate(-50%, -50%) translateX(0) rotate(15deg); }
          50% { transform: translate(-50%, -50%) translateX(-12px) rotate(15deg); }
        }
        @keyframes pulsePurple {
          0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.7), 0 0 0 0 rgba(124,58,237,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(124,58,237,0), 0 0 0 28px rgba(124,58,237,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237,0), 0 0 0 0 rgba(124,58,237,0); }
        }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tour-bubble {
          animation: bubbleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 640px) {
          .tour-finger { font-size: 32px !important; }
        }
      `}</style>

      {/* Overlay sombre */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(27, 20, 100, 0.72)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'auto',
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => endTour(false)}
      />

      {/* Zone surlignée autour de la cible */}
      {rect && (
        <div
          style={{
            position: 'absolute',
            top: rect.top - highlightPadding,
            left: rect.left - highlightPadding,
            width: rect.width + highlightPadding * 2,
            height: rect.height + highlightPadding * 2,
            borderRadius: 12,
            boxShadow: `0 0 0 9999px rgba(27, 20, 100, 0.72), 0 0 0 3px ${COLORS.or}, 0 0 40px rgba(124,58,237,0.7)`,
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            animation: 'pulsePurple 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Doigt pointeur animé */}
      {rect && currentStep.pointer && (
        <div
          className="tour-finger"
          style={{
            position: 'absolute',
            top: currentStep.position === 'top'
              ? rect.bottom + 20
              : currentStep.position === 'left'
                ? rect.top + rect.height / 2
                : rect.top - 20,
            left: currentStep.position === 'left'
              ? rect.right + 20
              : rect.left + rect.width / 2,
            fontSize: isMobile ? 36 : 46,
            animation: currentStep.position === 'top'
              ? 'fingerBounceUp 1.4s ease-in-out infinite'
              : currentStep.position === 'left'
                ? 'fingerBounceLeft 1.4s ease-in-out infinite'
                : 'fingerBounceDown 1.4s ease-in-out infinite',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          aria-hidden="true"
        >
          {currentStep.pointer}
        </div>
      )}

      {/* Bulle d'information */}
      <div
        className="tour-bubble"
        style={{
          position: 'fixed',
          top: bubbleStyle.top,
          left: bubbleStyle.left,
          transform: bubbleStyle.transform,
          width: bubbleStyle.width,
          background: 'white',
          borderRadius: 18,
          padding: isMobile ? '16px' : '20px 22px',
          boxShadow: '0 20px 60px rgba(27,20,100,0.35)',
          pointerEvents: 'auto',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 3,
          border: '1px solid rgba(124,58,237,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {bubbleStyle.arrow && (
          <div
            style={{
              position: 'absolute',
              width: 14,
              height: 14,
              background: 'white',
              transform: 'rotate(45deg)',
              ...(bubbleStyle.arrow.top !== undefined && { top: bubbleStyle.arrow.top }),
              ...(bubbleStyle.arrow.bottom !== undefined && { bottom: bubbleStyle.arrow.bottom }),
              ...(bubbleStyle.arrow.left !== undefined && { left: bubbleStyle.arrow.left, marginLeft: -7 }),
              ...(bubbleStyle.arrow.right !== undefined && { right: bubbleStyle.arrow.right, marginRight: -7 }),
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
        )}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.or}, ${COLORS.orDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              }}
            >
              {currentStep.icon}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.or,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Étape {tourStep + 1} / {visibleSteps.length}
            </div>
          </div>
          <button
            onClick={() => endTour(false)}
            aria-label="Fermer la visite"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.texteLight,
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = COLORS.beige;
              e.currentTarget.style.color = COLORS.bleuNuit;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = COLORS.texteLight;
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenu */}
        <h4
          style={{
            fontSize: isMobile ? 15 : 16.5,
            fontWeight: 700,
            color: COLORS.bleuNuit,
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {currentStep.title}
        </h4>
        <p
          style={{
            fontSize: isMobile ? 12.5 : 13.5,
            color: COLORS.texteMuted,
            lineHeight: 1.6,
            marginBottom: 14,
          }}
        >
          {currentStep.text}
        </p>

        {/* Progression */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {visibleSteps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= tourStep ? COLORS.or : COLORS.beigeDark,
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <button
            onClick={() => (isFirst ? endTour(false) : prevTourStep())}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'transparent',
              border: `1px solid ${COLORS.beigeDark}`,
              color: COLORS.texteMuted,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.or;
              e.currentTarget.style.color = COLORS.or;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.beigeDark;
              e.currentTarget.style.color = COLORS.texteMuted;
            }}
          >
            {isFirst ? <>Passer</> : <><ChevronLeft size={14} /> Précédent</>}
          </button>

          <button
            onClick={() => (isLast ? endTour(true) : nextTourStep())}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.or}, ${COLORS.orDark})`,
              border: 'none',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)';
            }}
          >
            {isLast ? <><Check size={14} /> Terminer</> : <>Suivant <ChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
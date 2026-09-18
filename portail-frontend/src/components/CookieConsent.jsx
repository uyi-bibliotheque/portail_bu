// components/CookieConsent.jsx - Version corrigée
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Settings, Check, ChevronDown, Shield, Info } from 'lucide-react';
import { useCookieContext } from '../contexts/CookieContext';
import { getAllCookieConfigs } from '../utils/cookieUtils';

export default function CookieConsent() {
  const {
    preferences,
    consentGiven,
    acceptAll,
    acceptNecessary,
    savePreferences,
    togglePreference,
    rejectAll
  } = useCookieContext();

  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Mettre à jour les préférences locales quand les préférences globales changent
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  // Gérer l'affichage de la bannière
  useEffect(() => {
    if (!consentGiven) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
      setShowSettings(false);
    }
  }, [consentGiven]);

  // Écouter l'événement d'ouverture des paramètres
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
      setShowBanner(false);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const handleSavePreferences = () => {
    savePreferences(localPrefs);
    setShowSettings(false);
  };

  const handleBackToBanner = () => {
    setShowSettings(false);
    setShowBanner(true);
  };

  const handleReject = () => {
    rejectAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const toggleExpand = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    setShowBanner(false);
    setShowSettings(false);
  };

  const cookieConfigs = getAllCookieConfigs();

  // Si l'utilisateur a déjà consenti et que la bannière est fermée
  if (consentGiven && !showSettings) {
    return null;
  }

  return (
    <>
      {/* Bannière de cookies */}
      {showBanner && !showSettings && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'rgba(27, 20, 100, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(124, 58, 237, 0.2)',
            padding: 'clamp(16px, 2vw, 24px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            animation: 'slideUpCookie 0.5s ease'
          }}
        >
          <style>
            {`
              @keyframes slideUpCookie {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes fadeInCookie {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>
          
          <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 1.5vw, 16px)'
            }}>
              {/* En-tête */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(124,58,237,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--or)'
                  }}>
                    <Cookie size={20} />
                  </div>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: 'clamp(16px, 1.2vw, 18px)',
                      fontWeight: 700,
                      marginBottom: 2
                    }}>
                      Nous respectons votre vie privée
                    </h3>
                    <p style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 'clamp(12px, 0.85vw, 13px)'
                    }}>
                      Ce site utilise des cookies pour améliorer votre expérience.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleReject}
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  }}
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'clamp(13px, 0.9vw, 14px)',
                lineHeight: 1.6,
                maxWidth: 800
              }}>
                Nous utilisons des cookies pour vous offrir une meilleure expérience de navigation, 
                analyser le trafic et personnaliser le contenu. En cliquant sur "Accepter tout", 
                vous consentez à l'utilisation de tous les cookies.
              </p>

              {/* Liens */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(12px, 1.5vw, 20px)',
                alignItems: 'center'
              }}>
                <Link
                  to="/politique-cookies"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 'clamp(12px, 0.85vw, 13px)',
                    textDecoration: 'underline',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  <Shield size={14} />
                  Politique de cookies
                </Link>
                <Link
                  to="/confidentialite"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 'clamp(12px, 0.85vw, 13px)',
                    textDecoration: 'underline',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  <Info size={14} />
                  Confidentialité
                </Link>
              </div>

              {/* Boutons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(8px, 1vw, 12px)',
                marginTop: 4
              }}>
                <button
                  onClick={handleAcceptAll}
                  style={{
                    padding: 'clamp(10px, 1vw, 12px) clamp(20px, 2vw, 32px)',
                    background: 'linear-gradient(135deg, var(--or), var(--or-dark))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 50,
                    fontSize: 'clamp(13px, 0.9vw, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.3)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
                  }}
                >
                  Accepter tout
                </button>
                
                <button
                  onClick={handleAcceptNecessary}
                  style={{
                    padding: 'clamp(10px, 1vw, 12px) clamp(20px, 2vw, 24px)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 50,
                    fontSize: 'clamp(13px, 0.9vw, 14px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                >
                  Cookies essentiels uniquement
                </button>
                
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowBanner(false);
                  }}
                  style={{
                    padding: 'clamp(10px, 1vw, 12px) clamp(20px, 2vw, 24px)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 50,
                    fontSize: 'clamp(13px, 0.9vw, 14px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <Settings size={16} />
                  Personnaliser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de paramètres des cookies */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'rgba(27, 20, 100, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(124, 58, 237, 0.2)',
            padding: 'clamp(20px, 2.5vw, 32px)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'fadeInCookie 0.3s ease'
          }}
        >
          <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'clamp(16px, 2vw, 24px)',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(124,58,237,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--or)'
                }}>
                  <Settings size={20} />
                </div>
                <div>
                  <h3 style={{
                    color: 'white',
                    fontSize: 'clamp(18px, 1.3vw, 22px)',
                    fontWeight: 700
                  }}>
                    Gestion des cookies
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 'clamp(12px, 0.85vw, 13px)'
                  }}>
                    Personnalisez vos préférences de confidentialité
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToBanner}
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 50,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 0.85vw, 13px)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
                Retour
              </button>
            </div>

            {/* Types de cookies */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(10px, 1.2vw, 14px)',
              marginBottom: 'clamp(16px, 2vw, 24px)'
            }}>
              {cookieConfigs.map((config) => (
                <div
                  key={config.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                      gap: 10
                    }}
                    onClick={() => toggleExpand(config.id)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <span style={{ fontSize: 'clamp(20px, 1.8vw, 24px)' }}>{config.icon}</span>
                      <div>
                        <div style={{
                          color: 'white',
                          fontSize: 'clamp(14px, 1vw, 15px)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap'
                        }}>
                          {config.label}
                          {config.required && (
                            <span style={{
                              fontSize: 'clamp(9px, 0.7vw, 10px)',
                              background: 'rgba(124,58,237,0.2)',
                              color: 'var(--or)',
                              padding: '2px 10px',
                              borderRadius: 50,
                              fontWeight: 700
                            }}>
                              Obligatoire
                            </span>
                          )}
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: 'clamp(11px, 0.8vw, 12px)'
                        }}>
                          {config.description}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: config.required ? 'default' : 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={localPrefs[config.id] || false}
                          onChange={() => {
                            if (!config.required) {
                              const newPrefs = { ...localPrefs, [config.id]: !localPrefs[config.id] };
                              setLocalPrefs(newPrefs);
                            }
                          }}
                          disabled={config.required}
                          style={{
                            appearance: 'none',
                            width: 44,
                            height: 24,
                            background: localPrefs[config.id] ? 'var(--or)' : 'rgba(255,255,255,0.2)',
                            borderRadius: 12,
                            cursor: config.required ? 'default' : 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            flexShrink: 0
                          }}
                        />
                        <span style={{
                          fontSize: 'clamp(12px, 0.85vw, 13px)',
                          color: localPrefs[config.id] ? 'var(--or)' : 'rgba(255,255,255,0.4)',
                          fontWeight: 500,
                          minWidth: 50
                        }}>
                          {localPrefs[config.id] ? 'Activé' : 'Désactivé'}
                        </span>
                      </label>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(config.id);
                        }}
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease',
                          transform: expandedTypes[config.id] ? 'rotate(180deg)' : 'rotate(0)'
                        }}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Détails expansibles */}
                  {expandedTypes[config.id] && (
                    <div style={{
                      padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: 'rgba(255,255,255,0.02)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 8
                      }}>
                        <div>
                          <span style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: 'clamp(10px, 0.7vw, 11px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em'
                          }}>
                            Durée
                          </span>
                          <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 'clamp(12px, 0.85vw, 13px)'
                          }}>
                            {config.duration || (config.required ? 'Session' : '30 jours')}
                          </p>
                        </div>
                        <div>
                          <span style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: 'clamp(10px, 0.7vw, 11px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em'
                          }}>
                            Finalité
                          </span>
                          <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 'clamp(12px, 0.85vw, 13px)'
                          }}>
                            {config.required ? 'Fonctionnement du site' : 'Personnalisation et analyse'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Boutons d'action */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(8px, 1vw, 12px)',
              justifyContent: 'flex-end',
              paddingTop: 'clamp(16px, 2vw, 20px)',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <button
                onClick={() => {
                  const necessaryOnly = {
                    necessary: true,
                    preferences: false,
                    statistics: false,
                    marketing: false
                  };
                  setLocalPrefs(necessaryOnly);
                }}
                style={{
                  padding: 'clamp(10px, 1vw, 12px) clamp(20px, 2vw, 24px)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 50,
                  fontSize: 'clamp(13px, 0.9vw, 14px)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                Tout refuser
              </button>
              <button
                onClick={handleAcceptNecessary}
                style={{
                  padding: 'clamp(10px, 1vw, 12px) clamp(20px, 2vw, 24px)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 50,
                  fontSize: 'clamp(13px, 0.9vw, 14px)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                Cookies essentiels
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  padding: 'clamp(10px, 1vw, 12px) clamp(24px, 2.5vw, 36px)',
                  background: 'linear-gradient(135deg, var(--or), var(--or-dark))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 50,
                  fontSize: 'clamp(13px, 0.9vw, 14px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
                }}
              >
                <Check size={16} />
                Enregistrer mes préférences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
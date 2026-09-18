// src/pages/PolitiqueCookies.jsx
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';
import { 
  Cookie, Shield, Info, Check, AlertCircle, 
  ChevronRight, ArrowLeft, Home, FileText,
  Clock, Database, Globe, Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PolitiqueCookies() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  const t = isEnglish ? {
    backHome: 'Back to home',
    badge: 'COOKIE POLICY',
    title: 'Cookie',
    titleHighlight: 'Policy',
    subtitle: 'Learn how we use cookies to improve your experience on our site.',
    summary: 'Summary',
    items: [
      { label: 'What is a cookie?', id: 'definition' },
      { label: 'Types of cookies used', id: 'types' },
      { label: 'Cookies we use', id: 'cookies' },
      { label: 'Cookie management', id: 'gestion' },
      { label: 'Retention period', id: 'duree' },
      { label: 'Your rights', id: 'droits' },
      { label: 'Contact', id: 'contact' },
    ],
    defTitle: 'What is a cookie?',
    defP1: 'A cookie is a small text file placed on your computer, tablet or smartphone when you visit a website. It stores information about your browsing and recognizes your device on later visits.',
    defP2: 'Cookies are widely used to improve the user experience, analyze traffic and personalize content. They do not contain sensitive personal data and cannot be used to identify you personally.',
    typeTitle: 'Types of cookies used',
    essential: 'Essential cookies',
    prefs: 'Preference cookies',
    stats: 'Statistical cookies',
    marketing: 'Marketing cookies',
    essentialDesc: 'Necessary for the site to work properly. They enable navigation and access to basic features.',
    prefsDesc: 'Remember your preferences (language, display) to personalize your experience.',
    statsDesc: 'Collect anonymous information about your navigation to improve the site (pages visited, time spent).',
    marketingDesc: 'Used to offer you relevant content and advertising based on your interests.',
    required: 'Required',
    useTitle: 'Cookies we use',
    name: 'Name',
    type: 'Type',
    duration: 'Duration',
    desc: 'Description',
    essentialType: 'Essential',
    preferences: 'Preferences',
    session: 'Session',
    oneYear: '1 year',
    thirtyDays: '30 days',
    consent: 'Stores your cookie consent choice',
    sessionInfo: 'Session identifier for navigation',
    prefInfo: 'Stores your display preferences',
    analyticsInfo: 'Anonymous analysis of site traffic',
    managementTitle: 'Cookie management',
    manageP1: 'You can manage your cookie preferences at any time by clicking the cookie management icon at the bottom of the page or by using your browser settings.',
    manageP2: 'Most browsers allow you to control cookies through their settings. You can choose to block all cookies, accept only certain types, or delete existing cookies.',
    retentionTitle: 'Retention period',
    ret1: 'Session cookies: deleted automatically when the browser is closed',
    ret2: 'Persistent cookies: kept until their expiration date (usually 30 days to 1 year)',
    ret3: 'You can at any time: delete cookies manually through your browser settings',
    rightsTitle: 'Your rights',
    rightsP1: 'In accordance with Cameroonian law and the GDPR, you have the following rights regarding the data collected via cookies:',
    rights1: 'Right to information: be informed about the use of cookies',
    rights2: 'Right to consent: accept or refuse cookies (except essential cookies)',
    rights3: 'Right to withdraw: withdraw your consent at any time',
    rights4: 'Right of access: access the data collected about you',
    contactTitle: 'Contact',
    updated: 'Last updated',
    library: 'Central University Library of Yaoundé I',
    address: 'Address',
    phone: 'Phone',
    email: 'Email'
  } : {
    backHome: 'Retour à l\'accueil',
    badge: 'POLITIQUE DE COOKIES',
    title: 'Politique de',
    titleHighlight: 'Cookies',
    subtitle: 'Découvrez comment nous utilisons les cookies pour améliorer votre expérience sur notre site.',
    summary: 'Sommaire',
    items: [
      { label: 'Qu\'est-ce qu\'un cookie ?', id: 'definition' },
      { label: 'Types de cookies utilisés', id: 'types' },
      { label: 'Cookies que nous utilisons', id: 'cookies' },
      { label: 'Gestion des cookies', id: 'gestion' },
      { label: 'Durée de conservation', id: 'duree' },
      { label: 'Vos droits', id: 'droits' },
      { label: 'Contact', id: 'contact' },
    ],
    defTitle: 'Qu\'est-ce qu\'un cookie ?',
    defP1: 'Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lorsque vous visitez un site web. Il permet de stocker des informations sur votre navigation et de reconnaître votre appareil lors de vos visites ultérieures.',
    defP2: 'Les cookies sont largement utilisés pour améliorer l\'expérience utilisateur, analyser le trafic et personnaliser le contenu. Ils ne contiennent pas de données personnelles sensibles et ne peuvent pas être utilisés pour vous identifier personnellement.',
    typeTitle: 'Types de cookies utilisés',
    essential: 'Cookies essentiels',
    prefs: 'Cookies de préférences',
    stats: 'Cookies statistiques',
    marketing: 'Cookies marketing',
    essentialDesc: 'Nécessaires au bon fonctionnement du site. Ils permettent la navigation et l\'accès aux fonctionnalités de base.',
    prefsDesc: 'Permettent de mémoriser vos préférences (langue, affichage) pour personnaliser votre expérience.',
    statsDesc: 'Collectent des informations anonymes sur votre navigation pour améliorer le site (pages visitées, temps passé).',
    marketingDesc: 'Utilisés pour vous proposer du contenu et des publicités pertinents en fonction de vos centres d\'intérêt.',
    required: 'Obligatoire',
    useTitle: 'Cookies que nous utilisons',
    name: 'Nom',
    type: 'Type',
    duration: 'Durée',
    desc: 'Description',
    essentialType: 'Essentiel',
    preferences: 'Préférences',
    session: 'Session',
    oneYear: '1 an',
    thirtyDays: '30 jours',
    consent: 'Mémorise votre choix de consentement aux cookies',
    sessionInfo: 'Identifiant de session pour la navigation',
    prefInfo: 'Stocke vos préférences d\'affichage',
    analyticsInfo: 'Analyse anonyme du trafic du site',
    managementTitle: 'Gestion des cookies',
    manageP1: 'Vous pouvez gérer vos préférences en matière de cookies à tout moment en cliquant sur l\'icône de gestion des cookies en bas de page ou en utilisant les paramètres de votre navigateur.',
    manageP2: 'La plupart des navigateurs vous permettent de contrôler les cookies via leurs paramètres. Vous pouvez choisir de bloquer tous les cookies, de n\'accepter que certains types, ou de supprimer les cookies existants.',
    retentionTitle: 'Durée de conservation',
    ret1: 'Cookies de session : Supprimés automatiquement à la fermeture du navigateur',
    ret2: 'Cookies persistants : Conservés jusqu\'à leur date d\'expiration (généralement 30 jours à 1 an)',
    ret3: 'Vous pouvez à tout moment : Supprimer manuellement les cookies via les paramètres de votre navigateur',
    rightsTitle: 'Vos droits',
    rightsP1: 'Conformément à la loi camerounaise et au RGPD, vous disposez des droits suivants concernant les données collectées via les cookies :',
    rights1: 'Droit d\'information : Être informé sur l\'utilisation des cookies',
    rights2: 'Droit de consentement : Accepter ou refuser les cookies (hors cookies essentiels)',
    rights3: 'Droit de retrait : Retirer votre consentement à tout moment',
    rights4: 'Droit d\'accès : Accéder aux données collectées vous concernant',
    contactTitle: 'Contact',
    updated: 'Dernière mise à jour',
    library: 'Bibliothèque Centrale Universitaire de Yaoundé I',
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'Email'
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
        padding: 'clamp(40px, 5vw, 60px) 0 clamp(32px, 4vw, 40px) 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.08)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -120,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.05)',
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(13px, 0.9vw, 14px)',
              fontWeight: 500,
              marginBottom: 'clamp(20px, 2vw, 28px)',
              transition: 'color 0.2s',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            <ArrowLeft size={16} /> {t.backHome}
          </Link>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: 'white',
            padding: '6px 16px',
            borderRadius: 50,
            fontSize: 'clamp(10px, 0.8vw, 12px)',
            fontWeight: 700,
            marginBottom: 'clamp(12px, 1.5vw, 20px)',
            letterSpacing: '0.06em'
          }}>
            <Cookie size={14} /> {t.badge}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            color: 'white',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 'clamp(8px, 1vw, 16px)'
          }}>
            {t.title} <span style={{ color: 'var(--or)' }}>{t.titleHighlight}</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(14px, 1.2vw, 18px)',
            maxWidth: 640,
            marginTop: 0,
            lineHeight: 1.6
          }}>
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section style={{ padding: 'clamp(40px, 5vw, 60px) 0', background: 'var(--beige)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 'clamp(24px, 4vw, 48px)',
            alignItems: 'start'
          }}
          className="cookies-grid">
            
            {/* Sommaire */}
            <div style={{
              position: 'sticky',
              top: 'calc(var(--header-h) + 24px)',
              background: 'white',
              borderRadius: 16,
              padding: 'clamp(20px, 2.5vw, 28px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              display: 'block'
            }}
            className="sidebar-desktop">
              <h3 style={{
                fontSize: 'clamp(13px, 1vw, 14px)',
                fontWeight: 700,
                color: 'var(--bleu-nuit)',
                marginBottom: 16,
                letterSpacing: '0.04em'
              }}>
                {t.summary}
              </h3>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {t.items.map(item => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        fontSize: 'clamp(12px, 0.85vw, 13px)',
                        color: 'var(--texte-muted)',
                        display: 'block',
                        padding: '6px 12px',
                        borderRadius: 8,
                        transition: 'all 0.2s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--beige)';
                        e.currentTarget.style.color = 'var(--bleu-nuit)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--texte-muted)';
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div style={{ 
                marginTop: 24, 
                paddingTop: 16, 
                borderTop: '1px solid var(--border)',
                display: 'none' 
              }}
              className="sidebar-back-btn">
                <Link 
                  to="/" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--or)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Home size={16} /> {t.backHome}
                </Link>
              </div>
            </div>

            {/* Contenu principal */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 'clamp(24px, 3vw, 48px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ 
                fontSize: 'clamp(14px, 0.95vw, 15px)', 
                lineHeight: 1.8, 
                color: 'var(--texte)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {/* Définition */}
                <div id="definition" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Info size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.defTitle}
                  </h2>
                  <p style={{ marginBottom: 12 }}>
                    {t.defP1}
                  </p>
                  <p>
                    {t.defP2}
                  </p>
                </div>

                {/* Types */}
                <div id="types" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Shield size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.typeTitle}
                  </h2>
                  
                  <div style={{ display: 'grid', gap: 16 }}>
                    {[
                      {
                        icon: '🔒',
                        title: t.essential,
                        desc: t.essentialDesc,
                        required: true,
                        color: '#10B981'
                      },
                      {
                        icon: '⚙️',
                        title: t.prefs,
                        desc: t.prefsDesc,
                        required: false,
                        color: '#6366f1'
                      },
                      {
                        icon: '📊',
                        title: t.stats,
                        desc: t.statsDesc,
                        required: false,
                        color: '#F59E0B'
                      },
                      {
                        icon: '🎯',
                        title: t.marketing,
                        desc: t.marketingDesc,
                        required: false,
                        color: '#EF4444'
                      }
                    ].map((type, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 'clamp(12px, 1.5vw, 16px)',
                        padding: 'clamp(14px, 1.5vw, 20px)',
                        background: 'var(--beige)',
                        borderRadius: 12,
                        border: '1px solid var(--border-light)',
                        alignItems: 'flex-start'
                      }}>
                        <span style={{ fontSize: 'clamp(24px, 2vw, 28px)', flexShrink: 0 }}>{type.icon}</span>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                            marginBottom: 4
                          }}>
                            <h4 style={{
                              fontWeight: 700,
                              fontSize: 'clamp(14px, 1vw, 16px)',
                              color: 'var(--bleu-nuit)'
                            }}>
                              {type.title}
                            </h4>
                            {type.required && (
                              <span style={{
                                fontSize: 'clamp(9px, 0.7vw, 10px)',
                                background: `${type.color}20`,
                                color: type.color,
                                padding: '2px 10px',
                                borderRadius: 50,
                                fontWeight: 700
                              }}>
                                {t.required}
                              </span>
                            )}
                          </div>
                          <p style={{
                            fontSize: 'clamp(13px, 0.9vw, 14px)',
                            color: 'var(--texte-muted)',
                            lineHeight: 1.6
                          }}>
                            {type.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cookies que nous utilisons */}
                <div id="cookies" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Database size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.useTitle}
                  </h2>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 'clamp(13px, 0.9vw, 14px)'
                    }}>
                      <thead>
                        <tr style={{ background: 'var(--bleu-nuit)', color: 'white' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>{t.name}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>{t.type}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>{t.duration}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>{t.desc}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'cookie_consent', type: t.essentialType, duration: t.oneYear, desc: t.consent },
                          { name: 'session_id', type: t.essentialType, duration: t.session, desc: t.sessionInfo },
                          { name: 'preferences', type: t.preferences, duration: t.thirtyDays, desc: t.prefInfo },
                          { name: 'analytics', type: t.stats, duration: t.thirtyDays, desc: t.analyticsInfo },
                        ].map((cookie, idx) => (
                          <tr key={idx} style={{
                            borderBottom: idx < 3 ? '1px solid var(--border)' : 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--bleu-nuit)' }}>
                              {cookie.name}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--texte-muted)' }}>
                              <span style={{
                                background: cookie.type === t.essentialType ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                                color: cookie.type === t.essentialType ? '#10B981' : '#6366f1',
                                padding: '2px 10px',
                                borderRadius: 50,
                                fontSize: 'clamp(10px, 0.7vw, 11px)',
                                fontWeight: 600
                              }}>
                                {cookie.type}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--texte-muted)' }}>{cookie.duration}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--texte-muted)' }}>{cookie.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gestion */}
                <div id="gestion" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Globe size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.managementTitle}
                  </h2>
                  <p style={{ marginBottom: 12 }}>
                    {t.manageP1}
                  </p>
                  <p>
                    {t.manageP2}
                  </p>
                </div>

                {/* Durée */}
                <div id="duree" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Clock size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.retentionTitle}
                  </h2>
                  <ul style={{
                    paddingLeft: 'clamp(20px, 2vw, 24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <li>{t.ret1}</li>
                    <li>{t.ret2}</li>
                    <li>{t.ret3}</li>
                  </ul>
                </div>

                {/* Droits */}
                <div id="droits" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Lock size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.rightsTitle}
                  </h2>
                  <p style={{ marginBottom: 12 }}>
                    {t.rightsP1}
                  </p>
                  <ul style={{
                    paddingLeft: 'clamp(20px, 2vw, 24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <li>{t.rights1}</li>
                    <li>{t.rights2}</li>
                    <li>{t.rights3}</li>
                    <li>{t.rights4}</li>
                  </ul>
                </div>

                {/* Contact */}
                <div id="contact" style={{ scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{
                    fontSize: 'clamp(20px, 1.8vw, 24px)',
                    fontWeight: 700,
                    color: 'var(--bleu-nuit)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <FileText size={24} color="var(--or)" style={{ flexShrink: 0 }} />
                    {t.contactTitle}
                  </h2>
                  <div style={{
                    background: 'var(--beige)',
                    borderRadius: 12,
                    padding: 'clamp(16px, 2vw, 24px)'
                  }}>
                    <p style={{ marginBottom: 8 }}>
                      <strong>{t.library}</strong>
                    </p>
                    <p style={{ marginBottom: 8 }}>
                      <strong>{t.email}:</strong>{' '}
                      <a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)' }}>
                        biblio.Bibliotheque@uy1.uninet.cm
                      </a>
                    </p>
                    <p style={{ marginBottom: 8 }}>
                      <strong>{t.address}:</strong> Campus de l'Université de Yaoundé I, BP 337 Yaoundé, Cameroun
                    </p>
                    <p>
                      <strong>{t.phone}:</strong> +237 242 06 47 28
                    </p>
                  </div>
                </div>

                {/* Mise à jour */}
                <div style={{
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: '1px solid var(--border)',
                  textAlign: 'center',
                  fontSize: 'clamp(12px, 0.8vw, 13px)',
                  color: 'var(--texte-muted)'
                }}>
                  <p>{t.updated}: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>

                {/* Bouton retour mobile */}
                <div style={{
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: '1px solid var(--border)',
                  display: 'none',
                  justifyContent: 'center'
                }}
                className="mobile-back-btn">
                  <Link 
                    to="/" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'linear-gradient(135deg, var(--or), var(--or-dark))',
                      color: 'white',
                      padding: 'clamp(12px, 1.5vw, 14px) clamp(24px, 3vw, 28px)',
                      borderRadius: 50,
                      fontSize: 'clamp(14px, 1vw, 15px)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                      width: 'auto',
                      minWidth: '200px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
                    }}
                  >
                    <Home size={18} /> {t.backHome}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles responsifs */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-back-btn { display: block !important; }
          .mobile-back-btn { display: flex !important; }
          .cookies-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
        }
        @media (max-width: 768px) {
          .container { padding: 0 16px !important; }
          section { padding: 32px 0 !important; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 12px !important; }
          section { padding: 24px 0 !important; }
          .mobile-back-btn a { width: 100% !important; min-width: unset !important; padding: 12px 20px !important; font-size: 14px !important; }
          table { font-size: 12px !important; }
          thead th, tbody td { padding: 8px 10px !important; }
        }
      `}</style>
    </Layout>
  );
}
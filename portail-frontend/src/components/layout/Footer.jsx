// src/components/layout/Footer.jsx - VERSION FINALE CORRIGÉE (LOGO RESPONSIVE)
import { Link } from 'react-router-dom';
import libraryLogo from '../../assets/images/Bc_logo.png';
import { useLanguage } from '../../contexts/LanguageContext';

import {
  BookOpen, Mail, Phone, MapPin, Globe,
  ExternalLink, ChevronRight
} from 'lucide-react';

const QUICK_LINKS = [
  { labelFr: 'Catalogue OPAC', labelEn: 'OPAC catalog', href: '/catalogue' },
  { labelFr: 'Thèses & Mémoires', labelEn: 'Theses & Dissertations', href: '/archives' },
  { labelFr: 'Déposer un mémoire', labelEn: 'Submit a dissertation', href: '/depot/soumettre' },
  { labelFr: 'E-Ressources', labelEn: 'E-resources', href: '/ressources/electroniques' },
  { labelFr: 'Actualités', labelEn: 'News', href: '/actualites' },
  { labelFr: 'Contact', labelEn: 'Contact', href: '/contact' },
];

const RESOURCES = [
  { label: 'Research4Life', href: 'https://www.research4life.org', ext: true },
  { label: 'OpenDOAR', href: 'https://v2.sherpa.ac.uk/opendoar/', ext: true },
  { label: 'DOAJ', href: 'https://doaj.org', ext: true },
  { label: 'BNF Gallica', href: 'https://gallica.bnf.fr', ext: true },
  { label: 'OpenEdition', href: 'https://www.openedition.org', ext: true },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { language } = useLanguage();
  const t = (fr, en) => (language === 'en' ? (en || fr) : fr);

  return (
    <footer className="footer">
      <div className="container" style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px) 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(28px, 4vw, 48px)',
          paddingBottom: 'clamp(28px, 4vw, 48px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* ====================================================
              BRAND — LOGO RESPONSIVE (PC + Mobile)
              ==================================================== */}
          <div>
            {/* Conteneur du logo avec fond blanc pour contraste sur fond bleu foncé */}
            <div
              className="footer-logo-wrapper"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                background: 'white',
                padding: 'clamp(10px, 1.5vw, 16px) clamp(16px, 2.5vw, 26px)',
                borderRadius: 14,
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '100%'
              }}
            >
              <img
                src={libraryLogo}
                alt="Université de Yaoundé I - Bibliothèque Centrale"
                className="footer-logo-img"
                style={{
                  height: 'clamp(70px, 8vw, 100px)',  // ✅ 70px mobile → 100px PC
                  width: 'auto',                       // ✅ Ratio préservé
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <p style={{
              fontSize: 'clamp(12.5px, 1vw, 13.5px)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 20
            }}>
              {t(
                "La Bibliothèque Centrale de l'Université de Yaoundé I est au service de la communauté universitaire depuis 1962.",
                "The Central Library of the University of Yaoundé I serves the academic community since 1962."
              )}
            </p>

            {/* Réseaux sociaux */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="https://www.facebook.com/Biblioth%C3%A8que-Centrale-Universit%C3%A9-de-Yaound%C3%A9-1-1389540161289157/?ref=hl"
                aria-label="Facebook"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <svg className="w-4 h-4 fill-current" width="16" height="16" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/?gl=FR"
                aria-label="YouTube"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <svg className="w-4 h-4 fill-current" width="16" height="16" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 style={{ color: 'var(--or)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>
              {t('Liens Rapides', 'Quick links')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_LINKS.map(l => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    style={{
                      fontSize: 13, color: 'rgba(255,255,255,0.65)',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    <ChevronRight size={12} /> {language === 'en' ? (l.labelEn || l.labelFr) : l.labelFr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources externes */}
          <div>
            <h4 style={{ color: 'var(--or)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>
              {t('Ressources Externes', 'External resources')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RESOURCES.map(r => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13, color: 'rgba(255,255,255,0.65)',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    <ExternalLink size={11} /> {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'var(--or)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>
              {t('Contact', 'Contact')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { Icon: MapPin, text: 'Université de Yaoundé I\nYaoundé, Cameroun' },
                { Icon: Phone, text: '+ 237 242 06 47 28' },
                { Icon: Mail, text: 'biblio.Bibliotheque@uy1.uninet.cm' },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon size={14} color="var(--or)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Horaires */}
            <div style={{
              marginTop: 20, padding: '12px 16px',
              background: 'rgba(124,58,237,0.1)',
              borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--or)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t("Horaires d'ouverture", 'Opening hours')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                {t('Lun – Ven : 07h30 – 15h30', 'Mon – Fri : 07h30 – 15h30')}<br />
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{t('Samedi, Dimanche : Fermé', 'Saturday, Sunday : Closed')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          padding: '20px 0', fontSize: 12, color: 'rgba(255,255,255,0.4)',
          textAlign: 'center'
        }}>
          <span style={{ flex: '1 1 auto', minWidth: 240 }}>
            {t(
              `© ${year} Bibliothèque Centrale Universitaire – Université de Yaoundé I. Tous droits réservés.`,
              `© ${year} Central University Library – University of Yaoundé I. All rights reserved.`
            )}
          </span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/mentions-legales" style={{ color: 'inherit' }}>{t('Mentions légales', 'Legal notices')}</Link>
            <Link to="/confidentialite" style={{ color: 'inherit' }}>{t('Confidentialité', 'Privacy')}</Link>
            <Link to="/cgv" style={{ color: 'inherit' }}>{t('CGV', 'Terms')}</Link>
            <Link to="/politique-cookies" style={{ color: 'inherit' }}>{t('🍪 Cookies', '🍪 Cookies')}</Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          STYLES RESPONSIVE POUR LE LOGO ET LE FOOTER MOBILE
          ==================================================== */}
      <style>{`
        /* Logo du footer : responsive par défaut via clamp()
           On ajuste juste quelques détails sur très petits écrans */
        .footer-logo-wrapper {
          transition: transform 0.3s ease;
        }
        .footer-logo-wrapper:hover {
          transform: translateY(-2px);
        }

        /* Tablette (≤ 992px) */
        @media (max-width: 992px) {
          .footer-logo-img {
            height: clamp(64px, 9vw, 85px) !important;
          }
        }

        /* Mobile (≤ 640px) */
        @media (max-width: 640px) {
          .footer-logo-wrapper {
            padding: 12px 18px !important;
          }
          .footer-logo-img {
            height: clamp(60px, 14vw, 80px) !important;
          }
        }

        /* Très petit mobile (≤ 400px) */
        @media (max-width: 400px) {
          .footer-logo-wrapper {
            padding: 10px 14px !important;
            border-radius: 12px !important;
          }
          .footer-logo-img {
            height: clamp(56px, 16vw, 70px) !important;
          }
        }

        /* Le conteneur du footer ne doit jamais déborder */
        .footer img {
          max-width: 100%;
        }
      `}</style>
    </footer>
  );
}
// src/components/layout/Footer.jsx - VERSION FINALE
// Footer responsive avec horaires d'ouverture mis à jour

import { Link } from 'react-router-dom';
import libraryLogo from '../../assets/images/Bc_logo.png';
import { useLanguage } from '../../contexts/LanguageContext';

import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const QUICK_LINKS = [
  {
    labelFr: 'Catalogue OPAC',
    labelEn: 'OPAC catalog',
    href: '/catalogue'
  },
  {
    labelFr: 'Thèses & Mémoires',
    labelEn: 'Theses & Dissertations',
    href: '/archives'
  },
  {
    labelFr: 'Déposer un mémoire',
    labelEn: 'Submit a dissertation',
    href: '/depot/soumettre'
  },
  {
    labelFr: 'E-Ressources',
    labelEn: 'E-resources',
    href: '/ressources/electroniques'
  },
  {
    labelFr: 'Actualités',
    labelEn: 'News',
    href: '/actualites'
  },
  {
    labelFr: 'Contact',
    labelEn: 'Contact',
    href: '/contact'
  },
];

const RESOURCES = [
  {
    label: 'Research4Life',
    href: 'https://www.research4life.org',
    ext: true
  },
  {
    label: 'OpenDOAR',
    href: 'https://v2.sherpa.ac.uk/opendoar/',
    ext: true
  },
  {
    label: 'DOAJ',
    href: 'https://doaj.org',
    ext: true
  },
  {
    label: 'BNF Gallica',
    href: 'https://gallica.bnf.fr',
    ext: true
  },
  {
    label: 'OpenEdition',
    href: 'https://www.openedition.org',
    ext: true
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const { language } = useLanguage();

  const t = (fr, en) =>
    language === 'en'
      ? (en || fr)
      : fr;

  return (
    <footer className="footer">

      {/* =====================================================
          CONTENU PRINCIPAL DU FOOTER
          ===================================================== */}
      <div
        className="container"
        style={{
          padding:
            'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px) 0'
        }}
      >

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(28px, 4vw, 48px)',
            paddingBottom: 'clamp(28px, 4vw, 48px)',
            borderBottom:
              '1px solid rgba(255,255,255,0.1)'
          }}
        >

          {/* =================================================
              1. BRAND / LOGO
              ================================================= */}
          <div>

            <div
              className="footer-logo-wrapper"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                background: 'white',
                padding:
                  'clamp(10px, 1.5vw, 16px) clamp(16px, 2.5vw, 26px)',
                borderRadius: 14,
                boxShadow:
                  '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '100%'
              }}
            >
              <img
                src={libraryLogo}
                alt="Université de Yaoundé I - Bibliothèque Centrale"
                className="footer-logo-img"
                style={{
                  height:
                    'clamp(70px, 8vw, 100px)',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <p
              style={{
                fontSize:
                  'clamp(12.5px, 1vw, 13.5px)',
                lineHeight: 1.7,
                color:
                  'rgba(255,255,255,0.6)',
                marginBottom: 20
              }}
            >
              {t(
                "La Bibliothèque Centrale de l'Université de Yaoundé I est au service de la communauté universitaire depuis 1962.",
                "The Central Library of the University of Yaoundé I serves the academic community since 1962."
              )}
            </p>

            {/* Réseaux sociaux */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >

              {/* Facebook */}
              <a
                href="https://www.facebook.com/Biblioth%C3%A8que-Centrale-Universit%C3%A9-de-Yaound%C3%A9-1-1389540161289157/?ref=hl"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/?gl=FR"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

            </div>
          </div>

          {/* =================================================
              2. LIENS RAPIDES
              ================================================= */}
          <div>

            <h4 className="footer-section-title">
              {t(
                'Liens Rapides',
                'Quick links'
              )}
            </h4>

            <ul className="footer-list">

              {QUICK_LINKS.map(link => (
                <li key={link.href}>

                  <Link
                    to={link.href}
                    className="footer-link"
                  >
                    <ChevronRight size={12} />

                    {language === 'en'
                      ? (link.labelEn ||
                        link.labelFr)
                      : link.labelFr}
                  </Link>

                </li>
              ))}

            </ul>

          </div>

          {/* =================================================
              3. RESSOURCES EXTERNES
              ================================================= */}
          <div>

            <h4 className="footer-section-title">
              {t(
                'Ressources Externes',
                'External resources'
              )}
            </h4>

            <ul className="footer-list">

              {RESOURCES.map(resource => (
                <li key={resource.href}>

                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    <ExternalLink size={11} />

                    {resource.label}
                  </a>

                </li>
              ))}

            </ul>

          </div>

          {/* =================================================
              4. CONTACT
              ================================================= */}
          <div>

            <h4 className="footer-section-title">
              {t(
                'Contact',
                'Contact'
              )}
            </h4>

            <ul className="footer-contact-list">

              {/* Adresse */}
              <li className="footer-contact-item">

                <MapPin
                  size={14}
                  color="var(--or)"
                />

                <span>
                  {language === 'en'
                    ? 'University of Yaoundé I\nYaoundé, Cameroon'
                    : 'Université de Yaoundé I\nYaoundé, Cameroun'}
                </span>

              </li>

              {/* Téléphone */}
              <li className="footer-contact-item">

                <Phone
                  size={14}
                  color="var(--or)"
                />

                <span>
                  + 237 242 06 47 28
                </span>

              </li>

              {/* Email */}
              <li className="footer-contact-item">

                <Mail
                  size={14}
                  color="var(--or)"
                />

                <span>
                  biblio.Bibliotheque@uy1.uninet.cm
                </span>

              </li>

            </ul>

            {/* =================================================
                HORAIRES D'OUVERTURE
                ================================================= */}
            <div className="footer-hours">

              <div className="footer-hours-title">
                {t(
                  "Horaires d'ouverture",
                  'Opening hours'
                )}
              </div>

              <div className="footer-hours-content">

                {/* Lundi */}
                <div>
                  {t(
                    'Lundi : 12h00 – 22h00',
                    'Monday : 12h00 – 22h00'
                  )}
                </div>

                {/* Mardi - Vendredi */}
                <div>
                  {t(
                    'Mardi – Vendredi : 09h00 – 22h00',
                    'Tuesday – Friday : 09h00 – 22h00'
                  )}
                </div>

                {/* Samedi */}
                <div>
                  {t(
                    'Samedi : 10h00 – 16h00',
                    'Saturday : 10h00 – 16h00'
                  )}
                </div>

                {/* Dimanche */}
                <div className="footer-hours-closed">
                  {t(
                    'Dimanche : Fermé',
                    'Sunday : Closed'
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            BOTTOM BAR
            ===================================================== */}
        <div className="footer-bottom">

          <span className="footer-copyright">

            {t(
              `© ${year} Bibliothèque Centrale Universitaire – Université de Yaoundé I. Tous droits réservés.`,
              `© ${year} Central University Library – University of Yaoundé I. All rights reserved.`
            )}

          </span>

          <div className="footer-legal-links">

            <Link to="/mentions-legales">
              {t(
                'Mentions légales',
                'Legal notices'
              )}
            </Link>

            <Link to="/confidentialite">
              {t(
                'Confidentialité',
                'Privacy'
              )}
            </Link>

            <Link to="/cgv">
              {t(
                'CGV',
                'Terms'
              )}
            </Link>

            <Link to="/politique-cookies">
              {t(
                '🍪 Cookies',
                '🍪 Cookies'
              )}
            </Link>

          </div>

        </div>

      </div>

      {/* =====================================================
          STYLES RESPONSIVE
          ===================================================== */}
      <style>{`

        /* ================================================
           LOGO
           ================================================ */

        .footer-logo-wrapper {
          transition:
            transform 0.3s ease;
        }

        .footer-logo-wrapper:hover {
          transform:
            translateY(-2px);
        }


        /* ================================================
           TITRES DES SECTIONS
           ================================================ */

        .footer-section-title {
          color: var(--or);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          text-transform: uppercase;
        }


        /* ================================================
           LISTES
           ================================================ */

        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0;
          padding: 0;
        }

        .footer-link {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition:
            color 0.2s ease;
        }

        .footer-link:hover {
          color: white;
        }


        /* ================================================
           CONTACT
           ================================================ */

        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: 0;
          padding: 0;
        }

        .footer-contact-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
          white-space: pre-line;
        }

        .footer-contact-item svg {
          flex-shrink: 0;
          margin-top: 2px;
        }


        /* ================================================
           HORAIRES
           ================================================ */

        .footer-hours {
          margin-top: 20px;
          padding: 12px 16px;
          background: rgba(124,58,237,0.1);
          border-radius: 10px;
          border:
            1px solid rgba(124,58,237,0.2);
        }

        .footer-hours-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--or);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .footer-hours-content {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          line-height: 1.8;
        }

        .footer-hours-closed {
          color: rgba(255,255,255,0.4);
        }


        /* ================================================
           RÉSEAUX SOCIAUX
           ================================================ */

        .footer-social-link {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .footer-social-link:hover {
          background:
            rgba(124,58,237,0.25);
          color: white;
        }


        /* ================================================
           BOTTOM BAR
           ================================================ */

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 20px 0;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }

        .footer-copyright {
          flex: 1 1 auto;
          min-width: 240px;
        }

        .footer-legal-links {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-legal-links a {
          color: inherit;
          text-decoration: none;
          transition:
            color 0.2s ease;
        }

        .footer-legal-links a:hover {
          color: white;
        }


        /* ================================================
           RESPONSIVE TABLETTE
           ================================================ */

        @media (max-width: 992px) {

          .footer-logo-img {
            height:
              clamp(64px, 9vw, 85px) !important;
          }

        }


        /* ================================================
           RESPONSIVE MOBILE
           ================================================ */

        @media (max-width: 640px) {

          .footer-logo-wrapper {
            padding:
              12px 18px !important;
          }

          .footer-logo-img {
            height:
              clamp(60px, 14vw, 80px) !important;
          }

          .footer-bottom {
            flex-direction: column;
          }

          .footer-copyright {
            min-width: 0;
          }

        }


        /* ================================================
           TRÈS PETIT MOBILE
           ================================================ */

        @media (max-width: 400px) {

          .footer-logo-wrapper {
            padding:
              10px 14px !important;
            border-radius:
              12px !important;
          }

          .footer-logo-img {
            height:
              clamp(56px, 16vw, 70px) !important;
          }

          .footer-hours {
            padding:
              10px 12px;
          }

        }


        /* ================================================
           PROTECTION CONTRE LE DÉBORDEMENT
           ================================================ */

        .footer img {
          max-width: 100%;
        }

      `}</style>

    </footer>
  );
}



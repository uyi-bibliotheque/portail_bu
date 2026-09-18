// pages/DepotInstitutionnel.jsx - VERSION COMPLÈTE OPTIMISÉE

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import Reveal from '../components/Reveal';
import {
  ExternalLink,
  BookOpen,
  Search,
  GraduationCap,
  Globe,
  Database,
  ArrowRight,
  Library,
  CheckCircle,
  Users,
  BookMarked,
  FileText,
  Sparkles,
} from 'lucide-react';

// ============================================================
// STYLES RESPONSIVE LOCAUX
// ============================================================

const responsiveStyles = `
  @media (max-width: 1024px) {
    .depot-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .depot-grid-3 { grid-template-columns: 1fr !important; }
    .depot-cta-actions { flex-direction: column !important; align-items: stretch !important; }
    .depot-cta-actions .btn { width: 100% !important; justify-content: center !important; }
  }
`;

// ============================================================
// DONNÉES DES OUTILS DE RECHERCHE
// ============================================================

const RECHERCHE_TOOLS = [
  {
    name: 'Google Scholar',
    icon: 'graduation',
    gradient: 'linear-gradient(135deg, #4285f4, #34a853)',
    color: '#4285f4',
    description:
      "Permet de découvrir des travaux universitaires dans toutes les disciplines, avec un accès intégral lorsque c'est possible. Ces travaux peuvent provenir d'éditeurs scientifiques, de sociétés savantes, de référentiels de prépublication, d'universités et d'autres organisations de recherche.",
    url: 'https://scholar.google.com/',
    tags: ['Multidisciplinaire', 'Open Access'],
  },
  {
    name: 'OAISter',
    icon: 'search',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: '#f59e0b',
    description:
      'Propose une recherche simultanée dans 680 dépôts très variés, contenant des articles, des thèses, des rapports, des documents numérisés... et disponibles gratuitement.',
    url: 'http://oaister.worldcat.org/',
    tags: ['680 dépôts', 'Gratuit'],
  },
  {
    name: 'BASE',
    icon: 'database',
    gradient: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#7c3aed',
    description:
      "Bielefeld Academic Search Engine : l'un des moteurs de recherche les plus volumineux du monde, avec plus de 65 millions de documents provenant de plus de 3200 sources en Open Access.",
    url: 'https://www.base-search.net/',
    tags: ['65M+ documents', '3200+ sources'],
  },
];

const AVANTAGES = [
  { icon: 'sparkles', text: 'Une valorisation et une diffusion accrues de la recherche à un niveau mondial' },
  { icon: 'check', text: 'Un accès plus rapide à la production scientifique' },
  { icon: 'library', text: "Une garantie de pérennité des dépôts réalisés et de leur accès" },
  { icon: 'users', text: "Un renforcement du prestige de l'Institution et du rayonnement de ses chercheurs" },
];

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function IconRenderer({ name, size = 24, color = 'currentColor' }) {
  const icons = {
    graduation: GraduationCap,
    search: Search,
    database: Database,
    book: BookOpen,
    sparkles: Sparkles,
    check: CheckCircle,
    library: Library,
    users: Users,
    file: FileText,
  };
  const Icon = icons[name] || BookOpen;
  return <Icon size={size} color={color} />;
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function DepotInstitutionnel() {
  useEffect(() => {
    document.title = "Dépôt institutionnel - BCUY1";
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Dépôt institutionnel - Bibliothèque Centrale UYI</title>
        <meta
          name="description"
          content="Découvrez le dépôt institutionnel de l'Université de Yaoundé I : recueillir, préserver et diffuser la production scientifique en libre accès."
        />
      </Helmet>
      <style>{responsiveStyles}</style>

      {/* ============================================================
          HERO / EN-TÊTE
          ============================================================ */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
          padding: 'clamp(32px, 5vw, 56px) 0 clamp(24px, 3vw, 40px) 0',
        }}
      >
        <div className="container">
          <nav
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 16,
              fontSize: 'clamp(11px, 0.9vw, 13px)',
              alignItems: 'center',
            }}
          >
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Accueil
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link to="/bibliotheque/presentation" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Bibliothèque
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: 'var(--or)' }}>Dépôt institutionnel</span>
          </nav>

          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              color: 'white',
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Dépôt institutionnel de l'
            <span style={{ color: 'var(--or)' }}>UYI</span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 'clamp(14px, 1.1vw, 17px)',
              maxWidth: 720,
              lineHeight: 1.7,
            }}
          >
            Recueillir, préserver et diffuser la production scientifique de l'Université de Yaoundé I en
            libre accès.
          </p>
        </div>
      </div>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <main className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        {/* ---------- Section 1 : Définition ---------- */}
        <Reveal className="reveal-up">
          <section
            className="card"
            style={{
              padding: 'clamp(24px, 3vw, 36px)',
              marginBottom: 28,
              borderLeft: '4px solid var(--or)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--or)',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={24} />
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(20px, 2.2vw, 28px)',
                  color: 'var(--bleu-nuit)',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Qu'est-ce qu'un Dépôt institutionnel ?
              </h2>
            </div>
            <p
              style={{
                margin: 0,
                textAlign: 'justify',
                color: 'var(--texte)',
                lineHeight: 1.85,
                fontSize: 'clamp(14px, 0.95vw, 15px)',
              }}
            >
              Un dépôt (ou répertoire) institutionnel vise à recueillir en texte intégral la production
              scientifique d'une Institution et à la rendre librement accessible via Internet afin d'en
              augmenter la visibilité et l'impact. Il offre un ensemble de services permettant d'enregistrer,
              préserver et diffuser des documents numériques. Les chercheurs peuvent y archiver eux-mêmes
              leurs travaux (<strong>auto-archivage</strong>).
            </p>
          </section>
        </Reveal>

        {/* ---------- Section 2 : Avantages ---------- */}
        <Reveal className="reveal-up" delay={80}>
          <section
            className="card"
            style={{
              padding: 'clamp(24px, 3vw, 36px)',
              marginBottom: 28,
              borderLeft: '4px solid var(--or)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--or)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={24} />
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(20px, 2.2vw, 28px)',
                  color: 'var(--bleu-nuit)',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Quels avantages pour le chercheur ?
              </h2>
            </div>

            <p
              style={{
                marginBottom: 18,
                color: 'var(--texte)',
                fontSize: 'clamp(14px, 0.95vw, 15px)',
              }}
            >
              Un dépôt institutionnel permet notamment :
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {AVANTAGES.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '10px 14px',
                    background: 'var(--beige)',
                    borderRadius: 10,
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <CheckCircle
                    size={18}
                    color="var(--or)"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: 'clamp(13px, 0.9vw, 14.5px)',
                      color: 'var(--texte)',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA UQAM */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a
                href="http://www.bibliotheques.uqam.ca/libre-acces/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 'clamp(13px, 0.95vw, 14.5px)',
                }}
              >
                <ExternalLink size={16} />
                Dépôt institutionnel en libre accès
              </a>
            </div>

            <p
              style={{
                marginTop: 24,
                marginBottom: 0,
                textAlign: 'justify',
                color: 'var(--texte-muted)',
                lineHeight: 1.8,
                fontSize: 'clamp(14px, 0.95vw, 15px)',
              }}
            >
              La Bibliothèque Centrale de l'Université de Yaoundé I, à travers son portail Web, donne accès
              à ses utilisateurs aux travaux universitaires des autres, et offre la possibilité de recherche
              dans des dépôts institutionnels grâce à des outils de recherche simultanée.
            </p>
          </section>
        </Reveal>

        {/* ---------- Section 3 : Outils de recherche ---------- */}
        <Reveal className="reveal-up" delay={120}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 16px',
                  background: 'rgba(124,58,237,0.1)',
                  borderRadius: 50,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(10px, 0.8vw, 11px)',
                    fontWeight: 700,
                    color: 'var(--or)',
                    letterSpacing: '0.06em',
                  }}
                >
                  🔎 MOTEURS DE RECHERCHE
                </span>
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(22px, 2.8vw, 34px)',
                  color: 'var(--bleu-nuit)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Outils de recherche simultanée dans les dépôts d'archives
              </h2>
            </div>

            <div
              className="depot-grid-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(16px, 2vw, 24px)',
              }}
            >
              {RECHERCHE_TOOLS.map((tool, idx) => (
                <Reveal key={tool.name} className="reveal-up" delay={idx * 80}>
                  <div
                    className="card"
                    style={{
                      padding: 'clamp(20px, 2.5vw, 28px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      height: '100%',
                      borderTop: `4px solid ${tool.color}`,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: tool.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      }}
                    >
                      <IconRenderer name={tool.icon} size={26} />
                    </div>

                    <h3
                      style={{
                        fontSize: 'clamp(16px, 1.15vw, 18px)',
                        fontWeight: 700,
                        color: 'var(--bleu-nuit)',
                        margin: 0,
                      }}
                    >
                      {tool.name}
                    </h3>

                    <p
                      style={{
                        fontSize: 'clamp(12.5px, 0.88vw, 13.5px)',
                        color: 'var(--texte-muted)',
                        lineHeight: 1.65,
                        flex: 1,
                        margin: 0,
                      }}
                    >
                      {tool.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 'clamp(9.5px, 0.7vw, 10.5px)',
                            padding: '3px 10px',
                            borderRadius: 50,
                            background: `${tool.color}12`,
                            color: tool.color,
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 18px',
                        fontSize: 'clamp(12px, 0.85vw, 13px)',
                      }}
                    >
                      Connexion
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- Section 4 : CTA final ---------- */}
        <Reveal className="reveal-up" delay={200}>
          <section
            className="card"
            style={{
              padding: 'clamp(28px, 4vw, 48px)',
              background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
              border: 'none',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(124,58,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--or)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <GraduationCap size={32} />
            </div>

            <h3
              className="font-serif"
              style={{
                fontSize: 'clamp(20px, 2.4vw, 28px)',
                color: 'white',
                fontWeight: 400,
                marginBottom: 14,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Besoin d'aide pour vos recherches ?
            </h3>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: 'clamp(13.5px, 0.95vw, 15px)',
                marginBottom: 28,
                maxWidth: 560,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.7,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Nos bibliothécaires sont à votre disposition pour vous accompagner dans l'utilisation des
              dépôts institutionnels et des outils de recherche.
            </p>
            <div
              className="depot-cta-actions"
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Link
                to="/services/mediation"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 'clamp(13px, 0.95vw, 14.5px)',
                }}
              >
                <Users size={16} />
                Bibliothécaire à votre service
              </Link>
              <Link
                to="/services/formation"
                className="btn btn-outline-white"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 'clamp(13px, 0.95vw, 14.5px)',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.4)',
                }}
              >
                <GraduationCap size={16} />
                Formation à la demande
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
    </Layout>
  );
}
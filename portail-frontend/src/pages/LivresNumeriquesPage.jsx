// pages/LivresNumeriquesPage.jsx
import { useState } from 'react';
import { 
  BookOpen, Globe, ExternalLink, Unlock, Database, 
  Sparkles, Lock, Library, Layers, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';

const PLATFORMS = [
  {
    id: 'springerlink',
    emoji: '📗',
    title: 'SpringerLink',
    access: 'Accès institutionnel',
    accessType: 'paid',
    url: 'https://link.springer.com/',
    description: 'Accès au texte complet de milliers d\'e-books avec recherche avancée, alertes, fils RSS et téléchargement PDF chapitre par chapitre.',
    tags: ['Sciences', 'Ingénierie', 'Médecine', 'PDF'],
  },
  {
    id: 'emsat',
    emoji: '📘',
    title: 'EMSAT',
    access: 'Accès institutionnel',
    accessType: 'paid',
    url: 'https://www.sciencedirect.com/book/9780080431529',
    description: 'Encyclopedia of Materials : Science and Technology — 1 800 articles et plus de 10 000 pages rédigées par des experts, consultables par thématiques, auteur ou texte intégral.',
    tags: ['Ingénierie', 'Matériaux', 'Encyclopédie'],
  },
  {
    id: 'techniques-ingenieur',
    emoji: '⚙️',
    title: 'Techniques de l\'Ingénieur',
    access: 'Accès institutionnel',
    accessType: 'paid',
    url: 'https://www.techniques-ingenieur.fr/',
    description: 'Base documentaire technique sans équivalent en langue française : 60 000 pages en texte intégral couvrant l\'Agroalimentaire, l\'Analyse, les Constantes physico-chimiques, et plus encore.',
    tags: ['Technique', 'Francophone', 'Texte intégral'],
  },
  {
    id: 'wikisource',
    emoji: '📖',
    title: 'Wikisource',
    access: 'Libre accès',
    accessType: 'free',
    url: 'https://wikisource.org/',
    description: 'Bibliothèque numérique multilingue de la Fondation Wikimedia. Des centaines de milliers de textes libres de droits dans plus de cinquante langues.',
    tags: ['Multilingue', 'Libre de droits', 'Littérature'],
  },
  {
    id: 'open-library',
    emoji: '🌐',
    title: 'Open Library',
    access: 'Libre accès',
    accessType: 'free',
    url: 'https://openlibrary.org/',
    description: 'Projet de l\'Internet Archive (non lucratif). Catalogue universel avec emprunt numérique gratuit, financé en partie par la California State Library.',
    tags: ['Archives', 'Emprunt numérique', 'Universel'],
  },
];

const FREE_INITIATIVES = [
  {
    id: 'abbol',
    emoji: '🌍',
    title: 'ABBOL – African Book Bank Online',
    url: 'http://www.abbol.com/',
    description: 'Publications africanistes académiques antérieures aux années 1960 sur la période coloniale d\'Afrique sub-saharienne (Sciences Humaines et Sociales). Plus de 30 livres disponibles en ligne.',
    tags: ['Afrique', 'SHS', 'Coloniale'],
  },
  {
    id: 'african-digital',
    emoji: '📚',
    title: 'African Digital Library',
    url: 'http://www.africandl.org.za/',
    description: 'Bibliothèque virtuelle accessible après enregistrement aux habitants d\'Afrique. Livres et périodiques issus de bibliothèques universitaires américaines et d\'éditeurs partenaires.',
    tags: ['Afrique', 'Périodiques', 'Gratuit'],
  },
  {
    id: 'alma',
    emoji: '📜',
    title: 'ALMA – African Languages Materials Archive',
    url: 'https://www.codesria.org/',
    description: 'Collection UNESCO de livres numérisés PDF classés par langues africaines (bambara, haoussa, wolof, pular…) : contes, poésies, textes religieux et essais sur la culture africaine.',
    tags: ['UNESCO', 'Langues africaines', 'PDF'],
  },
  {
    id: 'ebooks-gratuits',
    emoji: '📕',
    title: 'E-books Libres et Gratuits',
    url: 'https://www.ebooksgratuits.com/',
    description: 'Plus de 1 900 e-books francophones en 7 formats (PDF, EPUB, ODT…). Incontournable pour la grande littérature européenne et américaine du XVIIIe au XXe siècle.',
    tags: ['Francophone', 'Littérature', 'EPUB'],
  },
  {
    id: 'europeana',
    emoji: '🏛️',
    title: 'Europeana',
    url: 'https://www.europeana.eu/',
    description: 'Bibliothèque numérique multilingue née de la collaboration d\'institutions européennes (Gallica, BnF…). Accès libre à textes, images, vidéos et enregistrements sonores patrimoniaux.',
    tags: ['Europe', 'Patrimoine', 'Multimédia'],
  },
  {
    id: 'avalon',
    emoji: '⚖️',
    title: 'Avalon Project (Yale Law School)',
    url: 'https://avalon.law.yale.edu/',
    description: 'Compilation de documents sur le Droit, l\'Histoire et la Diplomatie (XVIIIe–XXIe s.). Recherche chronologique, thématique ou par auteur/titre avec liens croisés.',
    tags: ['Droit', 'Histoire', 'Diplomatie'],
  },
];

function ResourceCard({ item, isFree }) {
  return (
    <div className="lne-card card">
      <div className="card-body">
        {/* Badge accès */}
        {!isFree && (
          <span className={`badge ${item.accessType === 'free' ? 'badge-green' : 'badge-or'}`} style={{ marginBottom: 14, display: 'inline-flex' }}>
            {item.accessType === 'free'
              ? <><Unlock size={11} /> Libre accès</>
              : <><Lock size={11} /> Accès institutionnel</>}
          </span>
        )}
        {isFree && (
          <span className="badge badge-green" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <Unlock size={11} /> Accès libre & gratuit
          </span>
        )}

        {/* Header */}
        <div className="lne-card-header">
          <span className="lne-card-emoji">{item.emoji}</span>
          <h3 className="lne-card-title">{item.title}</h3>
        </div>

        {/* Description */}
        <p className="lne-card-desc">{item.description}</p>

        {/* Tags */}
        <div className="lne-card-tags">
          {item.tags.map((t, i) => (
            <span key={i} className="lne-tag">{t}</span>
          ))}
        </div>

        {/* Action */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-bleu btn-sm"
          style={{ marginTop: 18, width: 'fit-content' }}
        >
          Accéder à la ressource <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

export default function LivresNumeriquesPage() {
  const [section, setSection] = useState('presentation');

  return (
    <Layout>
      <Seo
        title="Livres Électroniques & E-Books — BCU UYI"
        description="Découvrez les plateformes d'e-books et ressources numériques accessibles depuis la Bibliothèque Centrale de l'Université de Yaoundé I : SpringerLink, EMSAT, Techniques de l'ingénieur, Wikisource et initiatives africaines gratuites."
      />

      <style>{`
        /* ── PAGE LIVRES NUMÉRIQUES ─────────────────────────────── */

        /* Hero */
        .lne-hero {
          background: var(--bleu-nuit);
          padding: 60px 0 48px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .lne-hero::after {
          content: '';
          position: absolute;
          top: -60px; right: -80px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .lne-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 16px;
          border-radius: 50px;
          background: rgba(124,58,237,0.18);
          border: 1px solid rgba(124,58,237,0.35);
          color: var(--or);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .lne-hero h1 {
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 800;
          color: #fff;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .lne-hero h1 em {
          color: var(--or);
          font-style: normal;
        }
        .lne-hero-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          max-width: 640px;
          line-height: 1.65;
          margin-bottom: 28px;
        }

        /* Hero Stats */
        .lne-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .lne-stat {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius-sm);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(8px);
        }
        .lne-stat-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(124,58,237,0.2);
          color: var(--or);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lne-stat-num { font-size: 19px; font-weight: 800; color: #fff; line-height: 1.1; }
        .lne-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px; }

        /* Tabs Nav */
        .lne-nav {
          background: white;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: var(--header-h, 68px);
          z-index: 20;
        }
        .lne-nav-inner {
          display: flex;
          gap: 4px;
          padding: 10px 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .lne-nav-inner::-webkit-scrollbar { display: none; }
        .lne-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--texte-muted);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .lne-tab:hover {
          background: var(--beige);
          color: var(--bleu-nuit);
        }
        .lne-tab.active {
          background: var(--bleu-nuit);
          color: white;
          box-shadow: 0 4px 12px rgba(27,20,100,0.2);
        }

        /* Page body */
        .lne-body {
          padding: 40px 0 64px;
          background: var(--beige);
          min-height: 50vh;
        }

        /* Section header */
        .lne-section-header {
          margin-bottom: 28px;
        }
        .lne-section-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--bleu-nuit);
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .lne-section-sub {
          font-size: 14px;
          color: var(--texte-muted);
        }

        /* Prose (Presentation) */
        .lne-prose {
          background: white;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 40px;
          max-width: 820px;
          margin: 0 auto;
          font-size: 15px;
          color: var(--texte);
          line-height: 1.72;
          box-shadow: 0 4px 16px rgba(27,20,100,0.04);
        }
        .lne-prose h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--bleu-nuit);
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .lne-prose h2 + p { margin-top: 0; }
        .lne-prose p { margin-bottom: 14px; }
        .lne-prose ul {
          padding-left: 20px;
          margin-bottom: 14px;
        }
        .lne-prose li { margin-bottom: 7px; }
        .lne-prose hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 28px 0;
        }
        .lne-info-box {
          padding: 14px 18px;
          background: var(--beige);
          border: 1px solid var(--border);
          border-left: 4px solid var(--or);
          border-radius: var(--radius-xs);
          font-size: 14px;
          color: var(--texte);
          margin-top: 20px;
        }
        .lne-prose-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        /* Grid des ressources */
        .lne-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
        }

        /* Card overrides */
        .lne-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .lne-card .card-body {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .lne-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }
        .lne-card-emoji { font-size: 36px; flex-shrink: 0; }
        .lne-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--bleu-nuit);
          line-height: 1.3;
        }
        .lne-card-desc {
          font-size: 13.5px;
          color: var(--texte-muted);
          line-height: 1.6;
          margin-bottom: 14px;
          flex: 1;
        }
        .lne-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .lne-tag {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 6px;
          background: var(--beige-dark);
          color: var(--texte-muted);
          border: 1px solid var(--border-light);
        }

        /* Guide section */
        .lne-guide {
          margin-top: 52px;
          background: white;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 36px;
          box-shadow: 0 4px 16px rgba(27,20,100,0.04);
        }
        .lne-guide-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--bleu-nuit);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .lne-guide-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 22px;
        }
        .lne-guide-card {
          background: var(--beige);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 20px;
        }
        .lne-guide-step {
          font-size: 11px;
          font-weight: 800;
          color: var(--or);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 7px;
        }
        .lne-guide-card h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--bleu-nuit);
          margin-bottom: 6px;
        }
        .lne-guide-card p {
          font-size: 13px;
          color: var(--texte-muted);
          line-height: 1.55;
        }

        @media (max-width: 768px) {
          .lne-hero { padding: 40px 0 32px; }
          .lne-prose { padding: 24px; }
          .lne-grid { grid-template-columns: 1fr; }
          .lne-guide { padding: 24px; }
          .lne-stat-num { font-size: 17px; }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="lne-hero">
        <div className="container">
          <div className="lne-hero-badge">
            <Sparkles size={14} /> Bibliothèque Numérique
          </div>

          <h1>Livres Électroniques &amp; <em>E-Books</em></h1>

          <p className="lne-hero-desc">
            Des œuvres dématérialisées accessibles sur ordinateurs, lecteurs dédiés et tablettes. Explorez les plateformes institutionnelles et les initiatives gratuites de la BCU-UYI.
          </p>

          {/* Statistiques */}
          <div className="lne-stats">
            <div className="lne-stat">
              <div className="lne-stat-icon"><BookOpen size={18} /></div>
              <div>
                <div className="lne-stat-num">+250 000</div>
                <div className="lne-stat-lbl">Livres électroniques</div>
              </div>
            </div>
            <div className="lne-stat">
              <div className="lne-stat-icon"><GraduationCap size={18} /></div>
              <div>
                <div className="lne-stat-num">+15 000</div>
                <div className="lne-stat-lbl">Thèses &amp; Mémoires</div>
              </div>
            </div>
            <div className="lne-stat">
              <div className="lne-stat-icon"><Database size={18} /></div>
              <div>
                <div className="lne-stat-num">12+</div>
                <div className="lne-stat-lbl">Bases abonnées</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NAVIGATION ─── */}
      <nav className="lne-nav" aria-label="Navigation livres numériques">
        <div className="container">
          <div className="lne-nav-inner">
            <button
              className={`lne-tab ${section === 'presentation' ? 'active' : ''}`}
              onClick={() => setSection('presentation')}
            >
              <BookOpen size={15} /> Présentation
            </button>
            <button
              className={`lne-tab ${section === 'plateformes' ? 'active' : ''}`}
              onClick={() => setSection('plateformes')}
            >
              <Database size={15} /> Plateformes E-books
            </button>
            <button
              className={`lne-tab ${section === 'gratuites' ? 'active' : ''}`}
              onClick={() => setSection('gratuites')}
            >
              <Unlock size={15} /> Initiatives gratuites
            </button>
          </div>
        </div>
      </nav>

      {/* ─── CONTENU ─── */}
      <div className="lne-body">
        <div className="container">

          {/* ═══ PRÉSENTATION ═══ */}
          {section === 'presentation' && (
            <div className="lne-prose">
              <h2>
                <BookOpen size={20} color="var(--or)" />
                Qu'est-ce qu'un livre électronique ?
              </h2>
              <p>
                Les <strong>e-books ou livres numériques</strong> sont des livres ou des œuvres dématérialisés sous la forme de fichiers informatiques. Ils peuvent être téléchargés, transportés, archivés et lus sur différents dispositifs électroniques (ordinateurs, lecteurs dédiés, PDA…), grâce à un logiciel adéquat.
              </p>
              <p>
                Ces e-books peuvent être créés par des éditeurs professionnels ou des associations et mis à disposition, moyennant paiement ou non, via des plateformes intégrées ou de simples sites web.
              </p>

              <hr />

              <h2>
                <Globe size={20} color="var(--or)" />
                Ressources disponibles à la BCU-UYI
              </h2>
              <p>La Bibliothèque Centrale met à disposition deux types de ressources numériques :</p>
              <ul>
                <li>
                  <strong>Plateformes institutionnelles abonnées</strong> — accessibles sur le réseau du campus (IP UYI) ou avec un identifiant BU : SpringerLink, EMSAT, Techniques de l'Ingénieur, Wikisource, Open Library.
                </li>
                <li>
                  <strong>Initiatives gratuites</strong> — en libre accès sans restriction : ABBOL, African Digital Library, ALMA, E-books Libres &amp; Gratuits, Europeana, Avalon Project.
                </li>
              </ul>

              <div className="lne-info-box">
                <strong>Accès campus :</strong> Connectez-vous au WiFi de la bibliothèque ou utilisez vos identifiants lecteur PMB pour accéder aux ressources institutionnelles depuis chez vous.
              </div>

              <div className="lne-prose-actions">
                <button
                  className="btn btn-bleu btn-sm"
                  onClick={() => setSection('plateformes')}
                >
                  <Database size={14} /> Voir les plateformes
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSection('gratuites')}
                >
                  <Unlock size={14} /> Ressources gratuites
                </button>
              </div>
            </div>
          )}

          {/* ═══ PLATEFORMES ═══ */}
          {section === 'plateformes' && (
            <div>
              <div className="lne-section-header">
                <h2 className="lne-section-title">
                  <Database size={22} color="var(--or)" />
                  Quelques plateformes d'E-books
                </h2>
                <p className="lne-section-sub">
                  Ressources accessibles sur le réseau UYI ou via vos identifiants institutionnels.
                </p>
              </div>
              <div className="lne-grid">
                {PLATFORMS.map(p => <ResourceCard key={p.id} item={p} />)}
              </div>

              {/* Guide d'accès */}
              <div className="lne-guide">
                <h3 className="lne-guide-title">
                  <Library size={20} color="var(--or)" />
                  Comment accéder à ces ressources ?
                </h3>
                <p style={{ fontSize: 14, color: 'var(--texte-muted)' }}>
                  L'accès aux bases institutionnelles dépend de votre localisation et de votre profil.
                </p>
                <div className="lne-guide-grid">
                  <div className="lne-guide-card">
                    <div className="lne-guide-step">Sur le campus</div>
                    <h4>WiFi Bibliothèque</h4>
                    <p>Connectez-vous au réseau WiFi de la BU pour un accès automatique par adresse IP institutionnelle.</p>
                  </div>
                  <div className="lne-guide-card">
                    <div className="lne-guide-step">À distance</div>
                    <h4>Identifiants lecteur PMB</h4>
                    <p>Utilisez votre compte lecteur PMB pour vous authentifier et accéder aux ressources hors campus.</p>
                  </div>
                  <div className="lne-guide-card">
                    <div className="lne-guide-step">Open Access</div>
                    <h4>Sans restriction</h4>
                    <p>Wikisource et Open Library sont disponibles librement, depuis n'importe quel réseau, sans inscription.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ INITIATIVES GRATUITES ═══ */}
          {section === 'gratuites' && (
            <div>
              <div className="lne-section-header">
                <h2 className="lne-section-title">
                  <Unlock size={22} color="var(--or)" />
                  Livres électroniques — Initiatives gratuites
                </h2>
                <p className="lne-section-sub">
                  Ces plateformes sont en accès libre et gratuit, sans abonnement requis.
                </p>
              </div>
              <div className="lne-grid">
                {FREE_INITIATIVES.map(f => (
                  <ResourceCard key={f.id} item={f} isFree />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

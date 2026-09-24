// pages/HomePage.jsx - VERSION CORRIGÉE FINALE
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, BookOpen, GraduationCap, Upload, Globe,
  ArrowRight, Wifi, BookMarked, Users, Clock, ChevronRight,
  FileText, TrendingUp, Award, Library, Sparkles, CheckCircle,
  Calendar, MapPin, Phone, Mail, ExternalLink, PlayCircle,
  SlidersHorizontal, ChevronLeft, X, Bell, Image
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getArticles } from '../services/endpoints';
import Reveal from '../components/Reveal';
import { useLanguage } from '../contexts/LanguageContext';

// ── Images locales ──────────────────────────────────────────────
import heroBg from '../assets/images/bibliotheque_sunset_drone.jpg';

// ── SEO CONSTANTS ──────────────────────────────────────────────
const SEO = {
  title: 'Bibliothèque Centrale Universitaire - BCU UYI | Université de Yaoundé I',
  description: 'Portail de la Bibliothèque Centrale de l\'Université de Yaoundé I. Catalogue, thèses et mémoires, ressources numériques, dépôt institutionnel et services documentaires.',
  keywords: 'bibliothèque universitaire, BCU UYI, Université de Yaoundé I, catalogue PMB, thèses, mémoires, recherche documentaire, ressources numériques, Research4Life, dépôt institutionnel',
  author: 'Bibliothèque Centrale Universitaire - UYI',
  siteName: 'BCU UYI - Bibliothèque Centrale Universitaire',
  url: 'https://bcu-uyi.cm',
  image: 'https://bcu-uyi.cm/assets/images/og-image.jpg',
  twitterHandle: '@BCU_UYI',
};

// ── FLASH INFOS PAR DÉFAUT (si aucun article "Informations") ─────
const DEFAULT_FLASH = [
  '📚 Nouvelles acquisitions disponibles au niveau 2 – Sciences et Technologies',
  '🎓 Dépôt de mémoires 2024-2025 : délai limite le 30 août 2025',
  '🌐 Accès Research4Life étendu à toutes les facultés',
  '📅 Formation à la recherche documentaire – Chaque jeudi 14h00 en salle B12',
  '✅ Le catalogue PMB est désormais accessible 24h/24',
];

// ── ACCÈS RAPIDES ───────────────────────────────────────────────
const PMB_OPAC_URL = 'http://10.4.2.112/pmb/opac_css/';

const QUICK_ACCESS = [
  {
    icon: <BookOpen size={24} />,
    labelFr: 'Catalogue OPAC',
    labelEn: 'OPAC catalog',
    descFr: 'Rechercher dans 85 000+ notices',
    descEn: 'Search across 85,000+ records',
    href: '/catalogue',
    color: 'var(--bleu-nuit)',
    gradient: 'linear-gradient(135deg, #1B1464, #2D2178)',
    ariaLabelFr: 'Accéder au catalogue OPAC de la bibliothèque',
    ariaLabelEn: 'Access the library OPAC catalog'
  },
  {
    icon: <GraduationCap size={24} />,
    labelFr: 'Thèses & Mémoires',
    labelEn: 'Theses & Dissertations',
    descFr: '12 400+ travaux de recherche',
    descEn: '12,400+ research works',
    href: '/archives',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    ariaLabelFr: 'Consulter les thèses et mémoires de l\'UYI',
    ariaLabelEn: 'Consult UYI theses and dissertations'
  },
  {
    icon: <Globe size={24} />,
    labelFr: 'Research4Life',
    labelEn: 'Research4Life',
    descFr: 'Accès aux revues scientifiques',
    descEn: 'Access to scientific journals',
    href: '/ressources/electroniques',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    ariaLabelFr: 'Accéder aux bases de données Research4Life',
    ariaLabelEn: 'Access Research4Life databases'
  },
  {
    icon: <Upload size={24} />,
    labelFr: 'Déposer un mémoire',
    labelEn: 'Submit a dissertation',
    descFr: 'Dépôt institutionnel DSpace',
    descEn: 'Institutional DSpace repository',
    href: '/depot/soumettre',
    color: 'var(--or)',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    ariaLabelFr: 'Déposer votre mémoire ou thèse en ligne',
    ariaLabelEn: 'Submit your dissertation or thesis online'
  },
];

// ── SERVICES ─────────────────────────────────────────────────────
const SERVICES = [
  { icon: <BookMarked size={22} />, labelFr: 'Consultation', labelEn: 'Consultation', href: '/services/consultation', descFr: 'Accès aux collections', descEn: 'Access to collections' },
  { icon: <Wifi size={22} />, labelFr: 'WiFi 200 Mbps', labelEn: 'WiFi 200 Mbps', href: '/services/wifi', descFr: 'Connexion haut débit', descEn: 'High-speed connection' },
  { icon: <FileText size={22} />, labelFr: 'Reliure', labelEn: 'Binding', href: '/services/reliure', descFr: 'Service de reliure', descEn: 'Binding service' },
  { icon: <Users size={22} />, labelFr: 'Médiation', labelEn: 'Mediation', href: '/services/mediation', descFr: 'Aide à la recherche', descEn: 'Research assistance' },
  { icon: <GraduationCap size={22} />, labelFr: 'Formation', labelEn: 'Training', href: '/services/formation', descFr: 'Formation documentaire', descEn: 'Documentary training' },
];

// ── STATISTIQUES ─────────────────────────────────────────────────
const STATS = [
  { value: 85000, labelFr: 'Ouvrages catalogués', labelEn: 'Catalogued works', suffix: '+', icon: <BookOpen size={20} /> },
  { value: 12400, labelFr: 'Thèses & mémoires', labelEn: 'Theses & dissertations', suffix: '+', icon: <GraduationCap size={20} /> },
  { value: 200, labelFr: 'Mbps WiFi campus', labelEn: 'Campus WiFi Mbps', suffix: '', icon: <Wifi size={20} /> },
  { value: 8, labelFr: 'Facultés desservies', labelEn: 'Faculties served', suffix: '', icon: <Library size={20} /> },
];

// ─── DONNÉES STRUCTURÉES JSON-LD ────────────────────────────────
function getJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Library',
    name: 'Bibliothèque Centrale Universitaire de Yaoundé I',
    alternateName: 'BCU UYI',
    description: SEO.description,
    url: SEO.url,
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Université de Yaoundé I',
      url: 'https://uy1.uninet.cm',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Campus de l\'Université de Yaoundé I',
      addressLocality: 'Yaoundé',
      addressCountry: 'CM',
    },
    openingHours: 'Mo-Fr 07:30-15:30, Sa 08:00-13:00',
    telephone: '+237 242 06 47 28',
    email: 'contact@bcu-uyi.cm',
    sameAs: [
      'https://www.facebook.com/BCUUYI',
      'https://twitter.com/BCU_UYI',
      'https://www.instagram.com/bcu_uyi/',
    ],
    hasMap: 'https://www.google.com/maps?q=3.8667,11.5050',
    numberOfItems: '85000+',
    serviceArea: {
      '@type': 'Place',
      name: 'Cameroun'
    }
  };
}

// ─── FONCTION POUR OBTENIR L'URL DE L'IMAGE ─────────────────────
// ─── FONCTION POUR OBTENIR L'URL DE L'IMAGE ─────────────────────
function getImageUrl(article) {
  if (!article) return null;

  const normalizeUrl = (value) => {
    if (!value) return null;

    // Si le backend renvoie une ancienne URL localhost,
    // on conserve uniquement le chemin /media/...
    if (
      value.startsWith('http://localhost:8000') ||
      value.startsWith('https://localhost:8000') ||
      value.startsWith('http://127.0.0.1:8000') ||
      value.startsWith('https://127.0.0.1:8000')
    ) {
      try {
        value = new URL(value).pathname;
      } catch {
        return null;
      }
    }

    // Les URLs externes réelles sont conservées
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Déjà un chemin média correct
    if (value.startsWith('/media/')) {
      return value;
    }

    // Chemin du type news_images/xxx.jpg
    if (value.startsWith('news_images/')) {
      return `/media/${value}`;
    }

    // Normalisation générale
    if (!value.startsWith('/')) {
      value = `/${value}`;
    }

    if (!value.startsWith('/media/')) {
      value = `/media${value}`;
    }

    return value;
  };

  return (
    normalizeUrl(article.image_display) ||
    normalizeUrl(article.image) ||
    normalizeUrl(article.image_url) ||
    null
  );
}
// ═══════════════════════════════════════════════════════════════════
// ─── UTILITAIRE : EXTRAIRE LES ARTICLES DE LA RÉPONSE API ────────
// ✅ Gère plusieurs formats de réponse : {results:[...]}, [...], {data:[...]}
// ═══════════════════════════════════════════════════════════════════
function extractArticlesFromResponse(response) {
  if (!response) return [];

  const data = response.data;

  // Format 1 : tableau direct
  if (Array.isArray(data)) {
    return data;
  }

  // Format 2 : { results: [...] } (DRF pagination)
  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  // Format 3 : { data: [...] }
  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  // Format 4 : { articles: [...] }
  if (data && Array.isArray(data.articles)) {
    return data.articles;
  }

  return [];
}

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANT FLASH INFO ─────────────────────────────────────────
// ✅ Affiche les articles de type "Informations" / "Annonces" en défilant
// ═══════════════════════════════════════════════════════════════════
function FlashInfo({ articles }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  // ✅ Filtrer les articles d'information (catégorie Informations, Annonces, ou is_event)
  const infoArticles = (articles || []).filter(a => {
    if (!a) return false;
    if (a.is_published === false) return false;

    const cat = (a.category || '').toLowerCase();
    return (
      cat === 'informations' ||
      cat === 'annonces' ||
      cat === 'annonce' ||
      cat === 'information' ||
      a.is_event === true ||
      a.is_announcement === true
    );
  });

  // Si on a des articles d'info → les afficher
  // Sinon → utiliser les flashs par défaut
  const flashMessages = infoArticles.length > 0
    ? infoArticles.map(a => {
        const prefix = a.is_event ? '📅' : '📢';
        return `${prefix} ${a.title}`;
      })
    : DEFAULT_FLASH;

  // Dupliquer pour un défilement infini
  const items = [...flashMessages, ...flashMessages];

  return (
    <div className="marquee-wrap" role="complementary" aria-label={isEnglish ? 'Flash information' : 'Informations flash'}>
      <span className="marquee-label" aria-hidden="true">INFO</span>
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── WIDGET ACTUALITÉS HERO ──────────────────────────────────────
// ✅ Affiche les articles récents avec carousel automatique
// ═══════════════════════════════════════════════════════════════════
function HeroNewsWidget({ articles, loading }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState({});
  const intervalRef = useRef(null);

  // ✅ On garde TOUS les articles du backend, triés par date
  const finalItems = Array.isArray(articles)
    ? [...articles]
        .filter(a => a && a.is_published !== false)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    : [];

  // ✅ Debug pour tracer les données
  useEffect(() => {
    if (articles) {
      console.log('🔍 HeroNewsWidget — articles reçus:', articles.length);
      console.log('🔍 HeroNewsWidget — finalItems:', finalItems.length);
      if (finalItems.length > 0) {
        console.log('🔍 Premier article:', finalItems[0].title);
      }
    }
  }, [articles, finalItems.length]);

  useEffect(() => {
    if (!isPaused && finalItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % finalItems.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, finalItems.length]);

  // Reset index si les articles changent
  useEffect(() => {
    setCurrentIndex(0);
  }, [finalItems.length]);

  const goTo = (index) => {
    setCurrentIndex(index);
    clearInterval(intervalRef.current);
    if (!isPaused && finalItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % finalItems.length);
      }, 5000);
    }
  };

  // ─── ÉTAT 1 : CHARGEMENT ───────────────────────────────────────
  if (loading) {
    return (
      <div className="hero-widget" role="status" aria-label={isEnglish ? 'Loading news' : 'Chargement des actualités'}>
        <div className="hero-widget-header">
          <div className="hero-widget-title">
            <span aria-hidden="true">📰</span>
            <div>
              <span>{isEnglish ? 'News' : 'Actualités'}</span>
              <span>{isEnglish ? 'Loading…' : 'Chargement…'}</span>
            </div>
          </div>
        </div>
        <div className="hero-widget-image">
          <div className="hero-widget-image-skeleton" />
        </div>
        <div className="hero-widget-content">
          <div style={{ height: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 4, width: '80%' }} />
        </div>
      </div>
    );
  }

  // ─── ÉTAT 2 : AUCUN ARTICLE ────────────────────────────────────
  if (finalItems.length === 0) {
    return (
      <div className="hero-widget-empty" role="status" aria-label={isEnglish ? 'No news available' : 'Aucune actualité disponible'}>
        <Bell size={32} color="rgba(255,255,255,0.3)" aria-hidden="true" />
        <p>{isEnglish ? 'No news available' : 'Aucune actualité disponible'}</p>
        <Link
          to="/actualites"
          style={{
            color: 'var(--or)',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {isEnglish ? 'Go to news' : 'Voir les actualités'} <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  // ─── ÉTAT 3 : ARTICLES DISPONIBLES ─────────────────────────────
  const current = finalItems[currentIndex] ?? finalItems[0];
  if (!current) return null;

  const imageUrl = getImageUrl(current);
  const hasImage = imageUrl && !imageErrors[current.id];
  const isImageLoaded = imagesLoaded[current.id];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBadgeColor = (item) => {
    if (item.is_event) return { bg: 'rgba(245,158,11,0.25)', color: '#F59E0B' };
    if (item.category === 'Informations') return { bg: 'rgba(59,130,246,0.25)', color: '#3b82f6' };
    if (item.category === 'Acquisitions') return { bg: 'rgba(16,185,129,0.25)', color: '#10B981' };
    if (item.category === 'Formation') return { bg: 'rgba(139,92,246,0.25)', color: '#8b5cf6' };
    if (item.category === 'Services') return { bg: 'rgba(20,184,166,0.25)', color: '#14b8a6' };
    return { bg: 'rgba(148,163,184,0.25)', color: '#94a3b8' };
  };

  const getCategoryIcon = (item) => {
    if (item.is_event) return '📅';
    if (item.category === 'Informations') return 'ℹ️';
    if (item.category === 'Acquisitions') return '📚';
    if (item.category === 'Formation') return '🎓';
    if (item.category === 'Services') return '🛠️';
    return '📰';
  };

  return (
    <div
      className="hero-widget"
      role="article"
      aria-label={isEnglish ? 'Library news' : 'Actualités de la bibliothèque'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-widget-header">
        <div className="hero-widget-title">
          <span aria-hidden="true">📰</span>
          <div>
            <span>{isEnglish ? 'News' : 'Actualités'}</span>
            <span>{finalItems.length} {isEnglish ? 'articles' : 'articles'}</span>
          </div>
        </div>
        <Link to="/actualites" className="hero-widget-link" title={isEnglish ? 'View all news' : 'Voir toutes les actualités'}>
          {isEnglish ? 'View all' : 'Voir tout'} <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="hero-widget-image">
        {hasImage ? (
          <>
            {!isImageLoaded && <div className="hero-widget-image-skeleton" role="status" aria-label={isEnglish ? 'Loading image' : "Chargement de l'image"} />}
            <img
              src={imageUrl}
              alt={`${isEnglish ? 'Illustration:' : 'Illustration :'} ${current.title}`}
              loading="lazy"
              onLoad={() => setImagesLoaded(prev => ({ ...prev, [current.id]: true }))}
              onError={() => {
                console.error('❌ Erreur chargement image:', imageUrl);
                setImageErrors(prev => ({ ...prev, [current.id]: true }));
              }}
            />
          </>
        ) : (
          <div className="hero-widget-image-placeholder" aria-hidden="true">
            {current.is_event ? '📅' : '📰'}
          </div>
        )}
      </div>

      <div className="hero-widget-content">
        <div className="hero-widget-meta">
          <span className="hero-widget-badge" style={getBadgeColor(current)}>
            {getCategoryIcon(current)} {current.is_event ? (isEnglish ? 'Event' : 'Événement') : current.category || (isEnglish ? 'News' : 'Actualité')}
          </span>
          <span className="hero-widget-date">
            <Clock size={10} aria-hidden="true" />
            {formatDate(current.created_at)}
          </span>
        </div>

        <h4 className="hero-widget-title-text">{current.title}</h4>
        <p className="hero-widget-desc">
          {current.content?.substring(0, 80).replace(/\*\*/g, '')}…
        </p>

        <Link
          to={`/actualites/${current.id}`}
          className="hero-widget-read-more"
          title={`${isEnglish ? 'Read article:' : "Lire l'article :"} ${current.title}`}
        >
          {isEnglish ? 'Read more' : 'Lire la suite'} <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="hero-widget-pagination" role="tablist" aria-label={isEnglish ? 'News navigation' : 'Navigation des actualités'}>
        <button
          onClick={() => goTo((currentIndex - 1 + finalItems.length) % finalItems.length)}
          aria-label={isEnglish ? 'Previous news' : 'Actualité précédente'}
          type="button"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        {finalItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={idx === currentIndex ? 'active' : ''}
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`${isEnglish ? 'News' : 'Actualité'} ${idx + 1} ${isEnglish ? 'of' : 'sur'} ${finalItems.length}`}
            type="button"
          />
        ))}
        <button
          onClick={() => goTo((currentIndex + 1) % finalItems.length)}
          aria-label={isEnglish ? 'Next news' : 'Actualité suivante'}
          type="button"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── COMPOSANT HORAIRES SUR LE HERO ────────────────────────────
function HeroHoursWidget() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

const hours = [ { day: isEnglish ? 'Monday' : 'Lundi', hours: '12h00 – 22h00', icon: '📖' }, { day: isEnglish ? 'Tuesday – Friday' : 'Mardi – Vendredi', hours: '09h00 – 22h00', icon: '📚' }, { day: isEnglish ? 'Saturday' : 'Samedi', hours: '10h00 – 16h00', icon: '📚' }, { day: isEnglish ? 'Sunday' : 'Dimanche', hours: isEnglish ? 'Closed' : 'Fermé', icon: '🔒' }, ];

  return (
    <div
      className="hours-widget"
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 16,
        padding: '18px 20px',
        border: '1px solid rgba(255,255,255,0.12)',
        height: '100%',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column'
      }}
      role="complementary"
      aria-label={isEnglish ? 'Library opening hours' : "Horaires d'ouverture de la bibliothèque"}
    >
      <div className="hours-header" style={{ marginBottom: 12, flexShrink: 0 }}>
        <div className="hours-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="hours-icon-circle" style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--or)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={15} color="white" />
          </div>
          <span className="hours-title-text" style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>
            {isEnglish ? 'Opening hours' : "Horaires d'ouverture"}
          </span>
        </div>
      </div>

      <div className="hours-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {hours.map((item, idx) => (
          <div
            key={idx}
            className="hours-item"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 0',
              borderBottom: idx < hours.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}
          >
            <span className="hours-day" style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span aria-hidden="true">{item.icon}</span>
              {item.day}
            </span>
            <span
              className={`hours-time ${(item.day === 'Dimanche' || item.day === 'Sunday') ? 'closed' : ''}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: (item.day === 'Dimanche' || item.day === 'Sunday') ? 'rgba(255,255,255,0.4)' : 'white'
              }}
            >
              {item.hours}
            </span>
          </div>
        ))}
      </div>

      <div className="hours-location" style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        flexShrink: 0,
        letterSpacing: '0.04em'
      }}>
        📍 {isEnglish ? 'University of Yaoundé I Campus' : "Campus de l'Université de Yaoundé I"}
      </div>
    </div>
  );
}

// ─── HOOK COMPTEUR ANIMÉ ─────────────────────────────────────────
function useCounter(target, duration = 2000, started) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(Math.floor(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
}

function StatCard({ value, label, suffix, icon, started }) {
  const count = useCounter(value, 1800, started);
  return (
    <div className="stat-card" style={{ textAlign: 'center' }}>
      <div className="stat-card-icon" style={{
        margin: '0 auto 12px',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(124,58,237,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--or)'
      }}>
        {icon}
      </div>
      <div className="stat-card-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--or)', lineHeight: 1 }}>
        {count.toLocaleString('fr-FR')}{suffix}
      </div>
      <div className="stat-card-label" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── HERO SECTION ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
function HeroSection({ onSearch, searchValue, setSearchValue, articles, loading }) {
  const [advancedOpen, setAdv] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const navigate = useNavigate();

  const { language } = useLanguage();
  const isEnglish = language === 'en';

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      setIsSmallMobile(w <= 380);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/catalogue?q=${encodeURIComponent(searchValue.trim())}`);
    onSearch?.(searchValue);
  };

  const heroTitle = isEnglish ? 'Central Library' : 'Bibliothèque';
  const heroHighlight = isEnglish ? 'University of Yaoundé I' : 'Université de Yaoundé I';
  const heroSubtitle = isEnglish
    ? 'Your gateway to knowledge: catalog, theses, digital resources and institutional repository serving the scientific community.'
    : 'Votre porte d\'entrée vers le savoir : catalogue, thèses, ressources numériques et dépôt institutionnel au service de la communauté scientifique.';
  const heroSubtitleMobile = isEnglish
    ? 'Catalog, theses, digital resources and institutional repository.'
    : 'Catalogue, thèses, ressources numériques et dépôt institutionnel.';

  return (
    <header className="hero" role="banner">
      {/* Image de fond */}
      <div className="hero-background">
        <img
          src={heroBg}
          alt={isEnglish ? 'Central University Library of Yaoundé I - Aerial view' : 'Bibliothèque Centrale Universitaire de Yaoundé I - Vue aérienne'}
          className="hero-bg-image"
          loading="eager"
        />
        <div className="hero-overlay-light"></div>
      </div>

      <div className="container hero-content">
        <div className="hero-main-grid">
          <div className="hero-left">
            <div className="hero-text-container">
              <Reveal className="reveal-up">
                <div className="hero-badge">
                  <Sparkles size={isMobile ? 11 : 14} aria-hidden="true" />
                  {isSmallMobile
                    ? 'UYI • 1962'
                    : isMobile
                      ? 'UNIV. YAOUNDÉ I • 1962'
                      : (isEnglish ? 'UNIVERSITY OF YAOUNDÉ I — SINCE 1962' : 'UNIVERSITÉ DE YAOUNDÉ I — DEPUIS 1962')}
                </div>

                <h1 className="font-serif hero-title">
                  {isMobile ? (
                    <>
                      {heroTitle}<br />
                      {isEnglish ? ' ' : 'Centrale'}<br />
                    </>
                  ) : (
                    <>{heroTitle} {isEnglish ? '' : 'Centrale'}<br /></>
                  )}
                  <span className="hero-title-highlight">
                    {isMobile ? 'UYI' : heroHighlight}
                  </span>
                </h1>

                {!isMobile && (
                  <p className="hero-subtitle">{heroSubtitle}</p>
                )}

                {isMobile && (
                  <p className="hero-subtitle-mobile">{heroSubtitleMobile}</p>
                )}

                <form onSubmit={handleSearch} className="hero-search-form" role="search" aria-label={isEnglish ? 'Search the catalog' : 'Recherche dans le catalogue'}>
                  <div className="search-bar hero-search-bar">
                    <div className="search-bar-input">
                      <Search size={isMobile ? 16 : 20} color="var(--texte-muted)" aria-hidden="true" />
                      <input
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder={isMobile
                          ? (isEnglish ? 'Search...' : 'Rechercher...')
                          : (isEnglish ? 'Title, author, ISBN, subject, keyword…' : 'Titre, auteur, ISBN, sujet, mot-clé…')}
                        aria-label={isEnglish ? 'Search the catalog' : 'Rechercher dans le catalogue'}
                        type="search"
                      />
                    </div>
                    <button type="submit" className="search-bar-btn" aria-label={isEnglish ? 'Search' : 'Lancer la recherche'}>
                      <Search size={isMobile ? 15 : 18} aria-hidden="true" />
                      {!isMobile && (isEnglish ? 'Search' : 'Rechercher')}
                    </button>
                  </div>
                </form>

                <div className="hero-actions">
                  <button
                    onClick={() => setAdv(v => !v)}
                    className="hero-advanced-btn"
                    aria-expanded={advancedOpen}
                    aria-controls="advanced-search"
                    type="button"
                  >
                    <SlidersHorizontal size={isMobile ? 11 : 14} aria-hidden="true" />
                    {isSmallMobile
                      ? (advancedOpen ? (isEnglish ? 'Hide' : 'Masquer') : (isEnglish ? 'Advanced' : 'Avancée'))
                      : isMobile
                        ? (advancedOpen ? (isEnglish ? 'Hide' : 'Masquer') : (isEnglish ? 'Advanced' : 'Avancée'))
                        : (advancedOpen
                            ? (isEnglish ? 'Hide advanced search' : 'Masquer la recherche avancée')
                            : (isEnglish ? 'Show advanced search' : 'Afficher la recherche avancée'))}
                  </button>

                  <div className="hero-quick-links">
                    <Link to="/catalogue" className="hero-quick-link" title={isEnglish ? 'Access the OPAC catalog' : 'Accéder au catalogue OPAC'}>OPAC</Link>
                    <Link to="/archives" className="hero-quick-link" title={isEnglish ? 'Consult theses' : 'Consulter les thèses'}>{isEnglish ? 'Theses' : 'Thèses'}</Link>
                    <Link to="/ressources/electroniques" className="hero-quick-link" title={isEnglish ? 'Access Research4Life' : 'Accéder à Research4Life'}>R4L</Link>
                  </div>
                </div>

                {advancedOpen && (
                  <div className="hero-advanced-search" id="advanced-search" role="search" aria-label={isEnglish ? 'Advanced search' : 'Recherche avancée'}>
                    {[
                      { key: 'auteur', label: isEnglish ? 'Author' : 'Auteur', placeholder: isEnglish ? 'Name' : 'Nom' },
                      { key: 'isbn', label: 'ISBN', placeholder: '978-2-1234' },
                      { key: 'sujet', label: isEnglish ? 'Subject' : 'Sujet', placeholder: isEnglish ? 'AI' : 'IA' },
                      { key: 'editeur', label: isEnglish ? 'Publisher' : 'Éditeur', placeholder: isEnglish ? 'Presses' : 'Presses' },
                    ].map(f => (
                      <div key={f.key}>
                        <label htmlFor={`adv-${f.key}`}>{f.label}</label>
                        <input id={`adv-${f.key}`} className="form-input" placeholder={f.placeholder} />
                      </div>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>
          </div>

          {!isMobile && (
            <div className="hero-right">
              <Reveal className="reveal-up reveal-delay-1">
                <HeroNewsWidget articles={articles} loading={loading} />
              </Reveal>
              <Reveal className="reveal-up reveal-delay-2">
                <HeroHoursWidget />
              </Reveal>
            </div>
          )}
        </div>

        {isMobile && (
          <div className="hero-widgets-mobile">
            <Reveal className="reveal-up">
              <HeroNewsWidget articles={articles} loading={loading} />
            </Reveal>
            <Reveal className="reveal-up">
              <HeroHoursWidget />
            </Reveal>
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="hero-scroll-indicator" aria-hidden="true">
          <span>{isEnglish ? 'Discover' : 'Découvrir'}</span>
          <ChevronRight size={18} />
        </div>
      )}

      <style>{`
        /* ═══════════════════════════════════════════════════════════════
           HERO — BASE
           ═══════════════════════════════════════════════════════════════ */
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .hero-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          display: block;
          filter: brightness(0.85) saturate(1.05);
        }

        .hero-overlay-light {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(15, 10, 42, 0.55) 0%,
            rgba(27, 20, 100, 0.35) 50%,
            rgba(27, 20, 100, 0.15) 100%
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 40px 24px 60px;
        }

        .hero-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hero-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
        }

        .hero-text-container {
          padding: 28px 32px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.30);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.20);
          transition: all 0.3s ease;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 58, 237, 0.25);
          border: 1px solid rgba(124, 58, 237, 0.35);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 18px;
          border-radius: 50px;
          letter-spacing: 0.08em;
          backdrop-filter: blur(4px);
          width: fit-content;
          margin-bottom: 8px;
        }

        .hero-title {
          font-size: clamp(38px, 5.5vw, 64px);
          color: white;
          font-weight: 400;
          line-height: 1.1;
          margin-bottom: 8px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
        }

        .hero-title-highlight {
          color: var(--or);
          position: relative;
          display: inline-block;
        }

        .hero-title-highlight::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--or), transparent);
          border-radius: 2px;
        }

        .hero-subtitle {
          font-size: clamp(15px, 1.5vw, 18px);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.8;
          margin-bottom: 12px;
          max-width: 600px;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.30);
        }

        .hero-subtitle-mobile {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin-bottom: 14px;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.30);
        }

        .hero-search-form {
          width: 100%;
          max-width: 640px;
        }

        .hero-search-bar {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          padding: 4px;
          border-radius: 60px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .search-bar-input {
          display: flex;
          align-items: center;
          flex: 1;
          padding: 0 8px 0 18px;
          gap: 10px;
        }

        .search-bar-input input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          background: transparent;
          color: var(--texte);
          padding: 12px 0;
          min-width: 0;
        }

        .search-bar-input input::placeholder {
          color: var(--texte-light);
        }

        .search-bar-btn {
          background: linear-gradient(135deg, var(--or), var(--or-dark));
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .search-bar-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 28px rgba(124, 58, 237, 0.35);
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .hero-advanced-btn {
          color: rgba(255, 255, 255, 0.95);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.25);
          padding: 7px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.25s ease;
          cursor: pointer;
          backdrop-filter: blur(4px);
          font-family: inherit;
        }

        .hero-advanced-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .hero-quick-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hero-quick-link {
          background: rgba(0, 0, 0, 0.20);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.95);
          padding: 7px 16px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          transition: all 0.25s ease;
          text-decoration: none;
        }

        .hero-quick-link:hover {
          background: rgba(124, 58, 237, 0.35);
          border-color: rgba(124, 58, 237, 0.45);
          color: white;
          transform: translateY(-2px);
        }

        .hero-advanced-search {
          margin-top: 14px;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 16px;
          padding: 18px 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .hero-advanced-search label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.70);
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hero-advanced-search input {
          background: rgba(255, 255, 255, 0.95);
          font-size: 13px;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          width: 100%;
          transition: all 0.2s;
          font-family: inherit;
        }

        .hero-advanced-search input:focus {
          outline: 2px solid var(--or);
        }

        /* ═══════════════════════════════════════════════════════════════
           WIDGETS HERO
           ═══════════════════════════════════════════════════════════════ */
        .hero-widget {
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 20px 22px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          height: 100%;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .hero-widget:hover {
          background: rgba(0, 0, 0, 0.55);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }

        .hero-widget-empty {
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
        }

        .hero-widget-empty p {
          color: rgba(255, 255, 255, 0.60);
          font-size: 13px;
        }

        .hero-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-shrink: 0;
        }

        .hero-widget-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-widget-title > span:first-child {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--or);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .hero-widget-title div {
          display: flex;
          flex-direction: column;
        }

        .hero-widget-title div span:first-child {
          color: white;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .hero-widget-title div span:last-child {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.50);
          margin-top: -2px;
        }

        .hero-widget-link {
          color: rgba(255, 255, 255, 0.60);
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.25s ease;
          text-decoration: none;
        }

        .hero-widget-link:hover {
          color: white;
        }

        .hero-widget-image {
          width: 100%;
          height: 110px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 14px;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.35);
          position: relative;
        }

        .hero-widget-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .hero-widget-image-skeleton {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .hero-widget-image-skeleton::after {
          content: '';
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--or);
          animation: spin 0.8s linear infinite;
        }

        .hero-widget-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: rgba(255, 255, 255, 0.15);
        }

        .hero-widget-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          animation: fadeSlide 0.5s ease;
        }

        .hero-widget-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .hero-widget-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 12px;
          border-radius: 50px;
          font-size: 9px;
          font-weight: 600;
        }

        .hero-widget-date {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.50);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hero-widget-title-text {
          font-size: 14px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-widget-desc {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .hero-widget-read-more {
          color: var(--or);
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.25s ease;
          text-decoration: none;
          align-self: flex-start;
        }

        .hero-widget-read-more:hover {
          gap: 10px;
        }

        .hero-widget-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          flex-shrink: 0;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero-widget-pagination button {
          color: rgba(255, 255, 255, 0.40);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: color 0.25s ease;
          display: flex;
          align-items: center;
        }

        .hero-widget-pagination button:hover {
          color: white;
        }

        .hero-widget-pagination button:not(:first-child):not(:last-child) {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.20);
          padding: 0;
          transition: all 0.3s ease;
        }

        .hero-widget-pagination button.active {
          width: 24px;
          background: var(--or);
          border-radius: 4px;
        }

        .hero-widget-pagination button:not(:first-child):not(:last-child):hover {
          background: rgba(255, 255, 255, 0.35);
        }

        .hours-widget {
          min-height: 160px;
        }

        .hours-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hours-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--or);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hours-title-text {
          color: white;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .hours-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 2px 0;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }

        .hours-day {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hours-time {
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .hours-time.closed {
          color: rgba(255, 255, 255, 0.4);
        }

        .hero-scroll-indicator {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.5;
          animation: bounce 2s infinite;
          z-index: 3;
        }

        .hero-scroll-indicator span {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.50);
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }

        .hero-scroll-indicator svg {
          transform: rotate(90deg);
          color: rgba(255, 255, 255, 0.30);
        }

        .hero-widgets-mobile {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }

        @media (max-width: 1024px) {
          .hero-main-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hero-right {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 0;
          }
          .hero-widget {
            min-height: 220px;
          }
          .hero-text-container {
            padding: 24px 26px;
          }
          .hero-content {
            padding: 32px 20px 48px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: auto;
            padding: 12px 0 28px;
          }

          .hero-overlay-light {
            background: linear-gradient(
              180deg,
              rgba(15, 10, 42, 0.65) 0%,
              rgba(27, 20, 100, 0.50) 60%,
              rgba(27, 20, 100, 0.35) 100%
            );
          }

          .hero-content {
            padding: 16px 14px 28px;
          }

          .hero-main-grid {
            gap: 14px;
          }

          .hero-left {
            gap: 10px;
          }

          .hero-text-container {
            padding: 18px 18px;
            border-radius: 16px;
            background: rgba(0, 0, 0, 0.40);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .hero-badge {
            font-size: 10px;
            padding: 5px 12px;
            margin-bottom: 6px;
          }

          .hero-title {
            font-size: clamp(26px, 8vw, 34px);
            line-height: 1.15;
            margin-bottom: 6px;
          }

          .hero-title-highlight::after {
            height: 2px;
            bottom: -2px;
          }

          .hero-subtitle-mobile {
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 12px;
          }

          .hero-search-bar {
            padding: 4px;
            border-radius: 14px;
            flex-direction: column;
            background: white;
            gap: 0;
          }

          .search-bar-input {
            padding: 6px 12px;
            width: 100%;
          }

          .search-bar-input input {
            font-size: 14px;
            padding: 8px 0;
          }

          .search-bar-btn {
            width: 100%;
            border-radius: 10px;
            justify-content: center;
            padding: 10px 14px;
            font-size: 13px;
          }

          .hero-actions {
            gap: 6px;
            margin-top: 10px;
          }

          .hero-advanced-btn {
            font-size: 11px;
            padding: 5px 12px;
          }

          .hero-quick-link {
            font-size: 10px;
            padding: 5px 12px;
          }

          .hero-advanced-search {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 14px 14px;
            margin-top: 10px;
          }

          .hero-advanced-search input {
            font-size: 12px;
            padding: 7px 10px;
          }

          .hero-right {
            display: none;
          }

          .hero-widgets-mobile {
            margin-top: 16px;
          }

          .hero-widget {
            min-height: 190px;
            padding: 16px 16px;
            border-radius: 14px;
          }

          .hero-widget-image {
            height: 100px;
            margin-bottom: 12px;
          }

          .hero-widget-title-text {
            font-size: 13px;
          }

          .hero-widget-desc {
            font-size: 11px;
          }

          .hero-widget-header {
            margin-bottom: 12px;
          }

          .hero-widget-title > span:first-child {
            width: 30px;
            height: 30px;
            font-size: 13px;
          }

          .hero-widget-title div span:first-child {
            font-size: 12px;
          }

          .hero-widget-title div span:last-child {
            font-size: 9px;
          }

          .hero-widget-link {
            font-size: 11px;
          }

          .hero-widget-pagination {
            margin-top: 10px;
            padding-top: 8px;
            gap: 6px;
          }

          .hero-widget-read-more {
            font-size: 11px;
          }

          .hero-scroll-indicator {
            display: none;
          }

          .hours-widget {
            min-height: 140px;
            padding: 16px 16px;
            border-radius: 14px;
          }

          .hours-header {
            margin-bottom: 10px;
          }

          .hours-icon-circle {
            width: 28px;
            height: 28px;
          }

          .hours-icon-circle svg {
            width: 13px;
            height: 13px;
          }

          .hours-title-text {
            font-size: 12px;
          }

          .hours-item {
            padding: 4px 0;
          }

          .hours-day {
            font-size: 12px;
            gap: 6px;
          }

          .hours-time {
            font-size: 12px;
          }

          .hours-location {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 8px 0 24px;
          }

          .hero-content {
            padding: 12px 12px 24px;
          }

          .hero-text-container {
            padding: 16px 14px;
            border-radius: 14px;
            background: rgba(0, 0, 0, 0.45);
          }

          .hero-badge {
            font-size: 9px;
            padding: 4px 10px;
            gap: 6px;
          }

          .hero-title {
            font-size: clamp(24px, 7.5vw, 30px);
            line-height: 1.18;
          }

          .hero-subtitle-mobile {
            font-size: 12px;
            margin-bottom: 10px;
          }

          .hero-search-bar {
            border-radius: 12px;
          }

          .search-bar-input {
            padding: 4px 10px;
            gap: 8px;
          }

          .search-bar-input input {
            font-size: 13px;
            padding: 8px 0;
          }

          .search-bar-btn {
            padding: 9px 12px;
            font-size: 12px;
            border-radius: 8px;
          }

          .hero-actions {
            gap: 5px;
            margin-top: 8px;
          }

          .hero-advanced-btn {
            font-size: 10px;
            padding: 4px 10px;
            gap: 4px;
          }

          .hero-quick-links {
            gap: 4px;
          }

          .hero-quick-link {
            font-size: 9px;
            padding: 4px 10px;
          }

          .hero-advanced-search {
            grid-template-columns: 1fr;
            padding: 12px 12px;
            gap: 8px;
          }

          .hero-advanced-search label {
            font-size: 9px;
          }

          .hero-advanced-search input {
            font-size: 12px;
            padding: 7px 10px;
          }

          .hero-widgets-mobile {
            margin-top: 14px;
            gap: 12px;
          }

          .hero-widget {
            min-height: 170px;
            padding: 14px 14px;
            border-radius: 12px;
          }

          .hero-widget-image {
            height: 90px;
            border-radius: 8px;
          }

          .hero-widget-title-text {
            font-size: 12.5px;
            line-height: 1.25;
          }

          .hero-widget-desc {
            font-size: 10.5px;
            line-height: 1.4;
          }

          .hero-widget-title > span:first-child {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .hero-widget-title div span:first-child {
            font-size: 11.5px;
          }

          .hero-widget-title div span:last-child {
            font-size: 8.5px;
          }

          .hero-widget-badge {
            font-size: 8.5px;
            padding: 2px 10px;
          }

          .hero-widget-date {
            font-size: 8.5px;
          }

          .hero-widget-pagination button:not(:first-child):not(:last-child) {
            width: 7px;
            height: 7px;
          }

          .hero-widget-pagination button.active {
            width: 20px;
          }

          .hero-widget-read-more {
            font-size: 10.5px;
          }

          .hours-widget {
            padding: 14px 14px;
            border-radius: 12px;
          }

          .hours-icon-circle {
            width: 26px;
            height: 26px;
          }

          .hours-title-text {
            font-size: 11.5px;
          }

          .hours-day {
            font-size: 11px;
            gap: 5px;
          }

          .hours-time {
            font-size: 11px;
          }

          .hours-location {
            font-size: 9px;
          }
        }

        @media (max-width: 360px) {
          .hero-content {
            padding: 10px 10px 20px;
          }

          .hero-text-container {
            padding: 14px 12px;
            border-radius: 12px;
          }

          .hero-badge {
            font-size: 8px;
            padding: 4px 8px;
            gap: 4px;
          }

          .hero-title {
            font-size: clamp(22px, 7vw, 26px);
            line-height: 1.2;
          }

          .hero-subtitle-mobile {
            font-size: 11px;
          }

          .hero-search-bar {
            border-radius: 10px;
          }

          .search-bar-input input {
            font-size: 12px;
            padding: 7px 0;
          }

          .search-bar-btn {
            padding: 8px 10px;
            font-size: 11px;
          }

          .hero-advanced-btn {
            font-size: 9.5px;
            padding: 4px 8px;
          }

          .hero-quick-link {
            font-size: 8.5px;
            padding: 3px 8px;
          }

          .hero-widget {
            padding: 12px 12px;
            border-radius: 10px;
          }

          .hero-widget-image {
            height: 80px;
            border-radius: 6px;
          }

          .hero-widget-title-text {
            font-size: 11.5px;
          }

          .hero-widget-desc {
            font-size: 10px;
          }

          .hero-widget-title div span:first-child {
            font-size: 11px;
          }

          .hours-day {
            font-size: 10.5px;
          }

          .hours-time {
            font-size: 10.5px;
          }

          .hours-title-text {
            font-size: 11px;
          }
        }
      `}</style>
    </header>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────
export default function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const [articles, setArticles] = useState([]);
  const [statsStarted, setStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  // ═══════════════════════════════════════════════════════════════
  // ✅ CHARGEMENT DES ARTICLES DEPUIS LE BACKEND
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        console.log('🔄 Chargement des articles depuis l\'API...');
        const response = await getArticles({ limit: 10 });

        // ✅ Utilisation de la fonction utilitaire pour extraire les articles
        const data = extractArticlesFromResponse(response);

        console.log('✅ Articles chargés pour la home:', data.length);
        if (data.length > 0) {
          console.log('📰 Premier article:', data[0]?.title);
          console.log('📰 Catégories:', data.map(a => a.category).join(', '));
        } else {
          console.warn('⚠️ Aucun article trouvé dans la réponse API');
        }

        setArticles(data);
      } catch (error) {
        console.error('❌ Erreur chargement actualités:', error);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        }
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStats(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (value) => {
    if (!value.trim()) return;
    navigate(`/catalogue?q=${encodeURIComponent(value.trim())}`);
  };

  const jsonLd = getJsonLd();

  return (
    <>
      {/* ─── SEO HELMET ──────────────────────────────────────────── */}
      <Helmet>
        <html lang={isEnglish ? 'en' : 'fr-CM'} />
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords} />
        <meta name="author" content={SEO.author} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="canonical" href={SEO.url} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SEO.url} />
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:image" content={SEO.image} />
        <meta property="og:site_name" content={SEO.siteName} />
        <meta property="og:locale" content={isEnglish ? 'en_US' : 'fr_FR'} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SEO.url} />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.description} />
        <meta name="twitter:image" content={SEO.image} />
        <meta name="twitter:site" content={SEO.twitterHandle} />

        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Layout>
        <main role="main">
          {/* ✅ Flash infos avec les vrais articles du backend */}
          <FlashInfo articles={articles} />

          <HeroSection
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onSearch={handleSearch}
            articles={articles}
            loading={loading}
          />

          {/* Accès rapides */}
          <section
            style={{
              background: 'white',
              borderBottom: '1px solid var(--border)',
              padding: '0 0 48px'
            }}
            aria-labelledby="quick-access-title"
          >
            <div className="container">
              <Reveal className="reveal-up">
                <h2 id="quick-access-title" style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  border: 0
                }}>
                  {isEnglish ? 'Quick access' : 'Accès rapides'}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 16,
                  transform: 'translateY(-32px)',
                  marginBottom: '-32px'
                }}>
                  {QUICK_ACCESS.map(item => {
                    const label = isEnglish ? item.labelEn : item.labelFr;
                    const desc = isEnglish ? item.descEn : item.descFr;
                    const ariaLabel = isEnglish ? item.ariaLabelEn : item.ariaLabelFr;
                    return item.href.startsWith('http') ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: 24,
                          transition: 'all 0.3s',
                          position: 'relative',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow)';
                        }}
                        aria-label={ariaLabel}
                        title={ariaLabel}
                      >
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: item.gradient || item.color,
                          opacity: 0.9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          marginBottom: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} aria-hidden="true">
                          {item.icon}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--texte-muted)', flex: 1 }}>{desc}</div>
                        <div style={{
                          marginTop: 12,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {isEnglish ? 'Open' : 'Accéder'} <ArrowRight size={14} aria-hidden="true" />
                        </div>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: 24,
                          transition: 'all 0.3s',
                          position: 'relative',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow)';
                        }}
                        aria-label={ariaLabel}
                        title={ariaLabel}
                      >
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: item.gradient || item.color,
                          opacity: 0.9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          marginBottom: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} aria-hidden="true">
                          {item.icon}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--texte-muted)', flex: 1 }}>{desc}</div>
                        <div style={{
                          marginTop: 12,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {isEnglish ? 'Open' : 'Accéder'} <ArrowRight size={14} aria-hidden="true" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Reveal>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <a
                  href={PMB_OPAC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(27,20,100,0.04)',
                    borderColor: 'var(--border)'
                  }}
                >
                  {isEnglish ? 'Open the catalog' : 'Ouvrir le catalogue'} <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* Services */}
          <section
            className="section"
            style={{ background: 'var(--beige)' }}
            aria-labelledby="services-title"
          >
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ color: 'var(--or)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {isEnglish ? 'Our services' : 'Nos services'}
                  </div>
                  <h2 id="services-title" className="font-serif" style={{ fontSize: 36, fontWeight: 400, color: 'var(--bleu-nuit)' }}>
                    {isEnglish ? 'At your service' : 'À votre disposition'}
                  </h2>
                </div>
                <Link to="/services/consultation" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }} title={isEnglish ? 'View all services' : 'Voir tous les services'}>
                  {isEnglish ? 'View all' : 'Voir tous'} <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>

              <Reveal className="reveal-scale">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 16
                }}>
                  {SERVICES.map(s => (
                    <Link
                      key={s.href}
                      to={s.href}
                      style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: '24px 16px',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        display: 'block',
                        position: 'relative',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.borderColor = 'var(--or)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      aria-label={`Service : ${isEnglish ? s.labelEn : s.labelFr}`}
                      title={`Service : ${isEnglish ? s.labelEn : s.labelFr}`}
                    >
                      <div className="service-icon" style={{
                        background: 'rgba(27,20,100,0.06)',
                        color: 'var(--bleu-nuit)',
                        margin: '0 auto 12px',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                      }} aria-hidden="true">
                        {s.icon}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--bleu-nuit)' }}>
                        {isEnglish ? s.labelEn : s.labelFr}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--texte-muted)', marginTop: 4 }}>
                        {isEnglish ? s.descEn : s.descFr}
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* Stats */}
          <section
            ref={statsRef}
            style={{ background: 'var(--bleu-nuit)', padding: '80px 0' }}
            aria-labelledby="stats-title"
          >
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {isEnglish ? 'In numbers' : 'En chiffres'}
                </div>
                <h2 id="stats-title" className="font-serif" style={{ fontSize: 36, fontWeight: 400, color: 'white' }}>
                  {isEnglish ? 'The BCUYI in a few figures' : 'La BCUYI en quelques données'}
                </h2>
              </div>
              <Reveal className="reveal-up">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 20
                }}>
                  {STATS.map(s => (
                    <StatCard key={s.labelFr} {...s} started={statsStarted} label={isEnglish ? s.labelEn : s.labelFr} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* CTA Dépôt */}
          <section
            style={{
              background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
              padding: '80px 0',
              position: 'relative',
              overflow: 'hidden'
            }}
            aria-labelledby="depot-title"
          >
            <div style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(124,58,237,0.05)',
              pointerEvents: 'none'
            }} aria-hidden="true" />
            <div style={{
              position: 'absolute',
              bottom: -150,
              left: -100,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'rgba(124,58,237,0.03)',
              pointerEvents: 'none'
            }} aria-hidden="true" />

            <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: 50,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 24,
                letterSpacing: '0.06em'
              }}>
                <Award size={14} aria-hidden="true" /> {isEnglish ? 'INSTITUTIONAL REPOSITORY' : 'DÉPÔT INSTITUTIONNEL'}
              </div>
              <h2 id="depot-title" className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'white', fontWeight: 400, marginBottom: 16 }}>
                {isEnglish ? 'Submit your research work' : 'Déposez vos travaux de recherche'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
                {isEnglish
                  ? 'Enhance your dissertation or thesis by submitting it to the institutional repository of the University of Yaoundé I.'
                  : 'Valorisez votre mémoire ou thèse en le déposant dans le répertoire institutionnel de l\'Université de Yaoundé I.'}
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/depot/soumettre"
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--or), var(--or-dark))',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                    padding: '14px 32px',
                    textDecoration: 'none',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 8,
                    fontWeight: 600
                  }}
                  title={isEnglish ? 'Submit your dissertation online' : 'Dépôt institutionnel ou thèse en ligne'}
                >
                  <Upload size={18} aria-hidden="true" /> {isEnglish ? 'Institutional deposit' : 'Dépôt institutionnel'}
                </Link>
                <Link
                  to="/archives"
                  className="btn btn-outline-white btn-lg"
                  style={{
                    padding: '14px 32px',
                    borderWidth: 2,
                    textDecoration: 'none',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 8,
                    fontWeight: 600,
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'transparent'
                  }}
                  title={isEnglish ? 'Browse the institutional repository' : 'Parcourir le répertoire institutionnel'}
                >
                  <Search size={18} aria-hidden="true" /> {isEnglish ? 'Browse the repository' : 'Parcourir le répertoire'}
                </Link>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section
            style={{ background: 'white', padding: '56px 0' }}
            aria-labelledby="info-title"
          >
            <h2 id="info-title" style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              border: 0
            }}>
              {isEnglish ? 'Practical information' : 'Informations pratiques'}
            </h2>
            <div className="container">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 24
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'rgba(27,20,100,0.06)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--bleu-nuit)'
                  }} aria-hidden="true">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                      {isEnglish ? 'Opening hours' : 'Horaires d\'ouverture'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--texte-muted)', lineHeight: 1.8 }}>
                      {isEnglish ? (
                        <>Monday – Friday: 08h00 – 22h00<br />Saturday: 08h00 – 16h00<br />Sunday: Closed</>
                      ) : (
                        <>Lundi – Vendredi : 08h00 – 22h00<br />Samedi : 08h00 – 16h00<br />Dimanche : Fermé</>
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'rgba(27,20,100,0.06)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--bleu-nuit)'
                  }} aria-hidden="true">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                      {isEnglish ? 'Online resources' : 'Ressources en ligne'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--texte-muted)', lineHeight: 1.8 }}>
                      {isEnglish ? (
                        <>24/7 access to PMB catalog<br />Research4Life, DOAJ, OpenEdition</>
                      ) : (
                        <>Accès 24h/24 au catalogue PMB<br />Research4Life, DOAJ, OpenEdition</>
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'rgba(27,20,100,0.06)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--bleu-nuit)'
                  }} aria-hidden="true">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                      {isEnglish ? 'Community' : 'Communauté'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--texte-muted)', lineHeight: 1.8 }}>
                      {isEnglish ? (
                        <>Students, teachers and researchers<br />Institutional partners</>
                      ) : (
                        <>Étudiants, enseignants et chercheurs<br />Partenaires institutionnels</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}

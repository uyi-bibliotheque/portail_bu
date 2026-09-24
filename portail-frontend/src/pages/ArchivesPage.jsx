// pages/ArchivesPage.jsx - VERSION MISE À JOUR (PMB + DICAMES)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, User, Calendar, Building2,
  Download, Eye, Grid, List, RefreshCw,
  ArrowLeft, BookOpen, Award,
  Layers, CheckCircle, Filter, X,
  Library, GraduationCap, Sparkles, Share2,
  Printer, ExternalLink, AlertCircle, Globe
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════════
// ─── LIENS OFFICIELS VERS LES RÉPERTOIRES EXTERNES ───────────────
// ═══════════════════════════════════════════════════════════════════

const EXTERNAL_LINKS = {
  memoires_pmb: 'http://10.4.2.112/pmb/opac_css/index.php?lvl=etagere_see&id=6',
  theses_pmb:   'http://10.4.2.112/pmb/opac_css/index.php?lvl=etagere_see&id=5',
  dicames:      'https://dicames.online/jspui/handle/20.500.12177/3651',
};

// ═══════════════════════════════════════════════════════════════════
// ─── CONSTANTES ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || '';

const FACULTIES = {
  'FS':      { name: 'Faculté des Sciences', abbr: 'FS', color: '#0d4a28' },
  'FALSH':   { name: 'Faculté des Arts, Lettres et Sciences Humaines', abbr: 'FALSH', color: '#5a2d0c' },
  'FSE':     { name: "Faculté des Sciences de l'Éducation", abbr: 'FSE', color: '#8b6508' },
  'FMSB':    { name: 'Faculté de Médecine et des Sciences Biomédicales', abbr: 'FMSB', color: '#5c0000' },
  'ENS':     { name: 'École Normale Supérieure de Yaoundé', abbr: 'ENS', color: '#1B1464' },
  'ENSPY':   { name: 'École Nationale Supérieure Polytechnique de Yaoundé', abbr: 'ENSPY', color: '#2d0050' },
  'IUT_BOIS':{ name: 'Institut Universitaire de Technologie du Bois', abbr: 'IUT_BOIS', color: '#004066' },
  'AUTRE':   { name: 'Autre établissement', abbr: 'AUTRE', color: '#64748b' },
};

const FACULTY_COLORS = {
  'FS':      { primary: '#0d4a28', secondary: '#1a6b3c', light: '#ECFDF5' },
  'FALSH':   { primary: '#5a2d0c', secondary: '#8b4513', light: '#FFF7ED' },
  'FSE':     { primary: '#8b6508', secondary: '#b8860b', light: '#FEFCE8' },
  'FMSB':    { primary: '#5c0000', secondary: '#8b0000', light: '#FEF2F2' },
  'ENS':     { primary: '#1B1464', secondary: '#2D2178', light: '#EEF2FF' },
  'ENSPY':   { primary: '#2d0050', secondary: '#4a0080', light: '#F5F3FF' },
  'IUT_BOIS':{ primary: '#004066', secondary: '#00688b', light: '#EFF6FF' },
  'AUTRE':   { primary: '#64748b', secondary: '#94a3b8', light: '#F1F5F9' },
};

const FACULTY_ABBREVIATIONS = Object.keys(FACULTIES);
const YEARS = Array.from({ length: 15 }, (_, i) => 2020 + i);

// ═══════════════════════════════════════════════════════════════════
// ─── API PUBLIQUE ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const getPublicArchives = async (params = {}) => {
  const response = await axios.get(`${API_URL}/api/archives/public/`, {
    params: { limit: params.limit || 500, ...params }
  });
  return response;
};

// ═══════════════════════════════════════════════════════════════════
// ─── UTILITAIRES ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function extractFacultyFromDocName(docName) {
  if (!docName) return 'AUTRE';
  const firstPart = docName.split('_')[0];
  return FACULTY_ABBREVIATIONS.includes(firstPart) ? firstPart : 'AUTRE';
}

function getFacultyAbbr(document) {
  const docName = document.document_name || document.archive_info?.document_name || '';
  const fromDocName = extractFacultyFromDocName(docName);
  if (fromDocName !== 'AUTRE') return fromDocName;
  if (document.archive_info?.faculty && document.archive_info.faculty !== 'AUTRE') {
    return document.archive_info.faculty;
  }
  if (document.filiere) {
    for (const abbr of FACULTY_ABBREVIATIONS) {
      if (document.filiere.toUpperCase().includes(abbr)) return abbr;
    }
  }
  return 'AUTRE';
}

function getFacultyColor(facultyAbbr, variant = 'primary') {
  const colors = FACULTY_COLORS[facultyAbbr] || FACULTY_COLORS['AUTRE'];
  return colors[variant] || colors.primary;
}

function getFacultyName(abbr) {
  return FACULTIES[abbr]?.name || abbr || 'Faculté';
}

// ═══════════════════════════════════════════════════════════════════
// ─── CARTE D'ARCHIVE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ArchiveCard({ document }) {
  const [isHovered, setIsHovered] = useState(false);
  const isMemoire = document.type_document === 'MEMOIRE';
  const facultyAbbr = getFacultyAbbr(document);
  const facultyName = getFacultyName(facultyAbbr);
  const facultyColor = getFacultyColor(facultyAbbr, 'primary');
  const facultySecondary = getFacultyColor(facultyAbbr, 'secondary');
  const year = document.archive_info?.year || new Date(document.archived_at || document.created_at).getFullYear();
  const docName = document.document_name || document.archive_info?.document_name || 'Document';
  const authorName = document.author_full_name || document.author_name || 'Auteur inconnu';

  const cleanApiBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const archivePath = document.archive_path || document.archive_info?.archive_path || null;
  const getDocumentUrl = () => archivePath ? `${cleanApiBase}/api/documents/archive/${archivePath}/` : null;

  const handleView = (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = getDocumentUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else alert("Ce document n'est pas disponible en ligne.");
  };

  const handleDownload = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = getDocumentUrl();
    if (!url) return alert("Ce document n'est pas disponible en téléchargement.");
    try {
      const response = await fetch(url, { headers: { 'Accept': 'application/pdf' } });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${docName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <article
      className="archive-card"
      style={{
        background: 'white',
        borderRadius: 16,
        border: `1px solid ${isHovered ? facultyColor : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isHovered ? '0 20px 60px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bannière */}
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${facultyColor} 0%, ${facultySecondary} 100%)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          fontSize: 80, opacity: 0.10, position: 'absolute',
          right: -10, bottom: -20, transform: 'rotate(10deg)', pointerEvents: 'none'
        }}>
          {isMemoire ? '📚' : '🎓'}
        </div>

        <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>{isMemoire ? '📚' : '🎓'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isMemoire ? 'Mémoire de Master' : 'Thèse de Doctorat'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: 'monospace' }}>
            {docName.length > 30 ? docName.substring(0, 28) + '…' : docName}
          </div>
        </div>

        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '3px 12px', borderRadius: 50,
          fontSize: 10, fontWeight: 700,
          background: 'rgba(255,255,255,0.2)', color: 'white',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {facultyAbbr}
        </div>

        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '3px 12px', borderRadius: 50,
          fontSize: 9, fontWeight: 600,
          background: 'rgba(16,185,129,0.9)', color: 'white',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <CheckCircle size={12} /> Archivé
        </div>
      </div>

      {/* Corps */}
      <div style={{ padding: '18px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: 'var(--bleu-nuit)',
          marginBottom: 8, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 42
        }}>
          {document.title || 'Document sans titre'}
        </h3>

        <div style={{ fontSize: 12, color: 'var(--texte-muted)', marginBottom: 10, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <User size={13} color="var(--texte-light)" /> <span>{authorName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Building2 size={13} color="var(--texte-light)" /> <span>{facultyName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="var(--texte-light)" /> <span>{year}</span>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 8, marginTop: 12,
          paddingTop: 12, borderTop: '1px solid var(--border-light)'
        }}>
          <button
            onClick={handleView}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 8,
              background: `linear-gradient(135deg, ${facultyColor}, ${facultySecondary})`,
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 2px 8px ${facultyColor}30`
            }}
          >
            <Eye size={14} /> Voir
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--beige)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, color: 'var(--texte)'
            }}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── LISTE D'ARCHIVE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ArchiveListItem({ document }) {
  const [isHovered, setIsHovered] = useState(false);
  const isMemoire = document.type_document === 'MEMOIRE';
  const facultyAbbr = getFacultyAbbr(document);
  const facultyName = getFacultyName(facultyAbbr);
  const facultyColor = getFacultyColor(facultyAbbr, 'primary');
  const facultySecondary = getFacultyColor(facultyAbbr, 'secondary');
  const year = document.archive_info?.year || new Date(document.archived_at || document.created_at).getFullYear();
  const authorName = document.author_full_name || document.author_name || 'Auteur inconnu';

  const cleanApiBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const archivePath = document.archive_path || document.archive_info?.archive_path || null;
  const getDocumentUrl = () => archivePath ? `${cleanApiBase}/api/documents/archive/${archivePath}/` : null;

  const handleView = (e) => {
    e.preventDefault();
    const url = getDocumentUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        background: 'white', borderRadius: 12,
        border: `1px solid ${isHovered ? facultyColor : 'var(--border)'}`,
        padding: '16px 20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.06)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `linear-gradient(135deg, ${facultyColor}, ${facultySecondary})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0, color: 'white'
      }}>
        {isMemoire ? '📚' : '🎓'}
      </div>

      <div style={{ flex: 1, minWidth: 180 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 4, lineHeight: 1.3 }}>
          {document.title || 'Document sans titre'}
        </h4>
        <div style={{
          fontSize: 12, color: 'var(--texte-muted)',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <User size={12} /> {authorName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Building2 size={12} /> {facultyName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> {year}
          </span>
          <span style={{
            padding: '2px 10px', borderRadius: 50, fontSize: 9, fontWeight: 600,
            background: `${facultyColor}12`, color: facultyColor,
            border: `1px solid ${facultyColor}20`
          }}>
            {facultyAbbr}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleView}
          style={{
            padding: '6px 14px', borderRadius: 6,
            background: `linear-gradient(135deg, ${facultyColor}, ${facultySecondary})`,
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          <Eye size={13} /> Voir
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── CARTE RÉPERTOIRE OFFICIEL (PMB / DICAMES) ───────────────────
// ═══════════════════════════════════════════════════════════════════

function OfficialRepositoryCard({ title, description, url, icon, color, gradient, badges = [] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'white', borderRadius: 16,
        border: `1px solid ${isHovered ? color : 'var(--border)'}`,
        overflow: 'hidden', textDecoration: 'none', color: 'inherit',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
        borderTop: `4px solid ${color}`,
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ padding: '24px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: gradient, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 20px ${color}30`
        }}>
          {icon}
        </div>

        <h3 style={{
          fontSize: 18, fontWeight: 700,
          color: 'var(--bleu-nuit)', margin: 0, lineHeight: 1.3
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: 13.5, color: 'var(--texte-muted)',
          lineHeight: 1.65, margin: 0, flex: 1
        }}>
          {description}
        </p>

        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {badges.map(b => (
              <span key={b} style={{
                fontSize: 10, padding: '3px 10px', borderRadius: 50,
                background: `${color}12`, color: color,
                fontWeight: 700, letterSpacing: '0.02em'
              }}>
                {b}
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: color,
          marginTop: 4
        }}>
          Accéder au répertoire <ExternalLink size={14} />
        </div>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SKELETON ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function SkeletonLoader({ count = 6, viewMode = 'grid' }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
      gap: 16
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{
          background: 'white', borderRadius: 16,
          border: '1px solid var(--border)', overflow: 'hidden',
          height: viewMode === 'grid' ? 320 : 80,
          animationDelay: `${i * 0.05}s`
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function ArchivesPage() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.title = 'Archives des Mémoires & Thèses - BCUY1';
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setLoading(true);
    try {
      const response = await getPublicArchives({ limit: 500 });
      const allData = response.data?.results || response.data || [];
      const archived = allData.filter(d => d.is_archived === true);
      setDocuments(archived);
      setTotalCount(archived.length);
    } catch (error) {
      console.warn('⚠️ API archives indisponible — les répertoires officiels restent accessibles.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const searchLower = searchTerm.toLowerCase();
      const facultyAbbr = getFacultyAbbr(doc);
      const facultyName = getFacultyName(facultyAbbr);
      const year = doc.archive_info?.year || new Date(doc.archived_at || doc.created_at).getFullYear();
      const docName = doc.document_name || doc.archive_info?.document_name || '';

      const matchesSearch =
        doc.title?.toLowerCase().includes(searchLower) ||
        doc.author_full_name?.toLowerCase().includes(searchLower) ||
        doc.author_name?.toLowerCase().includes(searchLower) ||
        facultyName.toLowerCase().includes(searchLower) ||
        facultyAbbr.toLowerCase().includes(searchLower) ||
        docName.toLowerCase().includes(searchLower) ||
        (doc.keywords || '').toLowerCase().includes(searchLower);

      const matchesFaculty = filterFaculty === 'all' || facultyAbbr === filterFaculty;
      const matchesYear = filterYear === 'all' || year === parseInt(filterYear);
      const matchesType = filterType === 'all' || doc.type_document === filterType;

      return matchesSearch && matchesFaculty && matchesYear && matchesType;
    });
  }, [documents, searchTerm, filterFaculty, filterYear, filterType]);

  const sortedDocs = useMemo(() => {
    return [...filteredDocs].sort((a, b) => {
      switch (sortBy) {
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        case 'author_asc': return (a.author_full_name || a.author_name || '').localeCompare(b.author_full_name || b.author_name || '');
        case 'author_desc': return (b.author_full_name || b.author_name || '').localeCompare(a.author_full_name || a.author_name || '');
        case 'year_asc': return (a.archive_info?.year || 0) - (b.archive_info?.year || 0);
        case 'year_desc': return (b.archive_info?.year || 0) - (a.archive_info?.year || 0);
        case 'date_asc': return new Date(a.archived_at || a.created_at) - new Date(b.archived_at || b.created_at);
        case 'date_desc':
        default: return new Date(b.archived_at || b.created_at) - new Date(a.archived_at || a.created_at);
      }
    });
  }, [filteredDocs, sortBy]);

  const stats = useMemo(() => {
    const facultyStats = {};
    const typeStats = { MEMOIRE: 0, THESE: 0 };
    documents.forEach(doc => {
      const abbr = getFacultyAbbr(doc);
      facultyStats[abbr] = (facultyStats[abbr] || 0) + 1;
      if (doc.type_document === 'MEMOIRE') typeStats.MEMOIRE++;
      else if (doc.type_document === 'THESE') typeStats.THESE++;
    });
    return {
      total: documents.length,
      memoires: typeStats.MEMOIRE,
      theses: typeStats.THESE,
      faculties: Object.keys(facultyStats).length,
      facultyStats,
    };
  }, [documents]);

  const hasActiveFilters = searchTerm || filterFaculty !== 'all' || filterYear !== 'all' || filterType !== 'all';

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'Archives des Mémoires & Thèses - BCUY1',
        text: "Consultez les archives des mémoires et thèses de l'Université de Yaoundé I.",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => addToast('Lien copié dans le presse-papier !', 'success'))
        .catch(() => addToast("Copiez le lien depuis la barre d'adresse", 'info'));
    }
  }, [addToast]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterYear('all');
    setFilterType('all');
    setSortBy('date_desc');
  }, []);

  return (
    <Layout>
      {/* ═══ EN-TÊTE ═══ */}
      <header style={{
        background: 'linear-gradient(135deg, #0F0A2A 0%, #1B1464 40%, #2D2178 100%)',
        padding: '48px 0 40px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(124,58,237,0.06)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -40,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(201,168,106,0.04)', pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            marginBottom: 16, flexWrap: 'wrap'
          }}>
            <Link to="/" style={{
              color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none'
            }}>
              <ArrowLeft size={14} /> {isEnglish ? 'Home' : 'Accueil'}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
            <span style={{ color: 'var(--or)', fontWeight: 500 }}>
              {isEnglish ? 'Dissertations & Theses Archive' : 'Archives des Mémoires & Thèses'}
            </span>
          </nav>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <h1 className="font-serif" style={{
                fontSize: 'clamp(32px, 5vw, 44px)',
                color: 'white', fontWeight: 400,
                marginBottom: 6, lineHeight: 1.1
              }}>
                {isEnglish ? 'Dissertations & ' : 'Archives des '}
                <span style={{ color: 'var(--or)' }}>
                  {isEnglish ? 'Theses' : 'Mémoires & Thèses'}
                </span>
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                maxWidth: 640, lineHeight: 1.6
              }}>
                {isEnglish
                  ? 'Browse the official repositories of dissertations, theses and research works of the University of Yaoundé I.'
                  : "Consultez les répertoires officiels des mémoires, thèses et travaux de recherche de l'Université de Yaoundé I."}
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <a href={EXTERNAL_LINKS.memoires_pmb} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 50,
                    background: 'rgba(255,255,255,0.10)',
                    color: 'white', fontSize: 13, fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none', transition: 'all 0.25s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.20)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                >
                  <BookOpen size={16} /> {isEnglish ? 'Dissertations (PMB)' : 'Mémoires (PMB)'}
                </a>
                <a href={EXTERNAL_LINKS.theses_pmb} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 50,
                    background: 'rgba(255,255,255,0.10)',
                    color: 'white', fontSize: 13, fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none', transition: 'all 0.25s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.20)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                >
                  <GraduationCap size={16} /> {isEnglish ? 'Theses (PMB)' : 'Thèses (PMB)'}
                </a>
                <a href={EXTERNAL_LINKS.dicames} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 50,
                    background: 'linear-gradient(135deg, var(--or), #d97706)',
                    color: 'white', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.25s',
                    boxShadow: '0 6px 20px rgba(124,58,237,0.30)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Globe size={16} /> {isEnglish ? 'DICAMES Repository' : 'Dépôt DICAMES'}
                </a>
              </div>
            </div>

            {isStaff && (
              <button
                onClick={loadArchives}
                style={{
                  padding: '8px 18px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                {isEnglish ? 'Refresh' : 'Actualiser'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══ CONTENU ═══ */}
      <main className="container" style={{ padding: '32px 20px 48px' }}>

        {/* ── RÉPERTOIRES OFFICIELS ── */}
        <section aria-label="Répertoires officiels" style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'inline-block', padding: '4px 16px',
              background: 'rgba(124,58,237,0.10)', borderRadius: 50, marginBottom: 12
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--or)',
                letterSpacing: '0.06em'
              }}>
                📚 {isEnglish ? 'OFFICIAL REPOSITORIES' : 'RÉPERTOIRES OFFICIELS'}
              </span>
            </div>
            <h2 className="font-serif" style={{
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              color: 'var(--bleu-nuit)', fontWeight: 400,
              marginBottom: 8, lineHeight: 1.2
            }}>
              {isEnglish ? 'Access the full collections' : 'Accéder aux collections complètes'}
            </h2>
            <p style={{
              color: 'var(--texte-muted)', fontSize: 14.5,
              maxWidth: 720, lineHeight: 1.7
            }}>
              {isEnglish
                ? 'The Central Library provides direct access to the official PMB repositories for dissertations and theses, as well as the DICAMES institutional repository.'
                : "La Bibliothèque Centrale vous donne un accès direct aux répertoires officiels PMB pour les mémoires et thèses, ainsi qu'au dépôt institutionnel DICAMES."}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            <OfficialRepositoryCard
              title={isEnglish ? 'Dissertations (PMB)' : 'Mémoires (PMB)'}
              description={isEnglish
                ? 'Browse all Master dissertations archived at the Central Library. Full-text access and advanced search available.'
                : "Consultez l'ensemble des mémoires de Master archivés à la Bibliothèque Centrale. Accès au texte intégral et recherche avancée disponibles."}
              url={EXTERNAL_LINKS.memoires_pmb}
              icon={<BookOpen size={28} />}
              color="#059669"
              gradient="linear-gradient(135deg, #059669, #10b981)"
              badges={['PMB', 'Texte intégral', 'Recherche avancée']}
            />
            <OfficialRepositoryCard
              title={isEnglish ? 'Theses (PMB)' : 'Thèses (PMB)'}
              description={isEnglish
                ? 'Explore all doctoral theses defended at the University of Yaoundé I, classified by faculty and year.'
                : "Explorez l'ensemble des thèses de doctorat soutenues à l'Université de Yaoundé I, classées par faculté et par année."}
              url={EXTERNAL_LINKS.theses_pmb}
              icon={<GraduationCap size={28} />}
              color="#7C3AED"
              gradient="linear-gradient(135deg, #7C3AED, #8b5cf6)"
              badges={['PMB', 'Doctorat', 'Par faculté']}
            />
            <OfficialRepositoryCard
              title={isEnglish ? 'DICAMES Repository' : 'Dépôt DICAMES'}
              description={isEnglish
                ? 'DICAMES is the institutional repository of the University of Yaoundé I — open access to research works (theses, dissertations, articles).'
                : "DICAMES est le dépôt institutionnel de l'Université de Yaoundé I — accès libre aux travaux de recherche (thèses, mémoires, articles)."}
              url={EXTERNAL_LINKS.dicames}
              icon={<Globe size={28} />}
              color="#f59e0b"
              gradient="linear-gradient(135deg, #f59e0b, #d97706)"
              badges={['Open Access', 'DSpace', 'Institutionnel']}
            />
          </div>
        </section>

        {/* ── SECTION ARCHIVES INTERNES (si disponibles) ── */}
        {!loading && documents.length > 0 && (
          <section aria-label="Archives validées" style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, flexWrap: 'wrap', gap: 12
            }}>
              <h2 className="font-serif" style={{
                fontSize: 'clamp(20px, 2.4vw, 26px)',
                color: 'var(--bleu-nuit)', fontWeight: 400, margin: 0
              }}>
                {isEnglish ? 'Recently archived documents' : 'Documents récemment archivés'}
              </h2>
              <span style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 50,
                background: 'rgba(16,185,129,0.10)', color: '#059669',
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Sparkles size={12} /> {documents.length} document{documents.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Barre de recherche */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={18} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--texte-light)'
                }} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isEnglish ? 'Search...' : 'Rechercher...'}
                  style={{
                    width: '100%', padding: '10px 14px 10px 44px',
                    border: '2px solid var(--border)', borderRadius: 12,
                    fontSize: 14, background: 'white', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 2, border: '2px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
                <button onClick={() => setViewMode('grid')} style={{
                  padding: '8px 12px',
                  background: viewMode === 'grid' ? 'var(--bleu-nuit)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--texte-muted)',
                  border: 'none', cursor: 'pointer'
                }}><Grid size={16} /></button>
                <button onClick={() => setViewMode('list')} style={{
                  padding: '8px 12px',
                  background: viewMode === 'list' ? 'var(--bleu-nuit)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--texte-muted)',
                  border: 'none', cursor: 'pointer'
                }}><List size={16} /></button>
              </div>
            </div>

            {sortedDocs.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 24px',
                background: 'white', borderRadius: 16,
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: 'var(--texte-muted)', fontSize: 14 }}>
                  {isEnglish ? 'No document matches your criteria.' : 'Aucun document ne correspond à vos critères.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20
              }}>
                {sortedDocs.map((doc, i) => <ArchiveCard key={doc.id || i} document={doc} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedDocs.map((doc, i) => <ArchiveListItem key={doc.id || i} document={doc} />)}
              </div>
            )}
          </section>
        )}

        {/* ── ÉTAT VIDE / INFO ── */}
        {!loading && documents.length === 0 && (
          <section style={{
            background: 'white', borderRadius: 16,
            border: '1px solid var(--border)',
            padding: '32px 28px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(245,158,11,0.10)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: 'var(--bleu-nuit)', marginBottom: 6
              }}>
                {isEnglish ? 'Information' : 'Information'}
              </h3>
              <p style={{
                fontSize: 14, color: 'var(--texte-muted)',
                lineHeight: 1.7, margin: 0
              }}>
                {isEnglish
                  ? 'The internal archive is currently being synchronized. In the meantime, please access the full collections through the official repositories above (PMB and DICAMES).'
                  : "L'archive interne est en cours de synchronisation. En attendant, veuillez accéder aux collections complètes via les répertoires officiels ci-dessus (PMB et DICAMES)."}
              </p>
            </div>
          </section>
        )}

        {/* ── PIED DE PAGE ── */}
        <footer style={{
          marginTop: 48, paddingTop: 24,
          borderTop: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
            <strong style={{ color: 'var(--texte)' }}>{EXTERNAL_LINKS ? 3 : 0}</strong> répertoires officiels accessibles
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleShare} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--texte-muted)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
              <Share2 size={16} /> {isEnglish ? 'Share' : 'Partager'}
            </button>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--bleu-nuit)', color: 'white',
              fontSize: 13, fontWeight: 600, textDecoration: 'none'
            }}>
              <ArrowLeft size={16} /> {isEnglish ? 'Back to home' : "Retour à l'accueil"}
            </Link>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton-card {
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4dd 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .archive-card { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </Layout>
  );
}

// pages/CataloguePage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Grid3X3, List, ChevronLeft,
  ChevronRight, BookOpen, X, Filter, Download, Heart, Eye, Loader2,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { searchCatalog, getFavorites, addFavorite, removeFavorite, getSearchSuggestions } from '../services/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const FACULTIES = [
  { id: '', label: 'Toutes les facultés & écoles' },
  { id: 'FS', label: 'FS - Faculté des Sciences' },
  { id: 'FALSH', label: 'FALSH - Arts, Lettres & Sc. Humaines' },
  { id: 'FSE', label: "FSE - Sciences de l'Éducation" },
  { id: 'FMSB', label: 'FMSB - Médecine & Sc. Biomédicales' },
  { id: 'ENS', label: 'ENS - École Normale Supérieure' },
  { id: 'ENSPY', label: 'ENSPY - Polytechnique Yaoundé' },
  { id: 'IUT_BOIS', label: 'IUT-Bois - Tech. du Bois' },
];

const DOC_TYPES = [
  { id: '', label: 'Tous types' },
  { id: 'livre', label: '📚 Livre' },
  { id: 'these', label: '🎓 Thèse' },
  { id: 'memoire', label: '📄 Mémoire' },
  { id: 'revue', label: '📰 Revue' },
  { id: 'rapport', label: '📋 Rapport' },
];

const LANGUAGES = [
  { id: '', label: 'Toutes langues' },
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'Anglais' },
];

const AVAIL = [
  { id: '', label: 'Toute disponibilité' },
  { id: 'disponible',   label: '✅ Disponible' },
  { id: 'emprunte',     label: '🟡 Emprunté' },
  { id: 'consultation', label: '🔵 Consultation' },
];

const SORT_OPTIONS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'titre',      label: 'Titre (A-Z)' },
  { id: 'auteur',     label: 'Auteur' },
  { id: 'annee_desc', label: 'Année (récent)' },
  { id: 'annee_asc',  label: 'Année (ancien)' },
];

const PMB_OPAC_URL = 'http://10.4.2.112/pmb/opac_css/';

const BADGE_STATUS = {
  disponible:   'badge-green',
  emprunte:     'badge-amber',
  consultation: 'badge-slate',
  'Disponible': 'badge-green',
  'Emprunté': 'badge-amber',
  'Consultation sur place': 'badge-slate',
};

const LABEL_STATUS = {
  disponible:   'Disponible',
  emprunte:     'Emprunté',
  consultation: 'Consultation sur place',
  'Disponible': 'Disponible',
  'Emprunté': 'Emprunté',
  'Consultation sur place': 'Consultation sur place',
};

const TYPE_ICONS = {
  livre: '📚', 
  these: '🎓', 
  memoire: '📄', 
  revue: '📰', 
  rapport: '📋',
  'Livre': '📚',
  'Thèse': '🎓',
  'Mémoire': '📄',
  'Revue': '📰',
  'Rapport': '📋'
};

// ─── Composant Skeleton ──────────────────────────────────────────
function SkeletonCard({ view }) {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      ...(view === 'list' ? { display: 'flex', gap: 16, padding: 16 } : {})
    }}>
      <div className="skeleton" style={{ 
        height: view === 'list' ? 80 : 160, 
        width: view === 'list' ? 80 : '100%', 
        flexShrink: 0 
      }} />
      <div style={{ padding: view === 'list' ? 0 : 16, flex: 1 }}>
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 12, width: '90%' }} />
      </div>
    </div>
  );
}

// ─── Composant SearchAutocomplete ───────────────────────────────
function SearchAutocomplete({ value, onChange, onSearch, placeholder = "Rechercher...", disabled = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getSearchSuggestions(value);
        if (response.data?.suggestions) {
          setSuggestions(response.data.suggestions);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Erreur suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        const selected = suggestions[highlightedIndex];
        onChange(selected.title);
        onSearch(selected.title);
        setIsOpen(false);
      } else {
        onSearch(value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.title);
    onSearch(suggestion.title);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Search size={18} color="var(--texte-muted)" style={{ position: 'absolute', left: 12, zIndex: 1 }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: 14,
            background: 'white',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--or)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        {loading && (
          <Loader2 size={16} className="spin" style={{ position: 'absolute', right: 12, color: 'var(--or)' }} />
        )}
        {value && !loading && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--texte-muted)',
              padding: 4
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          maxHeight: 320,
          overflowY: 'auto',
          zIndex: 100
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: highlightedIndex === index ? 'var(--beige)' : 'transparent',
                transition: 'background 0.15s',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div style={{ fontWeight: 500, color: 'var(--bleu-nuit)' }}>{suggestion.title}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-muted)', marginTop: 2 }}>
                {suggestion.authors?.join(', ') || 'Auteur inconnu'}
                {suggestion.doc_type && (
                  <span style={{ 
                    marginLeft: 8, 
                    padding: '1px 8px', 
                    background: 'var(--beige)', 
                    borderRadius: 4, 
                    fontSize: 10,
                    color: 'var(--texte-muted)'
                  }}>
                    {suggestion.doc_type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Composant SearchFacets ──────────────────────────────────────
function SearchFacets({ facets, activeFacets, onFacetChange }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFacetClick = (facetKey, value) => {
    onFacetChange(facetKey, value);
  };

  const removeFacet = (facetKey) => {
    onFacetChange(facetKey, null);
  };

  if (!facets || Object.keys(facets).length === 0) {
    return (
      <div style={{ marginBottom: 24, color: 'var(--texte-muted)', fontSize: 13 }}>
        Aucun filtre disponible
      </div>
    );
  }

  const facetLabels = {
    faculty: 'Faculté',
    type: 'Type de document',
    language: 'Langue',
    availability: 'Disponibilité',
    year: 'Année'
  };

  const facetColors = {
    faculty: '#6366f1',
    type: '#059669',
    language: '#8b5cf6',
    availability: '#F59E0B',
    year: '#1B1464'
  };

  const activeCount = Object.keys(activeFacets).filter(k => activeFacets[k]).length;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--texte)' }}>
          <Filter size={14} style={{ display: 'inline', marginRight: 6 }} />
          Filtres
        </span>
        {activeCount > 0 && (
          <button
            onClick={() => onFacetChange('all', null)}
            style={{ 
              fontSize: 12, 
              color: 'var(--or)', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 4,
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Active facets tags */}
      {activeCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {Object.entries(activeFacets).map(([key, value]) => value && (
            <div key={key} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: `${facetColors[key] || 'var(--or)'}15`,
              borderRadius: 50,
              fontSize: 12,
              border: `1px solid ${facetColors[key] || 'var(--or)'}30`
            }}>
              <span style={{ color: facetColors[key] || 'var(--or)' }}>
                {facetLabels[key] || key}: {value}
              </span>
              <button
                onClick={() => removeFacet(key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--texte-muted)' }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {Object.entries(facets).map(([key, values]) => {
        if (!values || values.length === 0) return null;
        const isExpanded = expanded[key] !== false;

        return (
          <div key={key} style={{ marginBottom: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
            <button
              onClick={() => toggleExpand(key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '6px 0',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--texte)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ 
                  width: 3, 
                  height: 14, 
                  borderRadius: 2, 
                  background: facetColors[key] || 'var(--or)' 
                }} />
                {facetLabels[key] || key}
              </span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {values.slice(0, 12).map((item) => (
                  <label
                    key={item.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                      background: activeFacets[key] === item.value ? 'rgba(27,20,100,0.05)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (activeFacets[key] !== item.value) {
                        e.currentTarget.style.background = 'var(--beige)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (activeFacets[key] !== item.value) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activeFacets[key] === item.value}
                      onChange={() => handleFacetClick(key, item.value)}
                      style={{ accentColor: 'var(--or)', cursor: 'pointer' }}
                    />
                    <span style={{ flex: 1, color: 'var(--texte)' }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--texte-muted)' }}>({item.count})</span>
                  </label>
                ))}
                {values.length > 12 && (
                  <div style={{ fontSize: 12, color: 'var(--texte-muted)', padding: '4px 8px' }}>
                    +{values.length - 12} autres
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Composant NoticeCard ────────────────────────────────────────
function NoticeCard({ notice, view, isFavorite, onToggleFavorite }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isFav, setIsFav] = useState(isFavorite || false);

  useEffect(() => {
    setIsFav(isFavorite || false);
  }, [isFavorite]);

  const title = notice.title || notice.titre || notice.tit1 || notice.name || 'Titre inconnu';
  
  let authors = [];
  if (notice.authors && Array.isArray(notice.authors)) {
    authors = notice.authors;
  } else if (notice.author) {
    authors = [notice.author];
  } else if (notice.auteur) {
    authors = [notice.auteur];
  } else if (notice.auteur_principal) {
    authors = [notice.auteur_principal];
  } else {
    authors = ['Auteur inconnu'];
  }
  const authorDisplay = authors.join(' ; ');
  
  const docType = notice.doc_type || notice.type || notice.typdoc || 'Livre';
  const icon = TYPE_ICONS[docType] || '📖';
  
  const statusKey = notice.availability_status || notice.availability || notice.statut || 'disponible';
  const availBadge = BADGE_STATUS[statusKey] || 'badge-slate';
  const availLabel = LABEL_STATUS[statusKey] || statusKey;
  
  const year = notice.publication_year || notice.year || notice.year_pub || '';
  const summary = notice.summary || notice.abstract || notice.n_resume || notice.resume || '';
  const location = notice.location || notice.faculty || 'Bibliothèque Centrale';
  const noticeId = notice.id || notice.noticeId || notice.notice_id || '';
  const publisher = notice.publisher || notice.editeur || '';
  const isbn = notice.isbn || notice.code || notice.isbd || '';

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      addToast('Connectez-vous pour ajouter aux favoris', 'warning');
      return;
    }
    
    const newState = !isFav;
    setIsFav(newState);
    onToggleFavorite?.(noticeId, newState);
    
    if (newState) {
      addFavorite({ 
        pmb_notice_id: noticeId,
        note: title + ' - ' + authorDisplay
      })
        .then(() => addToast('Ajouté aux favoris', 'success'))
        .catch((error) => {
          setIsFav(false);
          console.error('Erreur ajout favori:', error);
          addToast('Erreur lors de l\'ajout aux favoris', 'error');
        });
    } else {
      removeFavorite(noticeId)
        .then(() => addToast('Retiré des favoris', 'info'))
        .catch((error) => {
          setIsFav(true);
          console.error('Erreur suppression favori:', error);
          addToast('Erreur lors du retrait des favoris', 'error');
        });
    }
  };

  if (view === 'list') {
    return (
      <Link 
        to={`/catalogue/notice/${noticeId}`} 
        className="card" 
        style={{ 
          display: 'flex', 
          gap: 16, 
          padding: 20, 
          textDecoration: 'none', 
          color: 'inherit',
          transition: 'all 0.2s',
          position: 'relative'
        }}
      >
        <button
          onClick={handleToggleFavorite}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart 
            size={16} 
            fill={isFav ? '#ef4444' : 'none'} 
            color={isFav ? '#ef4444' : 'var(--texte-muted)'} 
          />
        </button>

        <div style={{
          width: 56, height: 72, borderRadius: 8, flexShrink: 0,
          background: 'var(--beige)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, border: '1px solid var(--border)'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 40 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className={`badge ${availBadge}`}>{availLabel}</span>
            <span className="badge badge-slate">{docType}</span>
          </div>
          <h3 style={{ 
            fontWeight: 700, 
            fontSize: 15, 
            marginBottom: 4, 
            lineHeight: 1.3, 
            color: 'var(--bleu-nuit)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--texte-muted)', marginBottom: 6 }}>
            {authorDisplay} {year ? `• ${year}` : ''}
          </div>
          {summary && (
            <p style={{ 
              fontSize: 13, 
              color: 'var(--texte-muted)', 
              lineHeight: 1.5, 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden' 
            }}>
              {summary.substring(0, 150)}…
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
            {publisher && (
              <span style={{ fontSize: 12, color: 'var(--texte-light)' }}>
                📚 {publisher}
              </span>
            )}
            {isbn && (
              <span style={{ fontSize: 11, color: 'var(--texte-light)', fontFamily: 'monospace' }}>
                ISBN: {isbn}
              </span>
            )}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 8, 
          flexShrink: 0, 
          alignItems: 'flex-end', 
          justifyContent: 'space-between' 
        }}>
          <span style={{ fontSize: 12, color: 'var(--texte-light)' }}>{location}</span>
          <span style={{ fontSize: 11, color: 'var(--texte-light)' }}>Cote: {notice.cote || 'N/A'}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/catalogue/notice/${noticeId}`} 
      className="card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textDecoration: 'none', 
        color: 'inherit',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      <button
        onClick={handleToggleFavorite}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Heart 
          size={16} 
          fill={isFav ? '#ef4444' : 'none'} 
          color={isFav ? '#ef4444' : 'var(--texte-muted)'} 
        />
      </button>

      <div style={{
        height: 160, background: 'linear-gradient(135deg, var(--beige) 0%, var(--beige-dark) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
        borderBottom: '1px solid var(--border)'
      }}>
        {icon}
      </div>
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className={`badge ${availBadge}`}>{availLabel}</span>
          <span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>{docType}</span>
        </div>
        <h3 style={{ 
          fontWeight: 700, 
          fontSize: 14, 
          marginBottom: 6, 
          lineHeight: 1.4, 
          flex: 1, 
          color: 'var(--bleu-nuit)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h3>
        <div style={{ fontSize: 12, color: 'var(--texte-muted)', marginBottom: 4 }}>
          {authorDisplay}
        </div>
        {year && (
          <div style={{ fontSize: 12, color: 'var(--texte-light)' }}>{year}</div>
        )}
        {publisher && (
          <div style={{ fontSize: 11, color: 'var(--texte-light)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {publisher}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Page Principale ─────────────────────────────────────────────
export default function CataloguePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [params, setParams] = useSearchParams();
  
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [view, setView] = useState(() => sessionStorage.getItem('catalog_view') || 'grid');
  const [sortBy, setSortBy] = useState(() => sessionStorage.getItem('catalog_sort') || 'pertinence');
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [facets, setFacets] = useState({});
  const [activeFacets, setActiveFacets] = useState({});
  const searchTimeoutRef = useRef(null);
  const initialSearchDone = useRef(false);
  const isFirstLoad = useRef(true);

  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    type: '', language: '', availability: '', faculty: '',
    annee_min: '', annee_max: '',
    auteur: '', isbn: '', sujet: '', editeur: '', collection: '',
  });
  const [advMode, setAdvMode] = useState(false);

  const PAGE_SIZE = 12;

  // Sauvegarder les résultats
  const saveResults = useCallback((items, totalCount, currentPage, query) => {
    try {
      sessionStorage.setItem('catalog_results', JSON.stringify({
        results: items,
        total: totalCount,
        page: currentPage,
        query: query
      }));
      sessionStorage.setItem('catalog_total', String(totalCount));
      sessionStorage.setItem('catalog_page', String(currentPage));
      sessionStorage.setItem('catalog_view', view);
      sessionStorage.setItem('catalog_sort', sortBy);
    } catch (e) {
      console.warn('Impossible de sauvegarder les résultats:', e);
    }
  }, [view, sortBy]);

  // Charger les favoris
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      setFavoritesLoading(true);
      try {
        const response = await getFavorites();
        const favs = response.data?.results || response.data || [];
        const favIds = favs.map(f => f.pmb_notice_id || f.notice_id || f.noticeId || f.id).filter(id => id);
        setFavorites(favIds);
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
        setFavorites([]);
      } finally {
        setFavoritesLoading(false);
      }
    };
    loadFavorites();
  }, [user]);

  const isFavorite = (noticeId) => {
    return favorites.includes(noticeId);
  };

  const updateFavorite = (noticeId, isFav) => {
    if (isFav) {
      setFavorites(prev => [...prev, noticeId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== noticeId));
    }
  };

  // Gestion des facettes
  const handleFacetChange = (facetKey, value) => {
    if (facetKey === 'all') {
      setActiveFacets({});
      setPage(1);
      return;
    }
    
    if (value === null) {
      const newFacets = { ...activeFacets };
      delete newFacets[facetKey];
      setActiveFacets(newFacets);
    } else {
      setActiveFacets(prev => ({ ...prev, [facetKey]: value }));
    }
    setPage(1);
  };

  // Fonction de recherche
  const performSearch = useCallback(async (searchParams, p, sort, isManual = false) => {
    const query = searchParams.q || '';
    
    if (query.length > 0 && query.length < 2 && !isManual && !isFirstLoad.current) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setIsSearching(true);
    
    try {
      const apiParams = {
        q: query || undefined,
        page: p,
      };
      
      // Ajouter les facettes actives
      Object.entries(activeFacets).forEach(([key, value]) => {
        if (value) {
          apiParams[key] = value;
        }
      });
      
      if (searchParams.type) apiParams.type = searchParams.type;
      if (searchParams.language) apiParams.language = searchParams.language;
      if (searchParams.availability) apiParams.availability = searchParams.availability;
      if (searchParams.faculty) apiParams.faculty = searchParams.faculty;
      if (searchParams.annee_min) apiParams.annee_min = searchParams.annee_min;
      if (searchParams.annee_max) apiParams.annee_max = searchParams.annee_max;
      if (searchParams.auteur) apiParams.auteur = searchParams.auteur;
      if (searchParams.isbn) apiParams.isbn = searchParams.isbn;
      if (searchParams.sujet) apiParams.sujet = searchParams.sujet;
      if (searchParams.editeur) apiParams.editeur = searchParams.editeur;
      if (searchParams.collection) apiParams.collection = searchParams.collection;
      
      if (sort && sort !== 'pertinence') {
        apiParams.sort = sort;
      }
      
      const response = await searchCatalog(apiParams);
      
      if (response.data) {
        let items = [];
        let totalCount = 0;
        let facetsData = {};
        
        if (Array.isArray(response.data)) {
          items = response.data;
          totalCount = items.length;
        } else if (response.data.results) {
          items = response.data.results;
          totalCount = response.data.count || items.length;
          facetsData = response.data.facets || {};
        } else if (response.data.success !== false && Array.isArray(response.data.results)) {
          items = response.data.results;
          totalCount = response.data.count || response.data.total || items.length;
          facetsData = response.data.facets || {};
        } else if (response.data.notice) {
          items = [response.data.notice];
          totalCount = 1;
        } else {
          const dataKeys = Object.keys(response.data);
          const possibleResults = dataKeys.find(k => Array.isArray(response.data[k]) && response.data[k].length > 0);
          if (possibleResults) {
            items = response.data[possibleResults];
            totalCount = items.length;
          }
        }
        
        setResults(items);
        setTotal(totalCount);
        setFacets(facetsData);
        saveResults(items, totalCount, p, query);
        
        if (items.length === 0 && query) {
          addToast(isEnglish ? 'No results found for your search.' : 'Aucun résultat trouvé pour votre recherche.', 'info');
        }
        
        initialSearchDone.current = true;
        isFirstLoad.current = false;
      } else {
        setResults([]);
        setTotal(0);
        setFacets({});
        saveResults([], 0, p, query);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setResults([]);
      setTotal(0);
      setFacets({});
      if (searchParams.q) {
        addToast('Erreur lors de la recherche. Veuillez réessayer.', 'error');
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [addToast, saveResults, activeFacets]);

  // Recherche avec debounce
  const debouncedSearch = useCallback((searchParams, p, sort) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const query = searchParams.q || '';
    if (query.length > 0 && query.length < 2) {
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchParams, p, sort, false);
    }, 500);
  }, [performSearch]);

  // Recherche manuelle
  const manualSearch = useCallback((searchParams, p, sort) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(searchParams, p, sort, true);
  }, [performSearch]);

  // Effets
  useEffect(() => {
    const query = filters.q || '';
    if (query.length >= 2 || query.length === 0) {
      debouncedSearch(filters, page, sortBy);
    }
  }, [filters, page, sortBy, debouncedSearch]);

  useEffect(() => {
    const q = params.get('q') || '';
    if (q !== filters.q) {
      setFilters(prev => ({ ...prev, q }));
      setSearchInput(q);
      setPage(1);
    }
  }, [params]);

  useEffect(() => {
    if (isFirstLoad.current && results.length === 0) {
      const query = filters.q || '';
      if (query.length >= 2) {
        performSearch(filters, 1, sortBy, true);
      } else {
        performSearch(filters, 1, sortBy, true);
      }
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPage(1);
    setFilters(prev => ({ ...prev, q: searchInput }));
    manualSearch({ ...filters, q: searchInput }, 1, sortBy);
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    setFilters(prev => ({ ...prev, q: value }));
  };

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      type: '', language: '', availability: '', faculty: '',
      annee_min: '', annee_max: '', auteur: '', isbn: '', sujet: '',
      editeur: '', collection: ''
    }));
    setActiveFacets({});
    setSearchInput('');
    setPage(1);
    sessionStorage.removeItem('catalog_results');
    sessionStorage.removeItem('catalog_total');
    sessionStorage.removeItem('catalog_page');
    setResults([]);
    setTotal(0);
    setFacets({});
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const FACULTY_COLORS = {
    FALSH: '#6366f1', Sciences: '#059669', Polytech: '#0284c7',
    ENS: '#7c3aed', FSE: '#db2777', FMSB: '#dc2626',
    FSJP: '#d97706', 'UIT-Bois': '#65a30d'
  };

  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '48px 0 32px' }}>
        <div className="container">
          <h1 className="font-serif" style={{ fontSize: 40, color: 'white', fontWeight: 400, marginBottom: 8 }}>
            Catalogue <span style={{ color: 'var(--or)' }}>documentaire</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 32 }}>
            Recherchez parmi les ressources de la Bibliothèque Centrale
          </p>

          {/* Barre de recherche avec autocomplete */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: 800 }}>
            <SearchAutocomplete
              value={searchInput}
              onChange={handleSearchChange}
              onSearch={(query) => {
                setFilters(prev => ({ ...prev, q: query }));
                setPage(1);
                manualSearch({ ...filters, q: query }, 1, sortBy);
              }}
              placeholder="Titre, auteur, ISBN, sujet, mot-clé… (min. 2 caractères)"
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {searchInput.length > 0 && searchInput.length < 2 && (
                  <span style={{ color: 'var(--or)' }}>
                    ⚠️ Saisissez au moins 2 caractères pour la recherche automatique
                  </span>
                )}
              </div>
              <a
                href={PMB_OPAC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px'
                }}
              >
                Rechercher dans l’OPAC PMB
              </a>
            </div>
          </form>

          <button
            onClick={() => setAdvMode(v => !v)}
            style={{ marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <SlidersHorizontal size={14} />
            {advMode ? 'Masquer la' : 'Afficher la'} recherche avancée
          </button>

          {advMode && (
            <div style={{
              marginTop: 20, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 24,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16
            }}>
              {[
                { key: 'auteur', label: 'Auteur' },
                { key: 'isbn',   label: 'ISBN' },
                { key: 'sujet',  label: 'Sujet' },
                { key: 'editeur',label: 'Éditeur' },
                { key: 'collection', label: 'Collection' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    className="form-input"
                    value={filters[f.key] || ''}
                    onChange={e => updateFilter(f.key, e.target.value)}
                    placeholder={f.label}
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
                  Année (de – à)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input" type="number" placeholder="De" min="1900" max="2030"
                    value={filters.annee_min}
                    onChange={e => updateFilter('annee_min', e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  />
                  <input
                    className="form-input" type="number" placeholder="À" min="1900" max="2030"
                    value={filters.annee_max}
                    onChange={e => updateFilter('annee_max', e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar filtres */}
          <aside className="hide-mobile" style={{ width: 240, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 20px)' }}>
              {/* Filtres existants */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Filtres</span>
                <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                  Réinitialiser
                </button>
              </div>

              {user && (
                <div style={{ marginBottom: 24, padding: 12, background: 'var(--beige)', borderRadius: 10 }}>
                  <Link 
                    to="/favoris" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontWeight: 600,
                      color: 'var(--bleu-nuit)',
                      fontSize: 13
                    }}
                  >
                    <Heart size={16} fill="#ef4444" color="#ef4444" />
                    Mes favoris ({favorites.length})
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                </div>
              )}

              {/* Facettes de recherche */}
              <SearchFacets
                facets={facets}
                activeFacets={activeFacets}
                onFacetChange={handleFacetChange}
              />

              {/* Filtres existants */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Faculté
                </div>
                {FACULTIES.map(f => (
                  <label
                    key={f.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                      background: filters.faculty === f.id ? 'rgba(27,20,100,0.06)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <input
                      type="radio" name="faculty"
                      checked={filters.faculty === f.id}
                      onChange={() => updateFilter('faculty', f.id)}
                      style={{ display: 'none' }}
                    />
                    {f.id && (
                      <span style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: FACULTY_COLORS[f.id] || 'var(--bleu-nuit)',
                        flexShrink: 0
                      }} />
                    )}
                    <span style={{ fontSize: 13, fontWeight: filters.faculty === f.id ? 600 : 400 }}>
                      {f.label}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Type de document
                </div>
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={e => updateFilter('type', e.target.value)}
                >
                  {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Disponibilité
                </div>
                <select
                  className="form-select"
                  value={filters.availability}
                  onChange={e => updateFilter('availability', e.target.value)}
                >
                  {AVAIL.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Langue
                </div>
                <select
                  className="form-select"
                  value={filters.language}
                  onChange={e => updateFilter('language', e.target.value)}
                >
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* Résultats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--texte-muted)' }}>
                <strong style={{ color: 'var(--texte)' }}>{total.toLocaleString('fr-FR')}</strong> résultat{total !== 1 ? 's' : ''}
                {filters.q && <> pour <em>"{filters.q}"</em></>}
                {isSearching && ' 🔄 Recherche en cours...'}
                {Object.keys(activeFacets).length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--or)' }}>
                    • {Object.keys(activeFacets).length} filtre(s) actif(s)
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>

                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    onClick={() => {
                      setView('grid');
                      sessionStorage.setItem('catalog_view', 'grid');
                    }}
                    style={{
                      padding: '8px 12px', background: view === 'grid' ? 'var(--bleu-nuit)' : 'white',
                      color: view === 'grid' ? 'white' : 'var(--texte-muted)'
                    }}
                    title="Vue grille"
                  >
                    <Grid3X3 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setView('list');
                      sessionStorage.setItem('catalog_view', 'list');
                    }}
                    style={{
                      padding: '8px 12px', background: view === 'list' ? 'var(--bleu-nuit)' : 'white',
                      color: view === 'list' ? 'white' : 'var(--texte-muted)'
                    }}
                    title="Vue liste"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: 16, background: 'var(--red-bg)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, marginBottom: 20,
                color: '#b91c1c', fontSize: 14
              }}>
                {error}
              </div>
            )}

            {loading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
                gap: 16
              }}>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} view={view} />)}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {filters.q ? 'Aucun résultat trouvé' : 'Commencez votre recherche'}
                </h3>
                <p style={{ maxWidth: 400, margin: '0 auto', color: 'var(--texte-muted)' }}>
                  {filters.q 
                    ? `Aucun document ne correspond à "${filters.q}". Essayez avec d'autres termes ou consultez directement l'OPAC PMB.`
                    : 'Utilisez la barre de recherche ci-dessus pour trouver des documents dans le catalogue.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
                  {filters.q && (
                    <button onClick={clearFilters} className="btn btn-ghost">
                      <X size={14} /> Effacer les filtres
                    </button>
                  )}
                  <a
                    href={PMB_OPAC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-bleu"
                  >
                    Rechercher dans l’OPAC PMB
                  </a>
                </div>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
                  gap: 16,
                  marginBottom: 32
                }}>
                  {results.map((r, index) => {
                    const noticeId = r.id || r.noticeId || r.notice_id || '';
                    return (
                      <NoticeCard 
                        key={noticeId || index} 
                        notice={r} 
                        view={view}
                        isFavorite={isFavorite(noticeId)}
                        onToggleFavorite={updateFavorite}
                      />
                    );
                  })}
                </div>

                {/* Pagination améliorée */}
                {totalPages > 1 && !loading && (
                  <div className="pagination" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    flexWrap: 'wrap',
                    marginTop: 8
                  }}>
                    <button
                      className="page-btn"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border)',
                        background: 'white',
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        opacity: page === 1 ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    {/* Afficher les pages avec élision */}
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let p;
                      if (totalPages <= 7) {
                        p = i + 1;
                      } else if (page <= 4) {
                        p = i + 1;
                      } else if (page >= totalPages - 3) {
                        p = totalPages - 6 + i;
                      } else {
                        p = page - 3 + i;
                      }
                      return (
                        <button
                          key={p}
                          className={`page-btn ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-xs)',
                            border: p === page ? '2px solid var(--or)' : '1px solid var(--border)',
                            background: p === page ? 'var(--or)' : 'white',
                            color: p === page ? 'white' : 'var(--texte)',
                            fontWeight: p === page ? 700 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minWidth: 36,
                            textAlign: 'center'
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    
                    <button
                      className="page-btn"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border)',
                        background: 'white',
                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        opacity: page === totalPages ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .skeleton {
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4dd 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        /* Scrollbar personnalisée pour les suggestions */
        .search-autocomplete-suggestions::-webkit-scrollbar {
          width: 4px;
        }
        .search-autocomplete-suggestions::-webkit-scrollbar-track {
          background: var(--beige);
          border-radius: 2px;
        }
        .search-autocomplete-suggestions::-webkit-scrollbar-thumb {
          background: var(--or);
          border-radius: 2px;
        }
      `}</style>
    </Layout>
  );
}
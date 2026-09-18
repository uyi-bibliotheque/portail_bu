// pages/NoticeDetailPage.jsx - Version responsive pour mobile
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Download, Heart, Calendar, User,
  Hash, Globe, MapPin, BookMarked, Eye, Lock, AlertCircle, 
  ChevronRight, Loader2, Library, Building2, FileText, 
  BookCopy, Rss, Star, StarHalf, Award, ChevronLeft, Send,
  MessageCircle, Plus, ShoppingCart, ThumbsUp, Menu
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  getNotice, getFavorites, addFavorite, removeFavorite,
  addReview, suggestPurchase
} from '../services/endpoints';

const STATUS_MAP = {
  disponible:   { label: 'Disponible',        badge: 'badge-green' },
  emprunte:     { label: 'Emprunté',          badge: 'badge-amber' },
  consultation: { label: 'Consultation seule', badge: 'badge-slate' },
  'Disponible': { label: 'Disponible',        badge: 'badge-green' },
  'Emprunté':   { label: 'Emprunté',          badge: 'badge-amber' },
  'Consultation sur place': { label: 'Consultation seule', badge: 'badge-slate' },
};

const ACCESS_MAP = {
  public:      { icon: <Globe size={14} />,  label: 'Public',       badge: 'badge-green' },
  authentifie: { icon: <Eye size={14} />,    label: 'Authentifié',  badge: 'badge-blue' },
  restreint:   { icon: <Lock size={14} />,   label: 'Restreint',    badge: 'badge-red' },
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

export default function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoritesIds, setFavoritesIds] = useState([]);
  const [similarNotices, setSimilarNotices] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // États pour les avis
  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  // État pour la suggestion d'achat
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionData, setSuggestionData] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    year: '',
    reason: '',
    comment: ''
  });
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState(null);

  // Détecter le mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les favoris de l'utilisateur
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      try {
        const response = await getFavorites();
        const favs = response.data?.results || response.data || [];
        const ids = favs.map(f => f.pmb_notice_id || f.notice_id || f.noticeId || f.id).filter(id => id);
        setFavoritesIds(ids);
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      }
    };
    loadFavorites();
  }, [user]);

  // Vérifier si la notice actuelle est dans les favoris
  useEffect(() => {
    if (id && favoritesIds.length > 0) {
      setIsFavorite(favoritesIds.includes(id));
    }
  }, [id, favoritesIds]);

  // Pré-remplir la suggestion avec les infos de la notice
  useEffect(() => {
    if (notice) {
      setSuggestionData(prev => ({
        ...prev,
        title: notice.title || '',
        author: notice.authors?.join('; ') || '',
        publisher: notice.publisher || '',
        isbn: notice.isbn || '',
        year: notice.year || '',
      }));
    }
  }, [notice]);

  const loadNotice = async () => {
    if (!id) {
      setError('ID de notice manquant');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getNotice(id);
      
      let noticeData = null;
      let similarData = [];
      if (response.data) {
        if (response.data.notice) {
          noticeData = response.data.notice;
          similarData = response.data.similar || [];
        } else if (response.data.success !== false) {
          noticeData = response.data;
          similarData = response.data.similar || [];
        } else {
          noticeData = response.data;
        }
      }
      
      if (noticeData) {
        const formatted = formatNoticeData(noticeData);
        setNotice(formatted);
        setSimilarNotices(similarData);
      } else {
        setError('Notice non trouvée');
      }
    } catch (err) {
      console.error('Erreur chargement notice:', err);
      setError('Erreur lors du chargement de la notice. Veuillez réessayer.');
      addToast('Erreur lors du chargement de la notice', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotice();
  }, [id]);

  const formatNoticeData = (data) => {
    const title = data.title || data.titre || data.tit1 || 'Titre inconnu';
    
    let authors = [];
    if (data.authors && Array.isArray(data.authors)) {
      authors = data.authors;
    } else if (data.author) {
      authors = [data.author];
    } else if (data.auteur) {
      authors = [data.auteur];
    } else if (data.auteur_principal) {
      authors = [data.auteur_principal];
    } else {
      authors = ['Auteur inconnu'];
    }
    
    let coAuthors = [];
    if (data.co_authors && Array.isArray(data.co_authors)) {
      coAuthors = data.co_authors;
    } else if (data.auteurs_secondaires) {
      if (Array.isArray(data.auteurs_secondaires)) {
        coAuthors = data.auteurs_secondaires;
      } else {
        coAuthors = data.auteurs_secondaires.split('|').filter(a => a.trim());
      }
    }
    
    const docType = data.doc_type || data.type || data.typdoc || 'Livre';
    const statusKey = data.availability_status || data.availability || data.statut || 'disponible';
    const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP['disponible'];
    
    let items = data.items || data.exemplaires || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    if (!Array.isArray(items)) items = [];
    
    if (items.length === 0) {
      items = [{
        cb: 'EX001',
        cote: data.cote || data.class || 'N/A',
        location: data.location || data.faculty || 'Bibliothèque Centrale',
        status: statusKey,
        is_available: statusKey === 'disponible'
      }];
    }
    
    let categories = data.categories || [];
    if (typeof categories === 'string') {
      categories = categories.split('|').filter(c => c.trim());
    }
    if (!Array.isArray(categories)) categories = [];
    
    let subjects = data.subjects || [];
    if (typeof subjects === 'string') {
      subjects = subjects.split('|').filter(s => s.trim());
    }
    if (!Array.isArray(subjects)) subjects = [];
    
    return {
      id: data.id || data.noticeId || data.notice_id || id,
      title: title,
      authors: authors,
      co_authors: coAuthors,
      year: data.publication_year || data.year || data.year_pub || '',
      publisher: data.publisher || data.editeur || '',
      isbn: data.isbn || data.code || data.isbd || '',
      language: data.language || data.lang_code || 'Français',
      pages: data.pages || data.nb_pages || '',
      type: docType,
      cote: data.cote || data.class || '',
      subject: subjects.length > 0 ? subjects.join(' — ') : (data.subject || data.sujet || ''),
      collection: data.collection || data.coll1 || '',
      summary: data.summary || data.abstract || data.n_resume || data.resume || '',
      faculty: data.faculty || data.localisation || 'Bibliothèque Centrale',
      location: data.location || data.faculty || 'Bibliothèque Centrale',
      availability: statusKey,
      availability_label: statusInfo?.label || statusKey,
      availability_badge: statusInfo?.badge || 'badge-slate',
      icon: TYPE_ICONS[docType] || '📖',
      categories: categories,
      subjects: subjects,
      edition: data.edition || data.ed1 || '',
      contributors: data.contributors || [],
      url_cover: data.url_cover || '',
      url_full_text: data.url_full_text || '',
      is_available_for_loan: data.is_available_for_loan !== undefined ? data.is_available_for_loan : (statusKey === 'disponible'),
      can_be_reserved: data.can_be_reserved !== undefined ? data.can_be_reserved : true,
      exemplaires: items.map(item => ({
        id: item.cb || item.id || 'EX001',
        cote: item.cote || data.cote || 'N/A',
        localisation: item.location || data.location || 'Bibliothèque Centrale',
        statut: item.status || item.statut || statusKey,
        retour_le: item.retour_le || item.due_date || null,
        is_available: item.is_available !== undefined ? item.is_available : (statusKey === 'disponible')
      })),
      documents: [
        { id: 'doc1', nom: 'Préface & Table des matières', access: 'public', format: 'PDF', taille: '2.1 Mo' },
        { id: 'doc2', nom: 'Texte intégral', access: 'authentifie', format: 'PDF', taille: '28.4 Mo' }
      ]
    };
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      addToast('Connectez-vous pour ajouter aux favoris', 'warning');
      return;
    }
    
    if (!notice) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const favId = favoritesIds.find(f => f === id);
        if (favId) {
          await removeFavorite(favId);
        } else {
          await removeFavorite(id);
        }
        setIsFavorite(false);
        setFavoritesIds(prev => prev.filter(fid => fid !== id));
        addToast('Retiré des favoris', 'info');
      } else {
        const payload = {
          pmb_notice_id: id,
          note: `${notice.title} - ${notice.authors?.join(' ; ') || 'Auteur inconnu'}`
        };
        const response = await addFavorite(payload);
        setIsFavorite(true);
        setFavoritesIds(prev => [...prev, response.data?.id || id]);
        addToast('Ajouté aux favoris', 'success');
      }
    } catch (error) {
      console.error('Erreur gestion favori:', error);
      addToast('Erreur lors de la gestion des favoris', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ─── FONCTION handleAddReview CORRIGÉE ─────────────────────────
  const handleAddReview = async () => {
    if (!user) {
      addToast('Connectez-vous pour laisser un avis', 'warning');
      return;
    }
    
    if (!reviewComment.trim()) {
      setReviewMessage({ type: 'error', text: 'Veuillez ajouter un commentaire.' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      console.log('📝 Envoi avis - notice_id:', id);
      console.log('📝 Envoi avis - note:', reviewNote);
      console.log('📝 Envoi avis - comment:', reviewComment);
      
      const response = await addReview(id, reviewNote, reviewComment);
      
      console.log('✅ Réponse avis:', response);
      
      if (response.success) {
        setReviewMessage({ 
          type: 'success', 
          text: response.message || 'Votre avis a été ajouté avec succès !' 
        });
        setReviewComment('');
        setReviewNote(5);
        addToast('Avis ajouté avec succès !', 'success');
      } else {
        const errorMsg = response.detail || 'Erreur lors de l\'ajout de l\'avis.';
        setReviewMessage({ type: 'error', text: errorMsg });
        addToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      setReviewMessage({ 
        type: 'error', 
        text: 'Erreur de connexion. Veuillez réessayer.' 
      });
      addToast('Erreur de connexion', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSuggestionChange = (e) => {
    const { name, value } = e.target;
    setSuggestionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSuggestion = async () => {
    if (!user) {
      addToast('Connectez-vous pour faire une suggestion', 'warning');
      return;
    }
    
    if (!suggestionData.title.trim()) {
      setSuggestionMessage({ type: 'error', text: 'Le titre du document est requis.' });
      return;
    }

    setIsSubmittingSuggestion(true);
    setSuggestionMessage(null);

    try {
      const response = await suggestPurchase(suggestionData);
      if (response.success) {
        setSuggestionMessage({ type: 'success', text: 'Votre suggestion a été envoyée avec succès !' });
        setShowSuggestionForm(false);
        addToast('Suggestion d\'achat envoyée !', 'success');
      } else {
        setSuggestionMessage({ type: 'error', text: response.detail || 'Erreur lors de l\'envoi de la suggestion.' });
      }
    } catch (err) {
      setSuggestionMessage({ type: 'error', text: 'Erreur de connexion.' });
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  const handleReserve = () => {
    if (!user) {
      addToast('Connectez-vous pour réserver un exemplaire', 'warning');
      return;
    }
    addToast('Réservation envoyée avec succès !', 'success');
  };

  const handleDownload = (doc) => {
    if (doc.access === 'restreint') {
      addToast('Accès restreint — Contactez la bibliothèque', 'error');
      return;
    }
    if (doc.access === 'authentifie' && !user) {
      addToast('Connectez-vous pour accéder à ce document', 'warning');
      return;
    }
    addToast(`Téléchargement de "${doc.nom}" en cours…`, 'info');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    return (
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={isMobile ? 16 : 18} fill="var(--or)" color="var(--or)" />
        ))}
        {hasHalf && <StarHalf key="half" size={isMobile ? 16 : 18} fill="var(--or)" color="var(--or)" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={isMobile ? 16 : 18} color="var(--border)" />
        ))}
      </div>
    );
  };

  const handleBackToSearch = () => {
    navigate('/catalogue');
  };

  // Styles responsive
  const containerPadding = isMobile ? '24px 16px' : '48px 24px';
  const gapSize = isMobile ? 24 : 48;
  const titleFontSize = isMobile ? 24 : 32;
  const iconSize = isMobile ? 56 : 80;

  if (loading) {
    return (
      <Layout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 24px',
          minHeight: '60vh'
        }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--bleu-nuit)' }} />
          <p style={{ marginTop: 20, color: 'var(--texte-muted)' }}>Chargement de la notice...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  if (error || !notice) {
    return (
      <Layout>
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            {error || 'Notice non trouvée'}
          </h2>
          <p style={{ color: 'var(--texte-muted)', marginBottom: 24 }}>
            La notice que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <button onClick={handleBackToSearch} className="btn btn-bleu">
            <ArrowLeft size={16} /> Retour au catalogue
          </button>
        </div>
      </Layout>
    );
  }

  const n = notice;

  return (
    <Layout>
      {/* Breadcrumb avec bouton retour - responsive */}
      <div style={{ background: 'var(--bleu-nuit)', padding: isMobile ? '12px 0' : '16px 0' }}>
        <div className="container">
          <button
            onClick={handleBackToSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: isMobile ? 12 : 13,
              marginBottom: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={isMobile ? 12 : 14} /> Retour aux résultats
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            fontSize: isMobile ? 12 : 13, 
            color: 'rgba(255,255,255,0.6)', 
            flexWrap: 'wrap' 
          }}>
            <span style={{ 
              color: 'rgba(255,255,255,0.9)', 
              maxWidth: isMobile ? 200 : 300, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              {n.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: containerPadding }}>
        {/* Layout responsive: colonne unique sur mobile */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 2fr)', 
          gap: gapSize 
        }}>

          {/* ── Colonne gauche / En haut sur mobile ── */}
          <div>
            {/* Couverture */}
            <div style={{
              background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
              borderRadius: 'var(--radius)', 
              aspectRatio: isMobile ? '16/9' : '3/4',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: isMobile ? 16 : 24, 
              boxShadow: 'var(--shadow-md)', 
              overflow: 'hidden', 
              position: 'relative'
            }}>
              <div style={{ fontSize: iconSize, marginBottom: 16 }}>{n.icon || '📚'}</div>
              <div style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: isMobile ? 11 : 12, 
                fontWeight: 600, 
                textAlign: 'center', 
                padding: '0 20px' 
              }}>
                {n.collection || 'Bibliothèque Centrale'}
              </div>
              <div style={{
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                padding: isMobile ? '12px 16px' : '20px 16px 16px'
              }}>
                <span className={`badge ${n.availability_badge}`} style={{ fontSize: isMobile ? 11 : 12 }}>
                  {n.availability_label}
                </span>
              </div>
            </div>

            {/* Actions - disposition horizontale sur mobile */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'row' : 'column', 
              gap: isMobile ? 8 : 10,
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
              <button
                onClick={handleReserve}
                className="btn btn-bleu"
                style={{ 
                  justifyContent: 'center', 
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  fontSize: isMobile ? 13 : 14
                }}
                disabled={n.availability === 'consultation'}
              >
                <BookMarked size={isMobile ? 14 : 16} />
                {n.availability === 'disponible' ? 'Réserver' : 'Liste d\'attente'}
              </button>
              
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="btn btn-ghost"
                style={{ 
                  justifyContent: 'center',
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  fontSize: isMobile ? 13 : 14,
                  color: isFavorite ? '#ef4444' : 'var(--texte)',
                  borderColor: isFavorite ? '#ef4444' : 'var(--border)',
                  background: isFavorite ? 'rgba(239,68,68,0.05)' : 'transparent',
                }}
              >
                {favoriteLoading ? (
                  <Loader2 size={isMobile ? 14 : 16} className="spin" />
                ) : (
                  <Heart size={isMobile ? 14 : 16} fill={isFavorite ? '#ef4444' : 'none'} />
                )}
                <span className={isMobile ? 'hide-mobile-text' : ''}>
                  {isFavorite ? 'Retiré' : 'Favoris'}
                </span>
              </button>

              <button
                onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                className="btn btn-ghost"
                style={{ 
                  justifyContent: 'center',
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  fontSize: isMobile ? 13 : 14
                }}
              >
                <ShoppingCart size={isMobile ? 14 : 16} />
                <span className={isMobile ? 'hide-mobile-text' : ''}>Suggérer</span>
              </button>
            </div>

            {/* Métadonnées rapides - version compacte sur mobile */}
            <div style={{
              marginTop: isMobile ? 16 : 24, 
              background: 'var(--beige)', 
              borderRadius: 'var(--radius-sm)',
              padding: isMobile ? 14 : 20, 
              border: '1px solid var(--border)'
            }}>
              {/* Affichage en grille sur mobile, en liste sur desktop */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', 
                gap: isMobile ? 8 : 0 
              }}>
                {[
                  { Icon: User,      label: 'Auteur(s)',    value: n.authors?.join(' ; ') || 'Auteur inconnu' },
                  { Icon: Calendar,  label: 'Année',        value: n.year || 'Non spécifiée' },
                  { Icon: Hash,      label: 'ISBN',         value: n.isbn || 'Non disponible' },
                  { Icon: Globe,     label: 'Langue',       value: n.language || 'Non spécifiée' },
                  { Icon: BookOpen,  label: 'Pages',        value: n.pages ? `${n.pages} pages` : 'Non spécifié' },
                  { Icon: MapPin,    label: 'Cote',         value: n.cote || 'Non disponible' },
                  { Icon: Library,   label: 'Collection',   value: n.collection || 'Non spécifiée' },
                  { Icon: Building2, label: 'Éditeur',      value: n.publisher || 'Non spécifié' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} style={{ 
                    display: 'flex', 
                    gap: 10, 
                    alignItems: 'flex-start', 
                    marginBottom: isMobile ? 6 : 12 
                  }}>
                    <Icon size={isMobile ? 12 : 14} color="var(--texte-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ 
                        fontSize: isMobile ? 9 : 11, 
                        color: 'var(--texte-muted)', 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.04em' 
                      }}>
                        {label}
                      </div>
                      <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {n.subjects && n.subjects.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {n.subjects.map(s => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: isMobile ? 9 : 10 }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div>
            {/* Titre et informations */}
            <div style={{ marginBottom: isMobile ? 24 : 32 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="badge badge-or" style={{ fontSize: isMobile ? 10 : 12 }}>
                  {n.faculty || 'Bibliothèque Centrale'}
                </span>
                <span className="badge badge-slate" style={{ textTransform: 'capitalize', fontSize: isMobile ? 10 : 12 }}>
                  {n.type}
                </span>
                {n.availability === 'disponible' && (
                  <span className="badge badge-green" style={{ fontSize: isMobile ? 10 : 12 }}>✅ Disponible</span>
                )}
                {n.is_available_for_loan && (
                  <span className="badge badge-green" style={{ fontSize: isMobile ? 10 : 12 }}>📖 Empruntable</span>
                )}
              </div>
              <h1 className="font-serif" style={{ 
                fontSize: titleFontSize, 
                fontWeight: 400, 
                color: 'var(--bleu-nuit)', 
                lineHeight: 1.2, 
                marginBottom: 10 
              }}>
                {n.title}
              </h1>
              <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--texte-muted)', marginBottom: 6 }}>
                <strong>{n.authors?.join(' ; ') || 'Auteur inconnu'}</strong>
                {n.co_authors?.length > 0 && (
                  <span> ; {n.co_authors.join(' ; ')}</span>
                )}
              </p>
              {n.publisher && (
                <p style={{ fontSize: isMobile ? 12 : 13, color: 'var(--texte-light)' }}>
                  {n.publisher}{n.year ? `, ${n.year}` : ''}
                  {n.edition && ` — ${n.edition}`}
                </p>
              )}
              {n.isbn && (
                <p style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-light)' }}>
                  ISBN : {n.isbn}
                </p>
              )}
            </div>

            {/* Résumé - version compacte sur mobile */}
            {n.summary && (
              <div style={{ marginBottom: isMobile ? 24 : 36 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 10 }}>Résumé</h2>
                <p style={{ 
                  fontSize: isMobile ? 13 : 14, 
                  lineHeight: 1.7, 
                  color: 'var(--texte-muted)', 
                  whiteSpace: 'pre-line',
                  maxHeight: isMobile ? 200 : 'none',
                  overflow: isMobile ? 'hidden' : 'visible',
                  position: 'relative'
                }}>
                  {n.summary}
                </p>
              </div>
            )}

            {/* Sujets */}
            {n.subject && (
              <div style={{ marginBottom: isMobile ? 24 : 36 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 10 }}>Sujets</h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {n.subject.split(' — ').map(s => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: isMobile ? 10 : 12 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Exemplaires - table scrollable sur mobile */}
            {n.exemplaires && n.exemplaires.length > 0 && (
              <div style={{ marginBottom: isMobile ? 24 : 36 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 12 }}>Exemplaires disponibles</h2>
                <div style={{ 
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  margin: isMobile ? '0 -4px' : 0
                }}>
                  <table style={{ minWidth: isMobile ? 400 : '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ fontSize: isMobile ? 11 : 13 }}>Code</th>
                        <th style={{ fontSize: isMobile ? 11 : 13 }}>Localisation</th>
                        <th style={{ fontSize: isMobile ? 11 : 13 }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {n.exemplaires.map((ex, index) => {
                        const statusInfo = STATUS_MAP[ex.statut] || STATUS_MAP['disponible'];
                        return (
                          <tr key={ex.id || index}>
                            <td style={{ fontFamily: 'monospace', fontSize: isMobile ? 11 : 13 }}>{ex.cote}</td>
                            <td style={{ fontSize: isMobile ? 11 : 13 }}>{ex.localisation}</td>
                            <td>
                              <span className={`badge ${statusInfo?.badge || 'badge-slate'}`} style={{ fontSize: isMobile ? 9 : 11 }}>
                                {statusInfo?.label || ex.statut}
                              </span>
                              {ex.retour_le && (
                                <span style={{ fontSize: isMobile ? 9 : 11, color: 'var(--texte-light)', marginLeft: 4 }}>
                                  Retour : {new Date(ex.retour_le).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Avis - version compacte sur mobile */}
            <div style={{ marginBottom: isMobile ? 24 : 36 }}>
              <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 12 }}>
                <MessageCircle size={isMobile ? 16 : 18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Donner un avis
              </h2>

              {!user ? (
                <div style={{
                  padding: isMobile ? 12 : 16,
                  background: 'var(--beige)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  fontSize: isMobile ? 13 : 14,
                  color: 'var(--texte-muted)'
                }}>
                  <Link to="/connexion" style={{ color: 'var(--or)', fontWeight: 600 }}>Connectez-vous</Link> pour laisser un avis.
                </div>
              ) : (
                <div style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: isMobile ? 16 : 20
                }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--texte-muted)', marginBottom: 6 }}>
                      Votre note
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewNote(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: isMobile ? 2 : 4
                          }}
                        >
                          <Star 
                            size={isMobile ? 24 : 28} 
                            fill={star <= reviewNote ? 'var(--or)' : 'none'}
                            color={star <= reviewNote ? 'var(--or)' : 'var(--border)'}
                            style={{ transition: 'all 0.2s' }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Partagez votre avis sur ce document..."
                      style={{
                        width: '100%',
                        minHeight: isMobile ? 60 : 80,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: isMobile ? 13 : 14,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--or)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  {reviewMessage && (
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-xs)',
                      marginBottom: 10,
                      background: reviewMessage.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${reviewMessage.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
                      color: reviewMessage.type === 'success' ? 'var(--green)' : 'var(--red)',
                      fontSize: isMobile ? 12 : 13
                    }}>
                      {reviewMessage.text}
                    </div>
                  )}

                  <button
                    onClick={handleAddReview}
                    disabled={isSubmittingReview}
                    className="btn btn-bleu"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 6,
                      padding: isMobile ? '10px' : '12px',
                      fontSize: isMobile ? 13 : 14
                    }}
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 size={isMobile ? 14 : 16} className="spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send size={isMobile ? 14 : 16} /> Envoyer mon avis
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Suggestion d'achat - responsive */}
            {showSuggestionForm && (
              <div style={{ marginBottom: isMobile ? 24 : 36 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 12 }}>
                  <ShoppingCart size={isMobile ? 16 : 18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Suggérer un achat
                </h2>

                {!user ? (
                  <div style={{
                    padding: isMobile ? 12 : 16,
                    background: 'var(--beige)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    fontSize: isMobile ? 13 : 14,
                    color: 'var(--texte-muted)'
                  }}>
                    <Link to="/connexion" style={{ color: 'var(--or)', fontWeight: 600 }}>Connectez-vous</Link> pour faire une suggestion.
                  </div>
                ) : (
                  <div style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: isMobile ? 16 : 20
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                      gap: isMobile ? 10 : 12 
                    }}>
                      <div>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          Titre *
                        </label>
                        <input
                          name="title"
                          value={suggestionData.title}
                          onChange={handleSuggestionChange}
                          className="form-input"
                          placeholder="Titre du document"
                          style={{ fontSize: isMobile ? 12 : 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          Auteur
                        </label>
                        <input
                          name="author"
                          value={suggestionData.author}
                          onChange={handleSuggestionChange}
                          className="form-input"
                          placeholder="Auteur"
                          style={{ fontSize: isMobile ? 12 : 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          Éditeur
                        </label>
                        <input
                          name="publisher"
                          value={suggestionData.publisher}
                          onChange={handleSuggestionChange}
                          className="form-input"
                          placeholder="Éditeur"
                          style={{ fontSize: isMobile ? 12 : 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          ISBN
                        </label>
                        <input
                          name="isbn"
                          value={suggestionData.isbn}
                          onChange={handleSuggestionChange}
                          className="form-input"
                          placeholder="ISBN"
                          style={{ fontSize: isMobile ? 12 : 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          Année
                        </label>
                        <input
                          name="year"
                          value={suggestionData.year}
                          onChange={handleSuggestionChange}
                          className="form-input"
                          placeholder="Année de publication"
                          style={{ fontSize: isMobile ? 12 : 13 }}
                        />
                      </div>
                      <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                        <label style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'block', marginBottom: 4 }}>
                          Raison de la suggestion
                        </label>
                        <textarea
                          name="reason"
                          value={suggestionData.reason}
                          onChange={handleSuggestionChange}
                          className="form-textarea"
                          placeholder="Pourquoi ce document serait utile ? (cours, recherche, etc.)"
                          style={{ 
                            fontSize: isMobile ? 12 : 13, 
                            minHeight: isMobile ? 50 : 60 
                          }}
                        />
                      </div>
                    </div>

                    {suggestionMessage && (
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-xs)',
                        marginBottom: 10,
                        marginTop: 10,
                        background: suggestionMessage.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${suggestionMessage.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
                        color: suggestionMessage.type === 'success' ? 'var(--green)' : 'var(--red)',
                        fontSize: isMobile ? 12 : 13
                      }}>
                        {suggestionMessage.text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button
                        onClick={handleSubmitSuggestion}
                        disabled={isSubmittingSuggestion}
                        className="btn btn-bleu"
                        style={{ 
                          flex: 1,
                          padding: isMobile ? '10px' : '12px',
                          fontSize: isMobile ? 13 : 14
                        }}
                      >
                        {isSubmittingSuggestion ? (
                          <Loader2 size={isMobile ? 14 : 16} className="spin" />
                        ) : (
                          'Envoyer'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowSuggestionForm(false);
                          setSuggestionMessage(null);
                        }}
                        className="btn btn-ghost"
                        style={{ 
                          padding: isMobile ? '10px 16px' : '12px 20px',
                          fontSize: isMobile ? 13 : 14
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documents numériques - responsive */}
            {n.documents && n.documents.length > 0 && (
              <div style={{ marginBottom: isMobile ? 24 : 36 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 12 }}>Documents numériques</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {n.documents.map(doc => {
                    const acc = ACCESS_MAP[doc.access] || ACCESS_MAP['public'];
                    const denied = doc.access === 'restreint' || (doc.access === 'authentifie' && !user);
                    return (
                      <div
                        key={doc.id}
                        style={{
                          background: 'var(--beige)', 
                          border: '1px solid var(--border)',
                          borderRadius: 10, 
                          padding: isMobile ? '12px 14px' : '14px 18px',
                          display: 'flex', 
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'flex-start' : 'center', 
                          justifyContent: 'space-between',
                          gap: isMobile ? 8 : 12
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: isMobile ? 20 : 24 }}>📄</span>
                          <div>
                            <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>{doc.nom}</div>
                            <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', marginTop: 2 }}>
                              {doc.format} • {doc.taille}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: 8, 
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          width: isMobile ? '100%' : 'auto'
                        }}>
                          <span className={`badge ${acc.badge}`} style={{ fontSize: isMobile ? 9 : 11 }}>
                            {acc.icon} {acc.label}
                          </span>
                          {denied ? (
                            <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--texte-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertCircle size={isMobile ? 12 : 13} />
                              {doc.access === 'restreint' ? 'Accès refusé' : 'Connexion requise'}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDownload(doc)}
                              className="btn btn-bleu btn-sm"
                              style={{ 
                                fontSize: isMobile ? 11 : 12,
                                padding: isMobile ? '6px 12px' : '8px 16px'
                              }}
                            >
                              <Download size={isMobile ? 12 : 13} /> Télécharger
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notices similaires - responsive */}
            {similarNotices.length > 0 && (
              <div>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 12 }}>Notices similaires</h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: isMobile ? 10 : 12 
                }}>
                  {similarNotices.slice(0, isMobile ? 4 : 4).map((sim, index) => (
                    <Link
                      key={index}
                      to={`/catalogue/notice/${sim.id}`}
                      style={{
                        background: 'var(--beige)',
                        padding: isMobile ? '10px' : '12px',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        color: 'inherit',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        border: '1px solid var(--border)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--beige-dark)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--beige)';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 6 }}>📖</div>
                      <div style={{ 
                        fontSize: isMobile ? 11 : 12, 
                        fontWeight: 600, 
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {sim.title?.substring(0, 30)}...
                      </div>
                      <div style={{ fontSize: isMobile ? 10 : 11, color: 'var(--texte-muted)', marginTop: 4 }}>
                        {sim.authors?.[0] || 'Auteur inconnu'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
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
        
        @media (max-width: 480px) {
          .hide-mobile-text {
            display: none !important;
          }
        }
        
        @media (min-width: 481px) {
          .hide-mobile-text {
            display: inline !important;
          }
        }

        /* Amélioration du scroll sur mobile */
        .table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 -4px;
        }

        .table-wrap table {
          min-width: 400px;
          width: 100%;
        }

        /* Ajustement des boutons sur mobile */
        @media (max-width: 480px) {
          .btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .btn svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
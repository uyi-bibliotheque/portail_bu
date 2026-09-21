// pages/admin/AdminActualites.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper, Plus, Edit2, Trash2, Eye, Calendar,
  Clock, CheckCircle, XCircle, AlertCircle,
  ArrowLeft, RefreshCw, Search, Filter, Save,
  Image, Upload, Link as LinkIcon, X, FileText,
  Tags, Calendar as CalendarIcon, Globe, EyeOff,
  Check, ChevronDown, ChevronUp, Copy, ExternalLink
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getArticles, createArticle, updateArticle, deleteArticle
} from '../../services/endpoints';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── CONFIGURATION ──────────────────────────────────────────────

const CATEGORIES = [
  { value: 'Informations', label: 'Informations', color: '#3b82f6', icon: 'ℹ️' },
  { value: 'Acquisitions', label: 'Acquisitions', color: '#10B981', icon: '📚' },
  { value: 'Événements', label: 'Événements', color: '#8b5cf6', icon: '📅' },
  { value: 'Formation', label: 'Formation', color: '#F59E0B', icon: '🎓' },
  { value: 'Annonces', label: 'Annonces', color: '#ef4444', icon: '📢' },
  { value: 'Services', label: 'Services', color: '#06b6d4', icon: '🛠️' },
  { value: 'Ressources', label: 'Ressources', color: '#84cc16', icon: '📖' },
];

// ─── COMPOSANT FORMULAIRE ──────────────────────────────────────

function ArticleForm({ article, onSave, onCancel, loading: parentLoading }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || 'Informations',
    is_event: article?.is_event || false,
    event_date: article?.event_date || '',
    is_published: article?.is_published !== undefined ? article.is_published : true,
    publish_until: article?.publish_until || '',
    image: null,
    image_url: article?.image_url || '',
    existing_image: article?.image || null,
    remove_image: false,
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [useExternalUrl, setUseExternalUrl] = useState(!!article?.image_url);
  const [hasExistingImage, setHasExistingImage] = useState(!!article?.image || !!article?.image_url);
  const [errors, setErrors] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const isEdit = !!article?.id;

  // Charger l'aperçu de l'image existante
  useEffect(() => {
    if (article?.image) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      setImagePreview(`${baseUrl}${article.image}`);
      setHasExistingImage(true);
    } else if (article?.image_url) {
      setImagePreview(article.image_url);
      setHasExistingImage(true);
    }
  }, [article]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Le titre est requis';
    if (!form.content.trim()) newErrors.content = 'Le contenu est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image: file, image_url: '', remove_image: false }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setUseExternalUrl(false);
      setHasExistingImage(true);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setForm(f => ({ ...f, image_url: url, image: null, remove_image: false }));
    setImagePreview(url);
    setUseExternalUrl(true);
    setHasExistingImage(true);
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image: null, image_url: '', remove_image: true }));
    setImagePreview(null);
    setHasExistingImage(false);
    setUseExternalUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let response;

      // Cas: Mise à jour sans modification d'image
      if (isEdit && !form.image && !form.image_url && !form.remove_image) {
        const data = {
          title: form.title,
          content: form.content,
          category: form.category,
          is_event: form.is_event,
          event_date: form.event_date || null,
          is_published: form.is_published,
          publish_until: form.publish_until || null,
        };
        response = await updateArticle(article.id, data);
        addToast('✅ Article mis à jour avec succès', 'success');
        onSave?.();
        return;
      }

      // Cas avec image
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('category', form.category);
      formData.append('is_event', form.is_event ? 'true' : 'false');
      if (form.event_date) formData.append('event_date', form.event_date);
      formData.append('is_published', form.is_published ? 'true' : 'false');
      if (form.publish_until) formData.append('publish_until', form.publish_until);

      if (form.image && form.image instanceof File) {
        formData.append('image', form.image);
      } else if (form.image_url && form.image_url.trim()) {
        formData.append('image_url', form.image_url.trim());
      } else if (form.remove_image) {
        formData.append('image', '');
      }

      if (isEdit) {
        response = await updateArticle(article.id, formData);
        addToast('✅ Article mis à jour avec succès', 'success');
      } else {
        response = await createArticle(formData);
        addToast('✅ Article créé avec succès', 'success');
      }

      onSave?.();
    } catch (error) {
      console.error('❌ Erreur:', error);
      if (error.response) {
        const errorData = error.response.data;
        let errorMsg = 'Erreur lors de l\'enregistrement';
        if (typeof errorData === 'object') {
          const messages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' • ');
          errorMsg = messages || errorMsg;
        }
        addToast(`❌ ${errorMsg}`, 'error');
      } else {
        addToast('❌ Erreur lors de l\'enregistrement', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* En-tête du formulaire */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 8,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {isEdit ? '✏️ Modifier l\'article' : '📝 Nouvel article'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
            {isEdit ? `ID: ${article.id.slice(0, 8)}...` : 'Remplissez les champs ci-dessous'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-ghost btn-sm"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
            <X size={14} /> Annuler
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="form-group">
            <label className="form-label">
              Titre <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Titre de l'article"
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Contenu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Contenu de l'article..."
              style={{ minHeight: 200 }}
            />
            <div style={{ fontSize: 11, color: 'var(--texte-light)', marginTop: 4, textAlign: 'right' }}>
              {form.content.length} caractères
            </div>
            {errors.content && <div className="form-error">{errors.content}</div>}
          </div>

          {/* Gestion de l'image */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image size={16} /> Image d'illustration
            </label>
            
            {hasExistingImage && imagePreview && !form.remove_image && (
              <div style={{
                marginBottom: 12,
                padding: 12,
                background: 'var(--beige)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <img
                  src={imagePreview}
                  alt="Image actuelle"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 6
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Image actuelle</div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      marginTop: 4,
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <X size={14} /> Supprimer l'image
                  </button>
                </div>
              </div>
            )}

            {(!hasExistingImage || form.remove_image) && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setUseExternalUrl(false); setForm(f => ({ ...f, remove_image: false })); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 600,
                    background: !useExternalUrl ? 'var(--bleu-nuit)' : 'white',
                    color: !useExternalUrl ? 'white' : 'var(--texte)',
                    border: `1px solid ${!useExternalUrl ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Upload local
                </button>
                <button
                  type="button"
                  onClick={() => { setUseExternalUrl(true); setForm(f => ({ ...f, remove_image: false })); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 600,
                    background: useExternalUrl ? 'var(--bleu-nuit)' : 'white',
                    color: useExternalUrl ? 'white' : 'var(--texte)',
                    border: `1px solid ${useExternalUrl ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <LinkIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  URL externe
                </button>
              </div>
            )}

            {!useExternalUrl && (!hasExistingImage || form.remove_image) && (
              <div>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 12,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: form.image ? 'rgba(16,185,129,0.05)' : 'var(--beige)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--or)'; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setForm(f => ({ ...f, image: file, image_url: '', remove_image: false }));
                      const reader = new FileReader();
                      reader.onload = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                      setUseExternalUrl(false);
                      setHasExistingImage(true);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {form.image ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        style={{
                          maxHeight: 150,
                          maxWidth: '100%',
                          borderRadius: 8,
                          marginBottom: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>
                        ✅ Image sélectionnée
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setForm(f => ({ ...f, image: null })); 
                          setImagePreview(null);
                          setHasExistingImage(false);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{ marginTop: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                      >
                        <X size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 14, color: 'var(--texte-muted)' }}>
                        Cliquez ou glissez-déposez une image
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--texte-light)' }}>
                        PNG, JPG, GIF • Max 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {useExternalUrl && (!hasExistingImage || form.remove_image) && (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    value={form.image_url}
                    onChange={handleImageUrlChange}
                    placeholder="https://exemple.com/images/mon-image.jpg"
                    style={{ flex: 1 }}
                  />
                </div>
                {imagePreview && (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      style={{
                        maxHeight: 150,
                        maxWidth: '100%',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--texte-muted)', marginTop: 4 }}>
                  Utilisez une URL d'image externe (Cloudinary, Imgur, CDN, etc.)
                </div>
              </div>
            )}
          </div>

          {/* Autres champs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={form.is_published ? 'published' : 'draft'}
                onChange={e => setForm(f => ({ ...f, is_published: e.target.value === 'published' }))}
              >
                <option value="published">✅ Publié</option>
                <option value="draft">📝 Brouillon</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.is_event}
                  onChange={e => setForm(f => ({ ...f, is_event: e.target.checked }))}
                />
                Événement
              </label>
            </div>

            {form.is_event && (
              <div className="form-group">
                <label className="form-label">Date de l'événement</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date de suppression automatique</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.publish_until}
              onChange={e => setForm(f => ({ ...f, publish_until: e.target.value }))}
            />
            <div style={{ fontSize: 11, color: 'var(--texte-muted)', marginTop: 4 }}>
              L'article sera automatiquement retiré après cette date (laissez vide pour ne pas expirer)
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button 
              type="submit" 
              className="btn btn-bleu" 
              disabled={loading || parentLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Annuler
            </button>
          </div>
        </>
      )}
    </form>
  );
}

// ─── COMPOSANT CARTE ARTICLE ──────────────────────────────────

function ArticleCard({ article, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpired = article.publish_until && new Date(article.publish_until) < new Date();
  const imageUrl = article.image_display || article.image || article.image_url;
  const hasImage = imageUrl && !imageError;
  const categoryInfo = CATEGORIES.find(c => c.value === article.category);

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  };

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${isExpired ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: 20,
      transition: 'all 0.2s',
      display: 'flex',
      gap: 16,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Indicateur de statut */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        background: isExpired ? '#ef4444' : 
                   !article.is_published ? '#94a3b8' : 
                   '#10B981',
        borderRadius: '4px 0 0 4px'
      }} />

      {/* Miniature image */}
      {hasImage && (
        <div style={{
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--beige)',
          position: 'relative'
        }}>
          <img
            src={imageUrl}
            alt={article.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
          />
          {!article.is_published && (
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: '2px 8px',
              borderRadius: 50,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: 10,
              fontWeight: 600
            }}>
              Brouillon
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {categoryInfo && (
            <span className="badge badge-blue" style={{ 
              background: `${categoryInfo.color}15`, 
              color: categoryInfo.color 
            }}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
          )}
          {article.is_event && <span className="badge badge-or">📅 Événement</span>}
          {!article.is_published && <span className="badge badge-slate">📝 Brouillon</span>}
          {isExpired && <span className="badge badge-red">⏰ Expiré</span>}
        </div>

        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          {article.title}
        </h4>

        <p style={{
          fontSize: 13,
          color: 'var(--texte-muted)',
          lineHeight: 1.6,
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'none' : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {article.content}
        </p>

        {!isExpanded && article.content?.length > 150 && (
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              color: 'var(--or)',
              fontSize: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            Lire la suite...
          </button>
        )}

        {isExpanded && article.content?.length > 150 && (
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              color: 'var(--or)',
              fontSize: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            Réduire
          </button>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--texte-light)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {formatDate(article.created_at)}
          </span>
          {article.event_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarIcon size={12} />
              Événement: {formatDate(article.event_date)}
            </span>
          )}
          {article.publish_until && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} />
              Expire: {formatDate(article.publish_until)}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button 
          onClick={() => onEdit(article)} 
          className="btn btn-ghost btn-sm"
          title="Modifier"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => {
            if (confirm(`Supprimer l'article "${article.title}" ?`)) onDelete(article.id);
          }}
          className="btn btn-ghost btn-sm"
          style={{ color: '#ef4444' }}
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────

export default function AdminActualites() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list ou grid

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getArticles();
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setArticles(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
      addToast('Erreur chargement des articles', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isStaff) loadArticles();
  }, [isStaff, loadArticles]);

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id);
      addToast('🗑️ Article supprimé avec succès', 'success');
      loadArticles();
    } catch (error) {
      addToast('Erreur suppression', 'error');
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArticle(null);
    loadArticles();
  };

  const filteredArticles = articles.filter(a => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.content?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || a.category === filterCategory;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && a.is_published) ||
      (filterStatus === 'draft' && !a.is_published) ||
      (filterStatus === 'expired' && a.publish_until && new Date(a.publish_until) < new Date());
    return matchSearch && matchCategory && matchStatus;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.is_published).length,
    draft: articles.filter(a => !a.is_published).length,
    expired: articles.filter(a => a.publish_until && new Date(a.publish_until) < new Date()).length,
    events: articles.filter(a => a.is_event).length,
  };

  if (!isStaff) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Accès réservé au personnel</h2>
          <Link to="/" className="btn btn-bleu" style={{ marginTop: 20 }}>
            Retour à l'accueil
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: '32px 0 24px' }}>
        <div className="container">
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              marginBottom: 16,
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
                Actualités <span style={{ color: 'var(--or)' }}>& Événements</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
                Gérez les actualités et événements du portail
              </p>
            </div>
            <button 
              onClick={() => { setEditingArticle(null); setShowForm(true); }} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={18} /> Nouvel article
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>
        {showForm ? (
          <div style={{ 
            background: 'white', 
            borderRadius: 'var(--radius-sm)', 
            padding: 24, 
            border: '1px solid var(--border)',
            marginBottom: 24
          }}>
            <ArticleForm
              article={editingArticle}
              onSave={handleFormClose}
              onCancel={handleFormClose}
              loading={loading}
            />
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 12,
              marginBottom: 24
            }}>
              {[
                { label: 'Total', value: stats.total, color: 'var(--bleu-nuit)' },
                { label: 'Publiés', value: stats.published, color: '#10B981' },
                { label: 'Brouillons', value: stats.draft, color: '#94a3b8' },
                { label: 'Expirés', value: stats.expired, color: '#ef4444' },
                { label: 'Événements', value: stats.events, color: '#8b5cf6' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--texte-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filtres et recherche */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--texte-light)' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    style={{
                      padding: '8px 12px 8px 36px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: 13,
                      width: '100%',
                      background: 'white'
                    }}
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 13,
                    background: 'white'
                  }}
                >
                  <option value="all">Toutes les catégories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 13,
                    background: 'white'
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="published">✅ Publiés</option>
                  <option value="draft">📝 Brouillons</option>
                  <option value="expired">⏰ Expirés</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="btn btn-ghost btn-sm"
                  title={viewMode === 'list' ? 'Vue grille' : 'Vue liste'}
                >
                  {viewMode === 'list' ? '📊' : '📋'}
                </button>
                <button onClick={loadArticles} className="btn btn-ghost btn-sm">
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
              </div>
            </div>

            {/* Liste des articles */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
                <h3>Aucun article</h3>
                <p style={{ color: 'var(--texte-muted)' }}>
                  {search || filterCategory !== 'all' || filterStatus !== 'all'
                    ? 'Aucun article ne correspond à vos critères.'
                    : 'Aucun article trouvé. Créez votre premier article !'}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12,
                ...(viewMode === 'grid' ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                } : {})
              }}>
                {filteredArticles.map(a => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Layout>
  );
}
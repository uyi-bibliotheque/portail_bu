// pages/ActualitesPage.jsx - VERSION COMPLÈTE AVEC BOUTON RETOUR VISIBLE
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Share2, ChevronRight, ArrowLeft, Clock, AlertCircle, Home } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { getArticles, getArticle } from '../services/endpoints';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORIES = [
  { fr: 'Toutes', en: 'All' },
  { fr: 'Acquisitions', en: 'Acquisitions' },
  { fr: 'Événements', en: 'Events' },
  { fr: 'Informations', en: 'Information' },
  { fr: 'Formation', en: 'Training' },
  { fr: 'Annonces', en: 'Announcements' },
  { fr: 'Services', en: 'Services' },
  { fr: 'Ressources', en: 'Resources' },
];

// ─── FONCTION POUR OBTENIR L'URL DE L'IMAGE ─────────────────────

// ─── FONCTION POUR OBTENIR L'URL DE L'IMAGE ─────────────────────
export function getImageUrl(article) {
  if (!article) return null;

  const normalizeUrl = (value) => {
    if (!value) return null;

    // Convertit les anciennes URLs localhost en chemins relatifs
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

    // URLs externes réelles
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Chemin média déjà correct
    if (value.startsWith('/media/')) {
      return value;
    }

    // Chemin news_images/...
    if (value.startsWith('news_images/')) {
      return `/media/${value}`;
    }

    // Normalisation
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

// ─── COMPOSANT BOUTON RETOUR À L'ACCUEIL ─────────────────────────
// ✅ Bouton bien visible sur PC et mobile avec traduction
function BackHomeButton({ variant = 'light' }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const navigate = useNavigate();

  const isDark = variant === 'dark';

  return (
    <button
      onClick={() => navigate('/')}
      className="back-home-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 50,
        fontSize: 13,
        fontWeight: 600,
        background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)',
        color: isDark ? 'white' : 'var(--bleu-nuit)',
        border: isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(27,20,100,0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        fontFamily: 'inherit',
        boxShadow: isDark
          ? '0 4px 16px rgba(0,0,0,0.15)'
          : '0 4px 16px rgba(0,0,0,0.08)',
        textDecoration: 'none',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = isDark
          ? 'rgba(255,255,255,0.25)'
          : 'white';
        e.currentTarget.style.borderColor = 'var(--or)';
        e.currentTarget.style.color = isDark ? 'white' : 'var(--or)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = isDark
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(255,255,255,0.95)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(255,255,255,0.3)'
          : 'rgba(27,20,100,0.1)';
        e.currentTarget.style.color = isDark ? 'white' : 'var(--bleu-nuit)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 16px rgba(0,0,0,0.15)'
          : '0 4px 16px rgba(0,0,0,0.08)';
      }}
      aria-label={isEnglish ? 'Back to home' : "Retour à l'accueil"}
      title={isEnglish ? 'Back to home' : "Retour à l'accueil"}
    >
      <Home size={16} aria-hidden="true" />
      <span>{isEnglish ? 'Back to home' : "Retour à l'accueil"}</span>
    </button>
  );
}

// ─── COMPOSANT CARTE ARTICLE ─────────────────────────────────────

function ArticleCard({ article }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = getImageUrl(article);
  const hasImage = imageUrl && !imageError;

  return (
    <Link
      to={`/actualites/${article.id}`}
      style={{
        display: 'block',
        background: 'white',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textDecoration: 'none',
        color: 'inherit'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <div style={{
        height: 200,
        background: hasImage ? 'transparent' : 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {hasImage ? (
          <>
            {imageLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }} />
              </div>
            )}
            <img
              src={imageUrl}
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                opacity: imageLoading ? 0 : 1,
                transition: 'opacity 0.4s'
              }}
              onLoad={() => {
                console.log('✅ Image chargée:', imageUrl);
                setImageLoading(false);
              }}
              onError={() => {
                console.error('❌ Erreur chargement image:', imageUrl);
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            color: 'rgba(255,255,255,0.3)',
            fontSize: 48
          }}>
            <span>{article.is_event ? '📅' : '📰'}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>
              {article.category || 'Actualité'}
            </span>
          </div>
        )}

        {/* Badge catégorie */}
        {article.category && (
          <span style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 14px',
            borderRadius: 50,
            fontSize: 10,
            fontWeight: 600,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            zIndex: 2
          }}>
            {article.category}
          </span>
        )}

        {/* Badge événement */}
        {article.is_event && (
          <span style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            padding: '4px 14px',
            borderRadius: 50,
            fontSize: 10,
            fontWeight: 600,
            background: 'var(--or)',
            color: 'white',
            zIndex: 2
          }}>
            📅 Événement
          </span>
        )}
      </div>

      {/* Contenu */}
      <div style={{ padding: '20px' }}>
        <h2 style={{
          fontWeight: 700,
          fontSize: 16,
          lineHeight: 1.4,
          marginBottom: 10,
          color: 'var(--bleu-nuit)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {article.title}
        </h2>

        <p style={{
          fontSize: 13,
          color: 'var(--texte-muted)',
          lineHeight: 1.6,
          marginBottom: 14,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {article.content?.substring(0, 150).replace(/\*\*/g, '')}…
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--texte-light)',
          borderTop: '1px solid var(--border)',
          paddingTop: 12
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {new Date(article.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          {article.is_event && article.event_date && (
            <span style={{ color: 'var(--or)', fontWeight: 600, fontSize: 11 }}>
              📅 {new Date(article.event_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── LISTE DES ARTICLES ─────────────────────────────────────────

function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [category, setCategory] = useState(isEnglish ? 'All' : 'Toutes');

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getArticles();
        const data = response.data?.results || response.data || [];
        setArticles(data);
      } catch (error) {
        console.error('❌ Erreur chargement articles:', error);
        setError(isEnglish
          ? 'Unable to load news. Please try again.'
          : 'Impossible de charger les actualités. Veuillez réessayer.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [isEnglish]);

  // Reset category quand la langue change
  useEffect(() => {
    setCategory(isEnglish ? 'All' : 'Toutes');
  }, [isEnglish]);

  const displayed = articles.filter(a => {
    const selectedCategory = isEnglish ? 'All' : 'Toutes';
    return category === selectedCategory || a.category === category;
  });
  const sortedArticles = [...displayed].sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Filtres */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 36,
        flexWrap: 'wrap',
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {CATEGORIES.map(c => {
          const label = isEnglish ? c.en : c.fr;
          return (
            <button
              key={label}
              onClick={() => setCategory(label)}
              style={{
                padding: '8px 20px',
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 600,
                background: category === label ? 'var(--bleu-nuit)' : 'white',
                color: category === label ? 'white' : 'var(--texte)',
                border: `1px solid ${category === label ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'rgba(239,68,68,0.05)',
          borderRadius: 12,
          border: '1px solid rgba(239,68,68,0.15)'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#b91c1c', marginBottom: 8 }}>
            {isEnglish ? 'Loading error' : 'Erreur de chargement'}
          </h3>
          <p style={{ color: 'var(--texte-muted)' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            marginTop: 16,
            padding: '10px 24px',
            background: 'var(--bleu-nuit)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}>
            {isEnglish ? 'Retry' : 'Réessayer'}
          </button>
        </div>
      ) : loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              height: 340,
              borderRadius: 12,
              background: 'var(--beige)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite'
            }} />
          ))}
        </div>
      ) : sortedArticles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
            {isEnglish ? 'No news' : 'Aucune actualité'}
          </h3>
          <p style={{ color: 'var(--texte-muted)' }}>
            {category === (isEnglish ? 'All' : 'Toutes')
              ? (isEnglish ? 'No news available at the moment.' : 'Aucune actualité disponible pour le moment.')
              : (isEnglish ? `No news in the "${category}" category.` : `Aucune actualité dans la catégorie "${category}".`)}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24
        }}>
          {sortedArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE DÉTAIL ARTICLE ────────────────────────────────────────

export function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getArticle(id);
        setArticle(response.data);
      } catch (error) {
        console.error('❌ Erreur chargement article:', error);
        if (error.response?.status === 404) {
          setError(isEnglish ? 'Article not found.' : 'Article non trouvé.');
        } else {
          setError(isEnglish ? 'Unable to load the article. Please try again.' : 'Impossible de charger l\'article. Veuillez réessayer.');
        }
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id, isEnglish]);

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(isEnglish ? '✅ Link copied to clipboard!' : '✅ Lien copié dans le presse-papier !'))
        .catch(() => alert(isEnglish ? '📋 Copy the link from the address bar' : '📋 Copiez le lien depuis la barre d\'adresse'));
    }
  };

  const imageUrl = getImageUrl(article);
  const hasImage = imageUrl && !imageError;

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div style={{
            height: 60,
            width: '60%',
            margin: '0 auto 24px',
            background: 'var(--beige)',
            borderRadius: 8,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }} />
          <div style={{
            height: 400,
            maxWidth: 800,
            margin: '0 auto',
            background: 'var(--beige)',
            borderRadius: 12,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite'
          }} />
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
            {isEnglish ? 'Article not found' : 'Article non trouvé'}
          </h3>
          <p style={{ color: 'var(--texte-muted)' }}>
            {error || (isEnglish ? 'The article you are looking for does not exist or has been removed.' : 'L\'article que vous recherchez n\'existe pas ou a été supprimé.')}
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/actualites" style={{
              padding: '10px 24px',
              background: 'var(--bleu-nuit)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              {isEnglish ? 'Back to news' : 'Retour aux actualités'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const articleSchema = {
    headline: article.title,
    description: article.content?.substring(0, 180).replace(/\s+/g, ' ') || 'Actualité de la Bibliothèque Centrale Universitaire de Yaoundé I.',
    image: getImageUrl(article) || 'https://bcu-uyi.cm/logo.png',
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Bibliothèque Centrale Universitaire de Yaoundé I'
    },
    publisher: {
      '@type': 'Organization',
      name: 'BCU UYI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bcu-uyi.cm/logo.png'
      }
    },
    mainEntityOfPage: `https://bcu-uyi.cm/actualites/${article.id}`
  };

  return (
    <>
      <Seo
        title={article.title}
        path={`/actualites/${article.id}`}
        description={article.content?.substring(0, 155).replace(/\s+/g, ' ') || 'Actualité de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
        keywords={article.category ? `${article.category}, actualités, bibliothèque UYI` : 'actualités bibliothèque UYI'}
        canonical={`https://bcu-uyi.cm/actualites/${article.id}`}
        articleSchema={articleSchema}
      />
      <Layout>
        {/* Header avec bouton retour visible */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
          padding: '24px 0'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16
            }}>
              <BackHomeButton variant="dark" />

              <button
                onClick={() => navigate('/actualites')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '10px 20px',
                  borderRadius: 50,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.borderColor = 'var(--or)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <ArrowLeft size={14} /> {isEnglish ? 'Back to news' : 'Retour aux actualités'}
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              flexWrap: 'wrap'
            }}>
              <Link to="/actualites" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                {isEnglish ? 'News' : 'Actualités'}
              </Link>
              <ChevronRight size={12} />
              <span style={{
                color: 'rgba(255,255,255,0.9)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 300
              }}>
                {article?.title}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
          {/* Image */}
          {hasImage ? (
            <div style={{
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 32,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              {imageLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }} />
                </div>
              )}
              <img
                src={imageUrl}
                alt={article.title}
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  display: 'block',
                  opacity: imageLoading ? 0 : 1,
                  transition: 'opacity 0.4s'
                }}
                onLoad={() => {
                  console.log('✅ Image détail chargée:', imageUrl);
                  setImageLoading(false);
                }}
                onError={() => {
                  console.error('❌ Erreur chargement image détail:', imageUrl);
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          ) : (
            <div style={{
              borderRadius: 12,
              marginBottom: 32,
              height: 80,
              background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: 'rgba(255,255,255,0.2)'
            }}>
              {article.is_event ? '📅' : '📰'}
            </div>
          )}

          {/* Métadonnées */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 14px',
                borderRadius: 50,
                fontSize: 11,
                fontWeight: 600,
                background: article.is_event ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                color: article.is_event ? '#F59E0B' : '#3b82f6'
              }}>
                {article.is_event ? (isEnglish ? '📅 Event' : '📅 Événement') : (isEnglish ? '📰 News' : '📰 Actualité')}
              </span>
              {article.category && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 14px',
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(148,163,184,0.12)',
                  color: '#64748b'
                }}>
                  {article.category}
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 400,
              lineHeight: 1.25,
              marginBottom: 16,
              color: 'var(--bleu-nuit)',
              fontFamily: 'serif'
            }}>
              {article.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--texte-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} />
                  {new Date(article.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                {article.is_event && article.event_date && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--or)',
                    fontWeight: 600
                  }}>
                    <Calendar size={13} />
                    {new Date(article.event_date).toLocaleString(isEnglish ? 'en-US' : 'fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <button onClick={share} style={{
                padding: '6px 16px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'transparent',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--or)'; e.currentTarget.style.color = 'var(--or)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--texte)'; }}
              >
                <Share2 size={14} /> {isEnglish ? 'Share' : 'Partager'}
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 32 }} />

          {/* Contenu */}
          <div style={{
            fontSize: 16,
            lineHeight: 2,
            color: 'var(--texte)',
            whiteSpace: 'pre-line'
          }}>
            {article.content}
          </div>

          {/* CTA événement */}
          {article.is_event && (
            <div style={{
              marginTop: 48,
              padding: 32,
              background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
              borderRadius: 12,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 8, fontSize: 20 }}>
                {isEnglish ? 'Join this event' : 'Participer à cet événement'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>
                {isEnglish
                  ? 'Register via the contact form or come directly to the library.'
                  : 'Inscrivez-vous via le formulaire de contact ou présentez-vous directement à la bibliothèque.'}
              </p>
              <Link to="/contact" style={{
                padding: '12px 32px',
                background: 'var(--or)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                {isEnglish ? 'Contact us' : 'Nous contacter'}
              </Link>
            </div>
          )}

          {/* Navigation bas de page */}
          <div style={{
            marginTop: 48,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button onClick={() => navigate('/actualites')} style={{
              padding: '10px 20px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'transparent',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--or)'; e.currentTarget.style.color = 'var(--or)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--texte)'; }}
            >
              <ArrowLeft size={14} /> {isEnglish ? 'Back to news' : 'Retour aux actualités'}
            </button>
            <Link to="/" style={{
              padding: '10px 24px',
              background: 'var(--bleu-nuit)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Home size={16} /> {isEnglish ? 'Home' : 'Accueil'}
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Layout>
    </>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────

export default function ActualitesPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <>
      <Seo
        title={isEnglish ? 'News and events' : 'Actualités et événements'}
        path="/actualites"
        description={isEnglish
          ? 'Follow the news, events, training and announcements of the Central University Library of Yaoundé I.'
          : 'Suivez les actualités, événements, formations et annonces de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
        keywords="actualités bibliothèque, événements UYI, annonces bibliothèques, formation documentaire, BCU UYI"
        canonical="https://bcu-uyi.cm/actualites"
      />
      <Layout>
        {/* Header avec bouton retour bien visible */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
          padding: '32px 0 32px'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            {/* ✅ Bouton retour à l'accueil BIEN VISIBLE */}
            <div style={{ marginBottom: 20 }}>
              <BackHomeButton variant="dark" />
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: 'white',
              fontWeight: 400,
              marginBottom: 8,
              fontFamily: 'serif'
            }}>
              {isEnglish ? 'News & ' : 'Actualités & '}
              <span style={{ color: 'var(--or)' }}>{isEnglish ? 'Events' : 'Événements'}</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
              {isEnglish
                ? 'All the latest updates from the Central Library of the University of Yaoundé I'
                : 'Toutes les nouvelles de la Bibliothèque Centrale de l\'Université de Yaoundé I'}
            </p>
          </div>
        </div>
        <ArticlesList />
      </Layout>
    </>
  );
}

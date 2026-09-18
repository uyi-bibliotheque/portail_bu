// pages/FavorisPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, BookOpen, Star, TrendingUp, ArrowLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getFavorites, searchCatalog } from '../services/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function FavorisPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          const favRes = await getFavorites();
          setFavorites(favRes.data?.results || favRes.data || []);
        }
        
        const popRes = await searchCatalog({ q: '', page: 1 });
        let items = [];
        if (popRes.data?.results) {
          items = popRes.data.results;
        } else if (Array.isArray(popRes.data)) {
          items = popRes.data;
        }
        setPopular(items.slice(0, 6));
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <Layout>
      {/* Header avec bouton retour */}
      <div style={{ background: 'var(--bleu-nuit)', padding: '32px 0 24px' }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              marginBottom: 16,
              transition: 'color 0.2s',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400, marginBottom: 8 }}>
            Mes <span style={{ color: 'var(--or)' }}>Favoris</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Vos documents préférés et les plus populaires
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Favoris de l'utilisateur */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Heart size={24} color="#ef4444" fill="#ef4444" />
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Mes favoris</h2>
            <Link 
              to="/catalogue" 
              style={{ 
                marginLeft: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                color: 'var(--bleu-nuit)',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              <BookOpen size={14} /> Explorer le catalogue <ChevronRight size={14} />
            </Link>
          </div>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius)' }} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <p style={{ color: 'var(--texte-muted)' }}>
                Vous n'avez pas encore de favoris.
              </p>
              <Link to="/catalogue" className="btn btn-bleu" style={{ marginTop: 16 }}>
                <BookOpen size={16} /> Explorer le catalogue
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {favorites.map(fav => (
                <Link
                  key={fav.id}
                  to={`/catalogue/notice/${fav.pmb_notice_id || fav.notice_id || fav.id}`}
                  className="card"
                  style={{ padding: 20, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                  <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{fav.title || 'Titre inconnu'}</h3>
                  <p style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                    {fav.author || fav.authors || 'Auteur inconnu'}
                  </p>
                  {fav.note && (
                    <p style={{ fontSize: 11, color: 'var(--texte-light)', marginTop: 8, fontStyle: 'italic' }}>
                      {fav.note}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Documents populaires */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <TrendingUp size={24} color="var(--or)" />
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Documents populaires</h2>
          </div>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius)' }} />
              ))}
            </div>
          ) : popular.length === 0 ? (
            <div className="empty-state">
              <p style={{ color: 'var(--texte-muted)' }}>Aucun document populaire pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {popular.map((doc, index) => (
                <Link
                  key={doc.id || index}
                  to={`/catalogue/notice/${doc.id}`}
                  className="card"
                  style={{ padding: 20, textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
                  <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{doc.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                    {Array.isArray(doc.authors) ? doc.authors.join(' ; ') : doc.author || 'Auteur inconnu'}
                  </p>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--or)' }}>
                    <Star size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Populaire
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Bouton retour en bas */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            style={{ padding: '12px 32px' }}
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <Link 
            to="/catalogue" 
            className="btn btn-bleu" 
            style={{ marginLeft: 12, padding: '12px 32px' }}
          >
            <BookOpen size={16} /> Retour au catalogue
          </Link>
        </div>
      </div>
    </Layout>
  );
}
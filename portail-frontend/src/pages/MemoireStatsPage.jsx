// pages/MemoireStatsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, AlertCircle, XCircle,
  TrendingUp, Users, BookOpen, ArrowLeft, BarChart2
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getMemoireStats, listMemoires } from '../services/endpoints';

export default function MemoireStatsPage() {
  const { user, isStaff } = useAuth();
  const [stats, setStats] = useState(null);
  const [memoires, setMemoires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const statsRes = await getMemoireStats();
        setStats(statsRes.data);
        
        const memoiresRes = await listMemoires({ status: 'en_attente' });
        setMemoires(memoiresRes.data?.results || memoiresRes.data || []);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!isStaff) return <Navigate to="/" replace />;

  const statusConfigs = [
    { key: 'incomplet', label: 'Incomplets', icon: <AlertCircle size={16} />, color: '#94a3b8' },
    { key: 'en_attente', label: 'En attente', icon: <Clock size={16} />, color: '#F59E0B' },
    { key: 'valide', label: 'Validés', icon: <CheckCircle size={16} />, color: '#10B981' },
    { key: 'quitus_genere', label: 'Quitus générés', icon: <FileText size={16} />, color: '#3b82f6' },
    { key: 'quitus_signe', label: 'Quitus signés', icon: <CheckCircle size={16} />, color: '#10B981' },
    { key: 'rejete', label: 'Rejetés', icon: <XCircle size={16} />, color: '#ef4444' },
  ];

  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '32px 0 24px' }}>
        <div className="container">
          <Link
            to="/dashboard"
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
          <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
            Gestion des <span style={{ color: 'var(--or)' }}>Mémoires</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Suivez et gérez les dépôts de mémoires et thèses
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Statistiques */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--bleu-nuit)' }}>{stats.total || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>Total</div>
            </div>
            {statusConfigs.map(sc => (
              <div key={sc.key} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: sc.color }}>{stats[sc.key] || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--texte-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {sc.icon} {sc.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* En attente de validation */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color="var(--amber)" />
            En attente de validation
            {memoires.length > 0 && (
              <span className="badge badge-amber">{memoires.length}</span>
            )}
          </h3>

          {loading ? (
            <div className="skeleton" style={{ height: 60 }} />
          ) : memoires.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--texte-muted)' }}>
              <CheckCircle size={32} color="var(--green)" style={{ marginBottom: 8 }} />
              <p>Aucun mémoire en attente de validation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {memoires.map(m => (
                <div key={m.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--beige)',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                      {m.author_full_name || m.author_name} • {m.department}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/dashboard/memoires/${m.id}`} className="btn btn-bleu btn-sm">
                      <Eye size={13} /> Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
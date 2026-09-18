// pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart2, BookOpen, Download, Search, Users, FileText,
  TrendingUp, Clock, Settings, Bell, LogOut, ChevronRight, Eye, ArrowLeft,
  RefreshCw, AlertCircle, UserPlus, Newspaper, FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  getDashboardStats,
  getDashboardChart,
  getTopDocuments,
  getRecentActivity,
  getMemoireStats,
  getUnreadCount
} from '../services/endpoints';

// ── Composants ────────────────────────────────────────────────────
function MetricCard({ value, label, icon, trend, color = '#1B1464', loading }) {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '20px',
        display: 'flex',
        gap: 16,
        alignItems: 'center'
      }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: '80%' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '20px',
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      transition: 'all 0.2s'
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        flexShrink: 0,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color }}>
          {value !== undefined && value !== null ? value.toLocaleString('fr-FR') : '0'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--texte-muted)', marginTop: 2 }}>{label}</div>
        {trend && (
          <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 2 }}>
            ↑ {trend}% ce mois
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
  { label: 'Vue d\'ensemble', href: '/dashboard', icon: <BarChart2 size={18} /> },
  { label: 'Gestion des mémoires', href: '/admin/memoires', icon: <FileText size={18} /> },
  { label: 'Actualités', href: '/admin/actualites', icon: <Bell size={18} /> },
  { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: <Users size={18} /> },
  { label: 'Configuration', href: '/admin/config', icon: <Settings size={18} /> },
];

function DashboardSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: 'var(--or)', fontSize: 14 }}>BCU UYI</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Tableau de bord</div>
      </div>
      {SIDEBAR_LINKS.map(l => (
        <Link
          key={l.href}
          to={l.href}
          className={`sidebar-nav-link ${location.pathname === l.href ? 'active' : ''}`}
        >
          {l.icon} {l.label}
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0 0' }}>
        <Link to="/" className="sidebar-nav-link">
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Retour au site
        </Link>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="sidebar-nav-link"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading, isStaff } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topDocuments, setTopDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [memoireStats, setMemoireStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        statsRes,
        chartRes,
        topDocsRes,
        activityRes,
        memoireRes,
        unreadRes
      ] = await Promise.all([
        getDashboardStats().catch(() => ({ data: {} })),
        getDashboardChart({ period: '6months' }).catch(() => ({ data: [] })),
        getTopDocuments({ limit: 5 }).catch(() => ({ data: [] })),
        getRecentActivity({ limit: 10 }).catch(() => ({ data: [] })),
        getMemoireStats().catch(() => ({ data: {} })),
        getUnreadCount().catch(() => ({ data: { count: 0 } }))
      ]);

      setStats(statsRes.data || {});
      setChartData(chartRes.data || []);
      setTopDocuments(topDocsRes.data || []);
      setActivities(activityRes.data || []);
      setMemoireStats(memoireRes.data || {});
      setUnreadCount(unreadRes.data?.count || 0);

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadDashboardData();
    }
  }, [isStaff]);

  // Redirections
  if (!authLoading && !user) {
    return <Navigate to="/connexion" replace />;
  }
  if (!authLoading && !isStaff) {
    return <Navigate to="/" replace />;
  }

  // Métriques
  const metrics = [
    { label: 'Utilisateurs', value: stats?.users_count || 0, icon: <Users size={18} />, color: '#1B1464' },
    { label: 'Documents', value: stats?.documents_count || 0, icon: <BookOpen size={18} />, color: '#3b82f6' },
    { label: 'Téléchargements', value: stats?.downloads_count || 0, icon: <Download size={18} />, color: '#8b5cf6' },
    { label: 'Mémoires en attente', value: memoireStats?.en_attente || 0, icon: <FileText size={18} />, color: '#F59E0B' },
    { label: 'Articles', value: stats?.articles_count || 0, icon: <Newspaper size={18} />, color: '#10B981' },
    { label: 'Notifications', value: unreadCount || 0, icon: <Bell size={18} />, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardSidebar />

      <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: 'var(--beige)' }}>
        {/* Top bar */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--texte-muted)',
                marginBottom: 4,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--bleu-nuit)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--texte-muted)'}
            >
              <ArrowLeft size={14} /> Retour au site
            </Link>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Tableau de bord</h1>
            <div style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
              Bonjour, {user?.first_name || user?.username} 👋
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadDashboardData}
              className="btn btn-ghost btn-sm"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Chargement...' : 'Rafraîchir'}
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Erreur */}
          {error && (
            <div style={{
              padding: 16,
              background: 'var(--red-bg)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              marginBottom: 24,
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <AlertCircle size={20} />
              {error}
              <button onClick={loadDashboardData} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                Réessayer
              </button>
            </div>
          )}

          {/* Métriques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}>
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                value={metric.value}
                label={metric.label}
                icon={metric.icon}
                color={metric.color}
                loading={loading}
              />
            ))}
          </div>

          {/* Graphique */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 24,
            marginBottom: 24
          }}>
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-sm)',
              padding: 24,
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
                Activité du portail (6 mois)
              </h3>
              {loading ? (
                <div className="skeleton" style={{ height: 250, borderRadius: 'var(--radius-sm)' }} />
              ) : chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--texte-muted)' }}>
                  <TrendingUp size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p>Aucune donnée disponible</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      fontSize: 12
                    }} />
                    <Legend />
                    <Line type="monotone" dataKey="téléchargements" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Téléchargements" />
                    <Line type="monotone" dataKey="utilisateurs" stroke="#1B1464" strokeWidth={2} dot={false} name="Utilisateurs" />
                    <Line type="monotone" dataKey="documents" stroke="#10B981" strokeWidth={2} dot={false} name="Documents" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top documents */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-sm)',
              padding: 24,
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Top documents</h3>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="skeleton" style={{ height: 30 }} />
                  ))}
                </div>
              ) : topDocuments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--texte-muted)' }}>
                  <p>Aucun document</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topDocuments.slice(0, 5).map((doc, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{
                        fontWeight: 800,
                        color: 'var(--texte-light)',
                        width: 20,
                        fontSize: 12,
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.title || 'Document sans titre'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--texte-muted)' }}>
                          {doc.downloads || 0} téléchargements
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-sm)',
            padding: 24,
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
              Activité récente
            </h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 35 }} />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--texte-muted)' }}>
                <p>Aucune activité récente</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activities.slice(0, 10).map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      background: 'var(--beige)',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  >
                    <span style={{ fontSize: 20 }}>•</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{activity.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--texte-muted)' }}>
                        {activity.date ? new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : ''}
                        {activity.user && ` • ${activity.user}`}
                      </div>
                    </div>
                    {activity.status && (
                      <span className={`badge ${activity.status === 'en_attente' ? 'badge-amber' : 'badge-green'}`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))}
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
      `}</style>
    </div>
  );
}
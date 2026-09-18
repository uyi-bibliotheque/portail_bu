// pages/AideBiblioDashboard.jsx - VERSION PROFESSIONNELLE
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookPlus, BookMarked, Edit, Search, Users,
  BarChart3, BookOpen, Clock, ArrowRight,
  Library, User, LogOut, Settings, Bell,
  RefreshCw, AlertCircle, TrendingUp, Award,
  FileText, Layers, Database, CheckCircle,
  ExternalLink, ChevronRight, Sparkles, Activity,
  Calendar, FolderOpen, Hash, Tag, Archive
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getAideBiblioDashboard,
  redirectToPMB,
  getAideBiblioStats
} from '../services/endpoints';

const PMB_URL = 'http://10.4.2.112/pmb';

// ═══════════════════════════════════════════════════════════════════
// ─── PALETTE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',
  orDark: '#6D28D9',
  orLight: '#8B5CF6',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  green: '#10B981',
  blue: '#3b82f6',
  amber: '#F59E0B',
  red: '#ef4444',
  texteMuted: '#64748b',
  texteLight: '#94a3b8',
};

// ═══════════════════════════════════════════════════════════════════
// ─── CONFIGURATION DES ACTIONS ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_ACTIONS = [
  {
    id: 'new',
    title: 'Cataloguer un ouvrage',
    description: 'Ajouter un nouvel ouvrage dans le catalogue PMB',
    icon: BookPlus,
    color: COLORS.bleuNuit,
    bg: 'rgba(27,20,100,0.08)',
    action: 'new',
  },
  {
    id: 'search',
    title: 'Rechercher un ouvrage',
    description: 'Consulter et rechercher dans le catalogue PMB',
    icon: Search,
    color: COLORS.or,
    bg: 'rgba(124,58,237,0.08)',
    action: 'search',
  },
  {
    id: 'edit',
    title: 'Modifier un ouvrage',
    description: 'Mettre à jour les informations d\'un ouvrage existant',
    icon: Edit,
    color: COLORS.blue,
    bg: 'rgba(59,130,246,0.08)',
    action: 'edit',
  },
  {
    id: 'loans',
    title: 'Gérer les prêts',
    description: 'Enregistrer un prêt ou un retour d\'ouvrage',
    icon: BookMarked,
    color: COLORS.green,
    bg: 'rgba(16,185,129,0.08)',
    action: 'loans',
  },
  {
    id: 'users',
    title: 'Gérer les lecteurs',
    description: 'Consulter et modifier les comptes lecteurs',
    icon: Users,
    color: COLORS.amber,
    bg: 'rgba(245,158,11,0.08)',
    action: 'users',
  },
  {
    id: 'stats',
    title: 'Statistiques',
    description: 'Consulter les statistiques d\'utilisation du catalogue',
    icon: BarChart3,
    color: COLORS.orDark,
    bg: 'rgba(109,40,217,0.08)',
    action: 'stats',
  },
];

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANTS ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function StatCard({ label, value, icon: Icon, color, bg, subtitle, loading }) {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 22, width: '55%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '75%' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(27,20,100,0.08)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: color,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.texteMuted,
            marginTop: 3,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: 10, color: COLORS.texteLight, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ action, onClick, loading }) {
  const Icon = action.icon;
  return (
    <button
      onClick={() => onClick(action.action)}
      disabled={loading}
      style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid var(--border)',
        padding: '22px 22px',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: loading ? 'wait' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'inherit',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (loading) return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(27,20,100,0.10)';
        e.currentTarget.style.borderColor = action.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Indicateur coloré en haut */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${action.color}, ${action.color}80)`,
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
        className="action-top-bar"
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: action.bg,
          color: action.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          transition: 'all 0.3s',
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontSize: 15.5,
          fontWeight: 700,
          color: COLORS.bleuNuit,
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {action.title}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: COLORS.texteMuted,
          lineHeight: 1.55,
          marginBottom: 16,
          flex: 1,
        }}
      >
        {action.description}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: '1px solid var(--border-light, rgba(0,0,0,0.05))',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: action.color,
            fontWeight: 600,
          }}
        >
          Ouvrir dans PMB
        </span>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: action.bg,
            color: action.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s',
          }}
        >
          <ArrowRight size={14} />
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AideBiblioDashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);
  const [actionLoading, setActionLoading] = useState(null);

  // ─── CHARGEMENT DES DONNÉES ────────────────────────────────────
  const loadDashboard = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashboardRes, statsRes] = await Promise.allSettled([
        getAideBiblioDashboard(),
        getAideBiblioStats(),
      ]);

      // ─── Traiter le dashboard ───
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.data?.success) {
        const data = dashboardRes.value.data;
        setDashboardData(data);

        // Récupérer les actions depuis le backend si fournies
        const sections = data?.dashboard?.sections;
        if (Array.isArray(sections) && sections.length > 0) {
          setActions(sections.map((s) => {
            const base = DEFAULT_ACTIONS.find((a) => a.action === (s.action || s.id));
            return {
              id: s.id || s.action,
              title: s.title || base?.title || 'Action',
              description: s.description || base?.description || '',
              icon: base?.icon || BookPlus,
              color: base?.color || COLORS.bleuNuit,
              bg: base?.bg || 'rgba(27,20,100,0.08)',
              action: s.action || s.id,
            };
          }));
        } else {
          setActions(DEFAULT_ACTIONS);
        }
      } else {
        // Backend renvoie une erreur ou pas de données → utiliser les actions par défaut
        setActions(DEFAULT_ACTIONS);
        if (dashboardRes.status === 'rejected') {
          console.warn('Dashboard aide-biblio indisponible:', dashboardRes.reason);
        }
      }

      // ─── Traiter les stats ───
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
        setStats(statsRes.value.data.stats || {});
      } else {
        setStats(null);
        if (statsRes.status === 'rejected') {
          console.warn('Stats aide-biblio indisponibles:', statsRes.reason);
        }
      }

      if (showToast) {
        addToast('Données actualisées', 'success');
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
      if (showToast) {
        addToast('Erreur lors du chargement', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  // ─── REDIRECTION VERS PMB ──────────────────────────────────────
  const handleAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);

    try {
      // Essayer l'endpoint backend d'abord
      const response = await redirectToPMB(action);

      if (response?.data?.success && response.data.redirect_url) {
        window.open(response.data.redirect_url, '_blank', 'noopener,noreferrer');
        addToast(`Redirection vers PMB — ${action}`, 'success');
      } else {
        // Fallback : ouvrir directement l'URL PMB standard
        const fallbackUrl = `${PMB_URL}/catalog.php`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        addToast('Ouverture du catalogue PMB', 'info');
      }
    } catch (err) {
      console.error('Erreur redirection PMB:', err);
      // Fallback ultime
      window.open(PMB_URL, '_blank', 'noopener,noreferrer');
      addToast('Ouverture de PMB dans un nouvel onglet', 'info');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Déconnexion réussie', 'success');
    navigate('/');
  };

  // ─── RENDER : CHARGEMENT ───────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div style={{
          padding: '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 20,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: `4px solid ${COLORS.beigeDark}`,
            borderTopColor: COLORS.or,
            animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: COLORS.texteMuted, fontSize: 14 }}>
            Chargement de votre espace...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  // ─── RENDER : ERREUR ───────────────────────────────────────────
  if (error && !dashboardData && !stats) {
    return (
      <Layout>
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 auto',
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)',
            color: COLORS.red,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertCircle size={36} />
          </div>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.bleuNuit,
            marginBottom: 8,
          }}>
            Impossible de charger votre espace
          </h2>
          <p style={{ color: COLORS.texteMuted, fontSize: 14, marginBottom: 24 }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadDashboard()}
              className="btn btn-bleu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                background: COLORS.bleuNuit,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              <RefreshCw size={16} /> Réessayer
            </button>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                background: 'transparent',
                color: COLORS.bleuNuit,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── RENDER : DASHBOARD ────────────────────────────────────────
  return (
    <Layout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .skeleton {
          background: linear-gradient(90deg, ${COLORS.beige} 25%, ${COLORS.beigeDark} 50%, ${COLORS.beige} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
        .spin { animation: spin 1s linear infinite; }
        .action-card-wrapper:hover .action-top-bar {
          opacity: 1 !important;
        }
        .action-card-wrapper:hover > div > div:last-child > div:last-child {
          transform: translateX(3px);
        }
      `}</style>

      {/* ═══ HEADER PREMIUM ═══════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 60%, ${COLORS.or} 140%)`,
          padding: '36px 0 44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Décorations */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container"
          style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}
        >
          {/* Ligne supérieure */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Badge rôle */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 50,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  marginBottom: 14,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Sparkles size={12} />
                ESPACE AIDE-BIBLIOTHÉCAIRE
              </div>

              {/* Titre */}
              <h1
                style={{
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  color: 'white',
                  fontWeight: 400,
                  marginBottom: 8,
                  fontFamily: 'var(--font-serif, serif)',
                  lineHeight: 1.15,
                }}
              >
                Bonjour,{' '}
                <span style={{ color: COLORS.orLight }}>
                  {user?.first_name || user?.username}
                </span>{' '}
                👋
              </h1>

              <p
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 'clamp(13px, 1vw, 15px)',
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                {dashboardData?.message ||
                  'Gérez le catalogue PMB et accompagnez les usagers depuis votre espace dédié.'}
              </p>
            </div>

            {/* Actions header */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: refreshing ? 'wait' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  opacity: refreshing ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                }}
              >
                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.15)',
                  color: 'white',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                }}
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </div>

          {/* ═══ STATISTIQUES ═══════════════════════════════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              label="Total ouvrages catalogués"
              value={stats?.total_ouvrages ?? 0}
              icon={Library}
              color={COLORS.bleuNuit}
              bg={`${COLORS.bleuNuit}10`}
              loading={!stats}
            />
            <StatCard
              label="Ajoutés ce mois"
              value={stats?.ouvrages_ajoutes_mois ?? 0}
              icon={BookPlus}
              color={COLORS.green}
              bg={`${COLORS.green}12`}
              loading={!stats}
            />
            <StatCard
              label="Modifiés ce mois"
              value={stats?.ouvrages_modifies_mois ?? 0}
              icon={Edit}
              color={COLORS.or}
              bg={`${COLORS.or}12`}
              loading={!stats}
            />
            <StatCard
              label="Dernière activité"
              value={
                stats?.derniere_action
                  ? new Date(stats.derniere_action).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '—'
              }
              icon={Activity}
              color={COLORS.blue}
              bg={`${COLORS.blue}12`}
              loading={!stats}
            />
          </div>
        </div>
      </div>

      {/* ═══ ACTIONS DISPONIBLES ════════════════════════════════ */}
      <div className="container" style={{ padding: '32px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.bleuNuit,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <Library size={22} color={COLORS.or} />
              Actions disponibles
            </h2>
            <p style={{ fontSize: 13, color: COLORS.texteMuted }}>
              Toutes les actions s'ouvrent dans l'interface PMB
            </p>
          </div>
        </div>

        {actions.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              background: 'white',
              borderRadius: 16,
              border: '1px solid var(--border)',
            }}
          >
            <FolderOpen size={48} color={COLORS.texteLight} style={{ marginBottom: 12 }} />
            <p style={{ color: COLORS.texteMuted, fontSize: 14 }}>
              Aucune action disponible pour le moment.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {actions.map((action) => (
              <div key={action.id} className="action-card-wrapper">
                <ActionCard
                  action={action}
                  onClick={handleAction}
                  loading={actionLoading === action.action}
                />
              </div>
            ))}
          </div>
        )}

        {/* ═══ ACCÈS DIRECT AU CATALOGUE PMB ════════════════════ */}
        <div
          style={{
            marginTop: 32,
            padding: '22px 26px',
            background: `linear-gradient(135deg, ${COLORS.beige} 0%, ${COLORS.beigeDark} 100%)`,
            borderRadius: 16,
            border: `1px solid ${COLORS.beigeDark}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: COLORS.bleuNuit,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 20px rgba(27,20,100,0.25)',
              }}
            >
              <Database size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: COLORS.bleuNuit,
                  fontSize: 15,
                  marginBottom: 2,
                }}
              >
                Accès direct au catalogue PMB
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.texteMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Interface complète pour la gestion des ouvrages, prêts et lecteurs
              </div>
            </div>
          </div>
          <a
            href={PMB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 10,
              background: COLORS.bleuNuit,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(27,20,100,0.25)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,20,100,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,20,100,0.25)';
            }}
          >
            <ExternalLink size={14} />
            Ouvrir PMB
          </a>
        </div>
      </div>
    </Layout>
  );
}
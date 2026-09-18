// pages/admin/AdminDashboard.jsx - VERSION FINALE AVEC DIAGRAMMES FONCTIONNELS
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart2, BookOpen, FileText, Users, Bell,
  TrendingUp, Clock, CheckCircle, AlertCircle, Download,
  Eye, Calendar, UserPlus, Newspaper, PieChart as PieIcon,
  Activity, Award, FileCheck, Search, RefreshCw,
  Shield, ArrowLeft, LogOut, XCircle, Plus, Edit2, Trash2,
  Image, Save, X, Upload, CheckSquare, FileSignature,
  ChevronDown, Package, Send, CheckCheck, Mail, Database
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
  ComposedChart
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getDashboardStats, getMemoireStats, getNotifications,
  getUnreadCount, getDashboardChart, getTopDocuments,
  getRecentActivity, listUsers, createUser, getArticles,
  createArticle, updateArticle, deleteArticle, listMemoires,
  updateMemoireStatus, downloadQuitus, markAsRead, markAllAsRead
} from '../../services/endpoints';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════════════
// ─── PALETTE & CONFIGURATION ────────────────────────────────────
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
  red: '#ef4444',
  amber: '#F59E0B',
  blue: '#3b82f6',
  texteMuted: '#64748b',
  texteLight: '#94a3b8',
};

const CHART_COLORS = ['#1B1464', '#7C3AED', '#3b82f6', '#10B981', '#8b5cf6', '#F59E0B', '#ef4444', '#06b6d4'];

const CATEGORIES = [
  { value: 'Informations', label: 'Informations', color: '#3b82f6', icon: 'ℹ️' },
  { value: 'Acquisitions', label: 'Acquisitions', color: '#10B981', icon: '📚' },
  { value: 'Événements', label: 'Événements', color: '#8b5cf6', icon: '📅' },
  { value: 'Formation', label: 'Formation', color: '#F59E0B', icon: '🎓' },
  { value: 'Annonces', label: 'Annonces', color: '#ef4444', icon: '📢' },
  { value: 'Services', label: 'Services', color: '#06b6d4', icon: '🛠️' },
  { value: 'Ressources', label: 'Ressources', color: '#84cc16', icon: '📖' },
];

const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', badge: 'badge-slate', icon: '📝', color: '#94a3b8' },
  depot_en_ligne: { label: 'Déposé en ligne', badge: 'badge-blue', icon: '📤', color: '#3b82f6' },
  convocation_envoyee: { label: 'Convocation envoyée', badge: 'badge-amber', icon: '📧', color: '#F59E0B' },
  relance_envoyee: { label: 'Relance envoyée', badge: 'badge-orange', icon: '⏰', color: '#f97316' },
  en_attente_verification: { label: 'En vérification', badge: 'badge-purple', icon: '🔍', color: '#8b5cf6' },
  verification_ok: { label: 'Vérifié', badge: 'badge-green', icon: '✅', color: '#10B981' },
  rejete: { label: 'Rejeté', badge: 'badge-red', icon: '❌', color: '#ef4444' },
  en_attente_quitus: { label: 'Quitus en attente', badge: 'badge-blue', icon: '⏳', color: '#10B981' },
  quitus_disponible: { label: 'Quitus disponible', badge: 'badge-green', icon: '📄', color: '#10B981' },
  quitus_retire: { label: 'Quitus retiré', badge: 'badge-green', icon: '📋', color: '#10B981' },
  abandonne: { label: 'Abandonné', badge: 'badge-slate', icon: '🚫', color: '#94a3b8' },
};

const AVAILABLE_ROLES = [
  { value: 'BIBLIO', label: '📚 Bibliothécaire', description: 'Gestion des mémoires et quitus' },
  { value: 'AIDE_BIBLIO', label: '🤝 Aide-Bibliothécaire', description: 'Catalogage et gestion du PMB' },
  { value: 'ADMIN', label: '⚙️ Administrateur', description: 'Accès complet au système' },
];

// ═══════════════════════════════════════════════════════════════════
// ─── SIDEBAR ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const SIDEBAR_LINKS = [
  { label: "Vue d'ensemble", section: 'overview', icon: <BarChart2 size={18} /> },
  { label: 'Gestion des mémoires', section: 'memoires', icon: <FileText size={18} /> },
  { label: 'Actualités', section: 'actualites', icon: <Newspaper size={18} /> },
  { label: 'Utilisateurs', section: 'users', icon: <Users size={18} /> },
  { label: 'Notifications', section: 'notifications', icon: <Bell size={18} /> },
];

function DashboardSidebar({ activeTab, onTabChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-sidebar" style={{
      width: 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F0A2A 0%, #1B1464 50%, #2D2178 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      zIndex: 50
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.orLight }}>BCU UYI</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Administration</div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {SIDEBAR_LINKS.map(link => (
          <button
            key={link.section}
            onClick={() => onTabChange(link.section)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 2,
              width: '100%',
              color: activeTab === link.section ? 'white' : 'rgba(255,255,255,0.6)',
              background: activeTab === link.section ? 'rgba(124,58,237,0.25)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === link.section ? 600 : 500,
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              textAlign: 'left',
              borderLeft: activeTab === link.section ? `3px solid ${COLORS.or}` : '3px solid transparent'
            }}
            onMouseEnter={e => {
              if (activeTab !== link.section) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== link.section) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }
            }}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            fontSize: 12,
            padding: '6px 0',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          <ArrowLeft size={14} /> Retour au site
        </Link>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            padding: '6px 0',
            width: '100%',
            transition: 'color 0.2s',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.color = COLORS.red}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

      <style>{`
        .admin-sidebar::-webkit-scrollbar { width: 4px; }
        .admin-sidebar::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── STAT CARD ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function StatCard({ label, value, icon, color, bg, trend, subtitle, loading }) {
  if (loading) {
    return (
      <div style={{
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center'
      }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: '70%' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 20,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: color || COLORS.bleuNuit, lineHeight: 1.2 }}>
            {value !== undefined && value !== null ? value.toLocaleString('fr-FR') : '0'}
          </div>
          <div style={{ fontSize: 13, color: COLORS.texteMuted, marginTop: 4 }}>{label}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: COLORS.texteLight, marginTop: 2 }}>{subtitle}</div>
          )}
          {trend !== undefined && (
            <div style={{
              fontSize: 11,
              color: trend > 0 ? COLORS.green : COLORS.red,
              fontWeight: 600,
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: bg || `${color}15`,
          color: color || COLORS.bleuNuit,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── CHART CARD ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ChartCard({ title, subtitle, children, loading, action }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 24,
      border: '1px solid var(--border)', transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: COLORS.texteMuted, marginTop: 2 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 250, borderRadius: 8 }} />
      ) : (
        <div style={{ width: '100%', minHeight: 250 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── ACTIVITY ITEM ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ActivityItem({ activity, index }) {
  const getIcon = (type) => {
    switch (type) {
      case 'memoire': return <FileText size={14} color={COLORS.blue} />;
      case 'user': return <Users size={14} color={COLORS.or} />;
      case 'quitus': return <FileCheck size={14} color={COLORS.green} />;
      case 'reject': return <XCircle size={14} color={COLORS.red} />;
      default: return <Activity size={14} color={COLORS.texteLight} />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'memoire': return 'rgba(59,130,246,0.1)';
      case 'user': return 'rgba(124,58,237,0.1)';
      case 'quitus': return 'rgba(16,185,129,0.1)';
      case 'reject': return 'rgba(239,68,68,0.1)';
      default: return 'rgba(148,163,184,0.1)';
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: index % 2 === 0 ? COLORS.beige : 'transparent',
      borderRadius: 8
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: getBg(activity.type),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {getIcon(activity.type)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {activity.title || 'Activité'}
        </div>
        <div style={{ fontSize: 11, color: COLORS.texteMuted, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span>
            {activity.date ? new Date(activity.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            }) : ''}
          </span>
          {activity.user && <span>• {activity.user}</span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SECTION OVERVIEW ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function OverviewSection({
  stats, memoireStats, chartData, topDocuments, activities,
  unreadCount, loading, onRefresh, selectedPeriod, setSelectedPeriod
}) {
  // 🔧 Calculs sécurisés avec fallbacks
  const totalMemoires = memoireStats?.total || 0;
  const enAttente = memoireStats?.en_attente || 0;
  const valides = memoireStats?.valide || 0;
  const quitusGeneres = memoireStats?.quitus_genere || 0;
  const quitusSignes = memoireStats?.quitus_signe || 0;
  const rejetes = memoireStats?.rejete || 0;
  const incomplets = memoireStats?.incomplet || 0;

  const completionRate = totalMemoires > 0
    ? Math.round((quitusSignes / totalMemoires) * 100)
    : 0;

  // 🍩 Données pour le diagramme circulaire
  const memoireStatusData = [
    { name: 'En attente', value: enAttente, color: COLORS.amber },
    { name: 'Validés', value: valides, color: COLORS.green },
    { name: 'Quitus générés', value: quitusGeneres, color: COLORS.blue },
    { name: 'Quitus signés', value: quitusSignes, color: COLORS.or },
    { name: 'Rejetés', value: rejetes, color: COLORS.red },
    { name: 'Incomplets', value: incomplets, color: COLORS.texteLight },
  ].filter(d => d.value > 0);

  // 📊 Métriques principales
  const metrics = [
    {
      label: 'Total mémoires',
      value: totalMemoires,
      icon: <FileText size={20} />,
      color: COLORS.blue,
      bg: 'rgba(59,130,246,0.1)',
      subtitle: `Taux de complétion : ${completionRate}%`
    },
    {
      label: 'En attente de validation',
      value: enAttente,
      icon: <Clock size={20} />,
      color: COLORS.amber,
      bg: 'rgba(245,158,11,0.1)'
    },
    {
      label: 'Quitus signés',
      value: quitusSignes,
      icon: <FileCheck size={20} />,
      color: COLORS.green,
      bg: 'rgba(16,185,129,0.1)'
    },
    {
      label: 'Utilisateurs',
      value: stats?.users_count || 0,
      icon: <Users size={20} />,
      color: COLORS.bleuNuit,
      bg: 'rgba(27,20,100,0.06)'
    },
    {
      label: 'Documents',
      value: stats?.documents_count || 0,
      icon: <BookOpen size={20} />,
      color: COLORS.or,
      bg: 'rgba(124,58,237,0.1)'
    },
    {
      label: 'Notifications non lues',
      value: unreadCount,
      icon: <Bell size={20} />,
      color: COLORS.red,
      bg: 'rgba(239,68,68,0.1)'
    },
  ];

  // 📊 Préparer les données de graphique avec valeurs par défaut
  const chartDataSafe = chartData && chartData.length > 0
    ? chartData
    : [
        { month: 'Mai', depots: 0, validations: 0, quitus: 0 },
        { month: 'Juin', depots: 0, validations: 0, quitus: 0 },
        { month: 'Juillet', depots: 0, validations: 0, quitus: 0 },
        { month: 'Août', depots: 0, validations: 0, quitus: 0 },
        { month: 'Septembre', depots: 0, validations: 0, quitus: 0 },
        { month: 'Octobre', depots: 0, validations: 0, quitus: 0 },
      ];

  return (
    <>
      {/* ═══ MÉTRIQUES ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {metrics.map((metric, index) => (
          <StatCard
            key={index}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            bg={metric.bg}
            subtitle={metric.subtitle}
            loading={loading}
          />
        ))}
      </div>

      {/* ═══ GRAPHIQUES PRINCIPAUX ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 24,
        marginBottom: 24
      }}
      className="dashboard-grid-2-1">
        {/* 📈 Évolution des dépôts */}
        <ChartCard
          title="📈 Évolution des dépôts"
          subtitle="6 derniers mois"
          loading={loading}
          action={
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                fontSize: 12,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="3months">3 mois</option>
              <option value="6months">6 mois</option>
              <option value="12months">12 mois</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartDataSafe} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDepots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.bleuNuit} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.bleuNuit} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.beigeDark} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: COLORS.texteMuted }}
                axisLine={{ stroke: COLORS.beigeDark }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: COLORS.texteMuted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${COLORS.beigeDark}`,
                  fontSize: 12,
                  background: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                }}
                labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="depots"
                fill="url(#colorDepots)"
                stroke={COLORS.bleuNuit}
                strokeWidth={2}
                name="Dépôts"
              />
              <Line
                type="monotone"
                dataKey="validations"
                stroke={COLORS.green}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS.green }}
                activeDot={{ r: 6 }}
                name="Validations"
              />
              <Bar
                dataKey="quitus"
                fill={COLORS.or}
                name="Quitus"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 🍩 Statut des mémoires */}
        <ChartCard
          title="📊 Statut des mémoires"
          subtitle={`Total : ${totalMemoires} mémoire${totalMemoires > 1 ? 's' : ''}`}
          loading={loading}
        >
          {memoireStatusData.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: 280, color: COLORS.texteMuted,
              background: COLORS.beige, borderRadius: 12
            }}>
              <PieIcon size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Aucun mémoire enregistré</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={memoireStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {memoireStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${COLORS.beigeDark}`,
                    fontSize: 12,
                    background: 'white',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ═══ TOP DOCUMENTS & ACTIVITÉ ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 24
      }}>
        {/* 🏆 Top documents */}
        <ChartCard title="🏆 Documents les plus consultés" loading={loading}>
          {!topDocuments || topDocuments.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 30, color: COLORS.texteMuted,
              background: COLORS.beige, borderRadius: 12
            }}>
              <TrendingUp size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Aucun document consulté</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topDocuments.slice(0, 5).map((doc, i) => {
                const maxVal = topDocuments[0]?.downloads || 1;
                const percentage = Math.min((doc.downloads / maxVal) * 100, 100);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {doc.title || 'Document sans titre'}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.texteMuted }}>
                        {doc.downloads || 0} vues
                      </div>
                    </div>
                    <div style={{
                      width: 60, height: 6, background: COLORS.beige,
                      borderRadius: 3, overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`, height: '100%',
                        background: CHART_COLORS[i % CHART_COLORS.length],
                        borderRadius: 3, transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>

        {/* ⚡ Activité récente */}
        <ChartCard
          title="⚡ Activité récente"
          subtitle={`${activities?.length || 0} événements`}
          loading={loading}
        >
          {!activities || activities.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 30, color: COLORS.texteMuted,
              background: COLORS.beige, borderRadius: 12
            }}>
              <Activity size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Aucune activité récente</p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              maxHeight: 280, overflowY: 'auto', paddingRight: 4
            }}>
              {activities.slice(0, 8).map((activity, index) => (
                <ActivityItem key={index} activity={activity} index={index} />
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ═══ RÉPARTITION DES DÉPÔTS PAR FACULTÉ ═══ */}
      {stats?.depots_by_faculty && stats.depots_by_faculty.length > 0 && (
        <ChartCard
          title="🎓 Répartition par faculté"
          subtitle="Nombre de dépôts par établissement"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.depots_by_faculty} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.beigeDark} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: COLORS.texteMuted }}
                axisLine={{ stroke: COLORS.beigeDark }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: COLORS.texteMuted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${COLORS.beigeDark}`,
                  fontSize: 12,
                  background: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                }}
              />
              <Bar dataKey="value" name="Dépôts" radius={[8, 8, 0, 0]}>
                {stats.depots_by_faculty.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SECTION MÉMOIRES ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function MemoireCard({ memoire, onStatusUpdate, onRefresh }) {
  const { addToast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const status = STATUS_CONFIG[memoire.status] || STATUS_CONFIG.brouillon;

  const handleAction = async (action, extraData = null) => {
    setLoading(true);
    try {
      const payload = { status: action };
      if (action === 'rejete' && extraData) payload.rejection_reason = extraData;
      await onStatusUpdate(memoire.id, payload);
      onRefresh?.();
      addToast(`✅ ${STATUS_CONFIG[action]?.label || action} avec succès`, 'success');
    } catch (error) {
      addToast('Erreur lors de l\'action', 'error');
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      addToast('Veuillez saisir un motif de rejet', 'error');
      return;
    }
    setShowRejectModal(false);
    await handleAction('rejete', rejectReason);
    setRejectReason('');
  };

  const handleDownloadQuitus = async () => {
    try {
      const res = await downloadQuitus(memoire.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quitus_${memoire.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Quitus téléchargé', 'success');
    } catch (error) {
      addToast('Erreur téléchargement quitus', 'error');
    }
  };

  const canValidateVerification = memoire.status === 'en_attente_verification';
  const canSendConvocation = memoire.status === 'depot_en_ligne';
  const canMarkPhysical = ['convocation_envoyee', 'relance_envoyee'].includes(memoire.status);
  const canSignQuitus = memoire.status === 'en_attente_quitus';
  const canReject = ['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee', 'en_attente_verification', 'verification_ok'].includes(memoire.status);
  const canReopen = memoire.status === 'rejete';
  const showDownloadQuitus = ['quitus_disponible', 'quitus_retire'].includes(memoire.status) && !!memoire.quitus_file;
  const canConfirmRetire = memoire.status === 'quitus_disponible';

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr });
    } catch { return 'Date invalide'; }
  };

  return (
    <>
      <div style={{
        background: 'white',
        border: `1px solid ${memoire.status === 'rejete' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: 20,
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className={`badge ${status.badge}`}>
                {status.icon} {status.label}
              </span>
              {memoire.is_quitus_signed && <span className="badge badge-green">✅ Quitus signé</span>}
              {memoire.physical_deposit_confirmed && <span className="badge badge-blue">📦 Dépôt physique</span>}
              {memoire.documents_conform && <span className="badge badge-green">✅ Conforme</span>}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{memoire.title}</h3>

            <div style={{ fontSize: 13, color: COLORS.texteMuted, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <span>👤 {memoire.author_full_name || memoire.author_name}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>Matricule: {memoire.matricule || 'N/A'}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>{memoire.filiere || memoire.department}</span>
            </div>

            <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
              <span>{memoire.pdf_file ? '✅' : '❌'} PDF</span>
              <span>{memoire.word_file ? '✅' : '❌'} Word</span>
              <span>{memoire.scanned_document ? '✅' : '❌'} Scanné</span>
            </div>

            {memoire.rejection_reason && (
              <div style={{
                marginTop: 8, padding: '6px 12px',
                background: 'rgba(239,68,68,0.05)',
                borderRadius: 6, fontSize: 12, color: '#b91c1c',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <XCircle size={14} /> {memoire.rejection_reason}
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                marginTop: 8, color: COLORS.texteMuted, fontSize: 12,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {showDetails ? '▲ Moins de détails' : '▼ Plus de détails'}
            </button>

            {showDetails && (
              <div style={{
                marginTop: 8, padding: 12, background: COLORS.beige,
                borderRadius: 8, fontSize: 12, color: COLORS.texteMuted,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4
              }}>
                <div><strong>ID:</strong> {String(memoire.id).slice(0, 8)}...</div>
                <div><strong>Type:</strong> {memoire.type_document || 'Mémoire'}</div>
                <div><strong>Déposé le:</strong> {formatDate(memoire.created_at)}</div>
                <div><strong>Modifié le:</strong> {formatDate(memoire.updated_at)}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {canSendConvocation && (
              <button
                onClick={() => handleAction('convocation_envoyee')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.amber, color: 'white' }}
              >
                <Send size={13} /> Convocation
              </button>
            )}

            {canMarkPhysical && (
              <button
                onClick={() => handleAction('en_attente_verification')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.green, color: 'white' }}
              >
                <Package size={13} /> Dépôt
              </button>
            )}

            {canValidateVerification && (
              <button
                onClick={() => handleAction('verification_ok')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.or, color: 'white' }}
              >
                <CheckCircle size={13} /> Vérifier
              </button>
            )}

            {canSignQuitus && (
              <button
                onClick={() => handleAction('quitus_disponible')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.green, color: 'white' }}
              >
                <FileSignature size={13} /> Signer
              </button>
            )}

            {showDownloadQuitus && (
              <button
                onClick={handleDownloadQuitus}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.blue, color: 'white' }}
              >
                <Download size={13} />
              </button>
            )}

            {canConfirmRetire && (
              <button
                onClick={() => handleAction('quitus_retire')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: COLORS.green, color: 'white' }}
              >
                <CheckSquare size={13} /> Retrait
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="btn btn-ghost btn-sm"
                disabled={loading}
              >
                {loading ? <RefreshCw size={13} className="spin" /> : <ChevronDown size={13} />}
                Actions
              </button>
              {showActions && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: 6, minWidth: 220, zIndex: 10, maxHeight: 300, overflowY: 'auto'
                }}>
                  {canReject && (
                    <button
                      onClick={() => { setShowActions(false); setShowRejectModal(true); }}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: COLORS.red }}
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  )}
                  {canReopen && (
                    <button
                      onClick={() => handleAction('depot_en_ligne')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <RefreshCw size={14} /> Réouvrir
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}
        onClick={e => e.target === e.currentTarget && setShowRejectModal(false)}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              ❌ Rejeter le dépôt
            </h3>
            <p style={{ fontSize: 14, color: COLORS.texteMuted, marginBottom: 16 }}>
              Veuillez indiquer le motif du rejet pour informer l'étudiant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du rejet..."
              style={{
                width: '100%', minHeight: 80, padding: '12px 14px',
                borderRadius: 8, border: '1px solid var(--border)',
                fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                marginBottom: 16
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-ghost"
                style={{ flex: 1 }}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleRejectConfirm}
                className="btn btn-primary"
                style={{ flex: 1, background: COLORS.red, color: 'white' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MemoiresSection({ memoireStats, onRefresh, loading }) {
  const { addToast } = useToast();
  const [memoires, setMemoires] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [localLoading, setLocalLoading] = useState(true);

  const STATUS_FILTERS = [
    { value: 'all', label: 'Tous' },
    { value: 'depot_en_ligne', label: 'Déposés en ligne' },
    { value: 'convocation_envoyee', label: 'Convoqués' },
    { value: 'en_attente_verification', label: 'En vérification' },
    { value: 'verification_ok', label: 'Vérifiés' },
    { value: 'quitus_disponible', label: 'Quitus prêts' },
    { value: 'quitus_retire', label: 'Terminés' },
    { value: 'rejete', label: 'Rejetés' },
  ];

  const loadMemoires = async () => {
    setLocalLoading(true);
    try {
      const response = await listMemoires({ status: filter !== 'all' ? filter : undefined });
      setMemoires(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement mémoires:', error);
      addToast('Erreur chargement des mémoires', 'error');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    loadMemoires();
  }, [filter]);

  const handleStatusUpdate = async (id, payload) => {
    try {
      await updateMemoireStatus(id, payload);
      await loadMemoires();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  };

  const filteredMemoires = memoires.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.author_full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.matricule?.toLowerCase().includes(search.toLowerCase()) ||
    m.filiere?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { key: 'total', label: 'Total', color: COLORS.bleuNuit },
    { key: 'depot_en_ligne', label: 'À convoquer', color: COLORS.blue },
    { key: 'convocation_envoyee', label: 'Convocation', color: COLORS.amber },
    { key: 'en_attente_verification', label: 'En vérification', color: COLORS.or },
    { key: 'verification_ok', label: 'Vérifiés', color: COLORS.green },
    { key: 'quitus_disponible', label: 'Quitus prêts', color: COLORS.green },
    { key: 'quitus_retire', label: 'Terminés', color: COLORS.bleuNuit },
    { key: 'rejete', label: 'Rejetés', color: COLORS.red },
  ];

  return (
    <div>
      {memoireStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 10,
          marginBottom: 24
        }}>
          {statCards.map(s => (
            <div
              key={s.key}
              onClick={() => setFilter(s.key)}
              style={{
                background: 'white',
                border: `2px solid ${filter === s.key ? s.color : 'var(--border)'}`,
                borderRadius: 10,
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: filter === s.key ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <div style={{
                fontSize: 22, fontWeight: 700, color: s.color
              }}>
                {memoireStats[s.key] || 0}
              </div>
              <div style={{ fontSize: 10, color: COLORS.texteMuted, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              style={{
                padding: '5px 14px',
                borderRadius: 50,
                fontSize: 12,
                fontWeight: filter === s.value ? 600 : 400,
                background: filter === s.value ? COLORS.bleuNuit : 'white',
                color: filter === s.value ? 'white' : 'var(--texte)',
                border: `1px solid ${filter === s.value ? COLORS.bleuNuit : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: COLORS.texteLight
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{
                padding: '7px 12px 7px 36px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 13,
                width: 200,
                background: 'white'
              }}
            />
          </div>
          <button onClick={loadMemoires} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} className={localLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {localLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
          ))}
        </div>
      ) : filteredMemoires.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 40,
          background: 'white', borderRadius: 12, border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3>Aucun dépôt trouvé</h3>
          <p style={{ color: COLORS.texteMuted }}>
            {filter !== 'all'
              ? `Aucun dépôt avec le statut "${STATUS_FILTERS.find(f => f.value === filter)?.label || filter}"`
              : 'Aucun dépôt ne correspond à vos critères.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredMemoires.map(m => (
            <MemoireCard
              key={m.id}
              memoire={m}
              onStatusUpdate={handleStatusUpdate}
              onRefresh={loadMemoires}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SECTION ACTUALITÉS (simplifiée) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ActualitesSection() {
  const { addToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await deleteArticle(id);
      addToast('🗑️ Article supprimé', 'success');
      loadArticles();
    } catch (error) {
      addToast('Erreur suppression', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Actualités ({articles.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin/actualites" className="btn btn-bleu btn-sm">
            <Plus size={14} /> Nouvel article
          </Link>
          <button onClick={loadArticles} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Newspaper size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3>Aucun article</h3>
          <Link to="/admin/actualites" className="btn btn-bleu" style={{ marginTop: 16 }}>
            Créer un article
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.map(a => (
            <div key={a.id} style={{
              background: 'white', borderRadius: 12, padding: 16,
              border: '1px solid var(--border)',
              display: 'flex', gap: 16, alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  {a.category && (
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>{a.category}</span>
                  )}
                  {a.is_event && <span className="badge badge-or" style={{ fontSize: 10 }}>📅 Événement</span>}
                  {!a.is_published && <span className="badge badge-slate" style={{ fontSize: 10 }}>📝 Brouillon</span>}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{a.title}</h4>
                <p style={{
                  fontSize: 12, color: COLORS.texteMuted, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {a.content}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Link to="/admin/actualites" className="btn btn-ghost btn-sm">
                  <Edit2 size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: COLORS.red }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SECTION UTILISATEURS (intégrée) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function UsersSection() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    role: 'BIBLIO', password: '', confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await listUsers();
      let usersData = [];
      if (Array.isArray(response.data)) usersData = response.data;
      else if (response.data?.results) usersData = response.data.results;
      else if (response.data?.data) usersData = response.data.data;
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setCreating(true);
    try {
      await createUser(form);
      setSuccess('Utilisateur créé avec succès !');
      setForm({ username: '', email: '', first_name: '', last_name: '', role: 'BIBLIO', password: '', confirm_password: '' });
      await loadUsers();
      addToast('✅ Utilisateur créé', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erreur création';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-or';
      case 'BIBLIO': return 'badge-blue';
      case 'AIDE_BIBLIO': return 'badge-purple';
      default: return 'badge-slate';
    }
  };

  return (
    <div className="users-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Utilisateurs ({users.length})</h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.texteMuted }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>Aucun utilisateur</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id || u.username}>
                    <td>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(u.role)}`}>
                        {u.role_display || u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={18} /> Créer un utilisateur
        </h3>

        {error && (
          <div style={{
            padding: '10px 14px', background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            color: '#b91c1c', marginBottom: 12, fontSize: 13
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px 14px', background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
            color: '#047857', marginBottom: 12, fontSize: 13
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="form-input" placeholder="Identifiant *" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input className="form-input" type="email" placeholder="Email *" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="form-input" placeholder="Prénom *" value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value })} required />
          <input className="form-input" placeholder="Nom *" value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value })} required />
          <input className="form-input" type="password" placeholder="Mot de passe *" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input className="form-input" type="password" placeholder="Confirmer *" value={form.confirm_password}
            onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
          <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {AVAILABLE_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-bleu" disabled={creating}
            style={{ justifyContent: 'center' }}>
            {creating ? 'Création...' : '➕ Créer'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── SECTION NOTIFICATIONS ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function NotificationsSection() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notifRes, unreadRes] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(notifRes.data?.results || notifRes.data || []);
      setUnreadCount(unreadRes.data?.count || 0);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      addToast('Erreur', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      addToast('Toutes marquées comme lues', 'success');
    } catch (error) {
      addToast('Erreur', 'error');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: 'all', label: 'Toutes', count: notifications.length },
            { value: 'unread', label: 'Non lues', count: unreadCount },
            { value: 'read', label: 'Lues', count: notifications.length - unreadCount }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 16px',
                borderRadius: 50,
                fontSize: 12,
                fontWeight: filter === f.value ? 600 : 400,
                background: filter === f.value ? COLORS.bleuNuit : 'white',
                color: filter === f.value ? 'white' : 'var(--texte)',
                border: `1px solid ${filter === f.value ? COLORS.bleuNuit : 'var(--border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {f.label}
              {f.count > 0 && (
                <span style={{
                  background: filter === f.value ? 'rgba(255,255,255,0.2)' : COLORS.beige,
                  padding: '0 6px', borderRadius: 50, fontSize: 10
                }}>{f.count}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-bleu btn-sm">
              <CheckCheck size={14} /> Tout lire
            </button>
          )}
          <button onClick={loadNotifications} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Bell size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3>Aucune notification</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => navigate(`/admin/notifications/${n.id}`)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 18px',
                background: n.is_read ? 'white' : 'rgba(124,58,237,0.03)',
                border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(124,58,237,0.15)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              {!n.is_read && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 8, height: 8, borderRadius: '50%',
                  background: COLORS.or
                }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: n.is_read ? COLORS.beige : 'rgba(124,58,237,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={18} color={n.is_read ? COLORS.texteLight : COLORS.or} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 14, fontWeight: n.is_read ? 500 : 700, marginBottom: 4 }}>
                  {n.title}
                </h4>
                <p style={{
                  fontSize: 13, color: COLORS.texteMuted, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {n.message}
                </p>
                <div style={{ fontSize: 11, color: COLORS.texteLight, marginTop: 6 }}>
                  {new Date(n.created_at).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              {!n.is_read && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                  className="btn btn-bleu btn-sm"
                  style={{ fontSize: 11 }}
                >
                  Marquer lu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const { user, isStaff, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState(null);
  const [memoireStats, setMemoireStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [topDocuments, setTopDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const activeTab = searchParams.get('tab') || 'overview';

  const loadData = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);

    try {
      const [
        statsRes,
        memoireRes,
        unreadRes,
        chartRes,
        topDocsRes,
        activityRes
      ] = await Promise.all([
        getDashboardStats().catch(() => ({ data: {} })),
        getMemoireStats().catch(() => ({ data: {} })),
        getUnreadCount().catch(() => ({ data: { count: 0 } })),
        getDashboardChart({ period: selectedPeriod }).catch(() => ({ data: [] })),
        getTopDocuments({ limit: 5 }).catch(() => ({ data: [] })),
        getRecentActivity({ limit: 10 }).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data || {});
      setMemoireStats(memoireRes.data || {});
      setUnreadCount(unreadRes.data?.count || 0);
      setChartData(chartRes.data || []);
      setTopDocuments(topDocsRes.data || []);
      setActivities(activityRes.data || []);

      if (showToast) addToast('✅ Données actualisées', 'success');
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      if (showToast) addToast('❌ Erreur de chargement', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod, addToast]);

  useEffect(() => {
    if (isStaff) loadData();
  }, [isStaff, loadData]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  if (!isStaff) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Accès réservé au personnel</h2>
        <Link to="/" className="btn btn-bleu" style={{ marginTop: 20 }}>
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'memoires':
        return <MemoiresSection memoireStats={memoireStats} onRefresh={() => loadData()} loading={loading} />;
      case 'actualites':
        return <ActualitesSection />;
      case 'users':
        return <UsersSection />;
      case 'notifications':
        return <NotificationsSection />;
      default:
        return (
          <OverviewSection
            stats={stats}
            memoireStats={memoireStats}
            chartData={chartData}
            topDocuments={topDocuments}
            activities={activities}
            unreadCount={unreadCount}
            loading={loading}
            onRefresh={() => loadData(true)}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: COLORS.beige }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 100%)`,
          padding: '20px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, color: 'white', fontWeight: 400, fontFamily: 'serif' }}>
                📊 Tableau de bord
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>
                {isAdmin ? 'Administrateur' : 'Bibliothécaire'} • Bienvenue, {user?.first_name || user?.username}
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="btn btn-outline-white"
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                color: 'white', border: '1px solid rgba(255,255,255,0.12)',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .spin { animation: spin 1s linear infinite; }
        .skeleton {
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4dd 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }
        
        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-slate { background: rgba(148,163,184,0.12); color: #64748b; }
        .badge-blue { background: rgba(59,130,246,0.12); color: #2563eb; }
        .badge-amber { background: rgba(245,158,11,0.12); color: #d97706; }
        .badge-purple { background: rgba(124,58,237,0.12); color: #7c3aed; }
        .badge-green { background: rgba(16,185,129,0.12); color: #047857; }
        .badge-red { background: rgba(239,68,68,0.12); color: #dc2626; }
        .badge-or { background: rgba(124,58,237,0.12); color: #7c3aed; }
        .badge-orange { background: rgba(249,115,22,0.12); color: #ea580c; }

        /* Boutons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          font-family: inherit;
        }
        .btn-sm { padding: 5px 12px; font-size: 12px; }
        .btn-bleu {
          background: ${COLORS.bleuNuit};
          color: white;
        }
        .btn-bleu:hover { background: ${COLORS.bleuNuitLight}; }
        .btn-primary {
          background: ${COLORS.bleuNuit};
          color: white;
        }
        .btn-primary:hover { background: ${COLORS.bleuNuitLight}; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost {
          background: transparent;
          color: var(--texte);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover { background: ${COLORS.beige}; border-color: ${COLORS.or}; }
        .btn-outline-white {
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .btn-outline-white:hover { background: rgba(255,255,255,0.15); }
        .btn-outline-white:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Formulaires */
        .form-input, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          background: white;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: ${COLORS.or};
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }

        /* Tables */
        .table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        table th {
          text-align: left;
          padding: 10px 12px;
          font-weight: 600;
          color: ${COLORS.texteMuted};
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        table td {
          padding: 10px 12px;
          border-bottom: 1px solid ${COLORS.beigeDark};
        }
        table tr:hover td { background: ${COLORS.beige}; }

        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-grid-2-1 {
            grid-template-columns: 1fr !important;
          }
          .users-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
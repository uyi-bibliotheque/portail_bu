// pages/admin/AdminNotifications.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle, XCircle, Clock, FileText,
  ArrowLeft, RefreshCw, Eye, CheckCheck,
  User, Calendar, AlertCircle, Search,
  Users, Settings, Mail
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../../services/endpoints';

function NotificationCard({ notification, onMarkAsRead, onRefresh }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMarkAsRead = async (e) => {
    e.stopPropagation(); // Empêcher la navigation
    setLoading(true);
    try {
      await onMarkAsRead(notification.id);
      addToast('Notification marquée comme lue', 'success');
    } catch (error) {
      addToast('Erreur lors du marquage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    // Marquer comme lue si non lue
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    // Naviguer vers le détail
    navigate(`/admin/notifications/${notification.id}`);
  };

  const getIcon = (title, type) => {
    if (title?.includes('Mémoire') || title?.includes('dépôt') || type === 'memoire') {
      return <FileText size={18} color="#3b82f6" />;
    }
    if (title?.includes('Quitus') || title?.includes('signé') || type === 'quitus') {
      return <CheckCircle size={18} color="#10B981" />;
    }
    if (title?.includes('rejeté') || title?.includes('Rejeté') || type === 'reject') {
      return <XCircle size={18} color="#ef4444" />;
    }
    if (type === 'user') {
      return <Users size={18} color="#8b5cf6" />;
    }
    if (type === 'system') {
      return <Settings size={18} color="#F59E0B" />;
    }
    return <Bell size={18} color="#64748b" />;
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'memoire': return '#3b82f6';
      case 'quitus': return '#10B981';
      case 'reject': return '#ef4444';
      case 'user': return '#8b5cf6';
      case 'system': return '#F59E0B';
      default: return '#64748b';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '16px 20px',
        background: notification.is_read ? 'white' : 'rgba(59,130,246,0.03)',
        border: `1px solid ${notification.is_read ? 'var(--border)' : 'rgba(59,130,246,0.15)'}`,
        borderRadius: 'var(--radius-sm)',
        transition: 'all 0.2s',
        position: 'relative',
        cursor: 'pointer'
      }}
      onClick={handleClick}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--or)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = notification.is_read ? 'var(--border)' : 'rgba(59,130,246,0.15)';
      }}
    >
      {!notification.is_read && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#3b82f6',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
      
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: notification.is_read ? 'var(--beige)' : `${getTypeColor(notification.type)}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: notification.is_read ? 'none' : `2px solid ${getTypeColor(notification.type)}30`
        }}
      >
        {getIcon(notification.title, notification.type)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: notification.is_read ? 500 : 700,
              color: 'var(--texte)',
              marginBottom: 4
            }}>
              {notification.title}
            </h4>
            <p style={{ 
              fontSize: 13, 
              color: 'var(--texte-muted)', 
              lineHeight: 1.6,
              maxWidth: 600,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {notification.message}
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 12,
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ 
            fontSize: 12, 
            color: 'var(--texte-light)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            flexWrap: 'wrap'
          }}>
            <Clock size={13} />
            {new Date(notification.created_at).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {notification.type && (
              <span style={{
                display: 'inline-block',
                padding: '1px 8px',
                borderRadius: 50,
                fontSize: 10,
                background: `${getTypeColor(notification.type)}15`,
                color: getTypeColor(notification.type),
                fontWeight: 600,
                marginLeft: 6
              }}>
                {notification.type}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {!notification.is_read && (
              <button
                onClick={handleMarkAsRead}
                disabled={loading}
                className="btn btn-bleu btn-sm"
                style={{ fontSize: 12 }}
              >
                {loading ? '...' : 'Marquer comme lu'}
              </button>
            )}
            {notification.link && (
              <Link
                to={notification.link}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
                onClick={e => e.stopPropagation()}
              >
                <Eye size={13} /> Voir
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

export default function AdminNotifications() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

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
      console.error('Erreur chargement notifications:', error);
      addToast('Erreur lors du chargement des notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadNotifications();
    }
  }, [isStaff]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      throw error;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      addToast('Toutes les notifications ont été marquées comme lues', 'success');
    } catch (error) {
      addToast('Erreur lors du marquage', 'error');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !n.is_read) ||
      (filter === 'read' && n.is_read);
    
    const matchesSearch = n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.message?.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getFilterCount = (type) => {
    if (type === 'all') return notifications.length;
    if (type === 'unread') return notifications.filter(n => !n.is_read).length;
    if (type === 'read') return notifications.filter(n => n.is_read).length;
    return 0;
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
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: '32px 0 24px' }}>
        <div className="container">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard?tab=notifications')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              marginBottom: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
                <Bell size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />
                Notifications
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
                {unreadCount > 0 
                  ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes vos notifications sont lues ✨'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="btn btn-primary">
                  <CheckCheck size={16} style={{ marginRight: 6 }} />
                  Tout marquer comme lu
                </button>
              )}
              <button onClick={loadNotifications} className="btn btn-outline-white btn-sm">
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filtres et recherche */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'Toutes', count: getFilterCount('all') },
              { value: 'unread', label: 'Non lues', count: getFilterCount('unread') },
              { value: 'read', label: 'Lues', count: getFilterCount('read') }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: filter === f.value ? 600 : 400,
                  background: filter === f.value ? 'var(--bleu-nuit)' : 'white',
                  color: filter === f.value ? 'white' : 'var(--texte)',
                  border: `1px solid ${filter === f.value ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    background: filter === f.value ? 'rgba(255,255,255,0.2)' : 'var(--beige)',
                    padding: '1px 8px',
                    borderRadius: 50,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
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
                  width: 220,
                  background: 'white',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--or)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 24
        }}>
          {[
            { label: 'Total', value: notifications.length, color: 'var(--bleu-nuit)' },
            { label: 'Non lues', value: unreadCount, color: '#3b82f6' },
            { label: 'Lues', value: notifications.length - unreadCount, color: '#10B981' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              padding: '12px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Liste des notifications */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>Aucune notification</h3>
            <p style={{ color: 'var(--texte-muted)' }}>
              {filter === 'unread' 
                ? 'Vous n\'avez pas de notifications non lues. 🎉'
                : filter === 'read'
                ? 'Vous n\'avez pas de notifications lues.'
                : 'Aucune notification pour le moment.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotifications.map(n => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={handleMarkAsRead}
                onRefresh={loadNotifications}
              />
            ))}
          </div>
        )}

        {/* Pied de page */}
        {notifications.length > 0 && (
          <div style={{
            marginTop: 24,
            padding: '12px 20px',
            background: 'var(--beige)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 13,
            color: 'var(--texte-muted)'
          }}>
            <span>
              <strong>{notifications.length}</strong> notification{notifications.length > 1 ? 's' : ''} au total
            </span>
            <span>
              <strong style={{ color: '#3b82f6' }}>{unreadCount}</strong> non lue{unreadCount > 1 ? 's' : ''}
              {' • '}
              <strong style={{ color: '#10B981' }}>{notifications.length - unreadCount}</strong> lue{notifications.length - unreadCount > 1 ? 's' : ''}
            </span>
          </div>
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
// pages/staff/StaffNotifications.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle, XCircle, Clock, FileText,
  ArrowLeft, RefreshCw, Eye, Trash2, CheckCheck,
  User, Calendar, AlertCircle, ChevronRight
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

  const handleMarkAsRead = async () => {
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

  const getIcon = (title) => {
    if (title?.includes('Mémoire') || title?.includes('dépôt')) {
      return <FileText size={18} color="#3b82f6" />;
    }
    if (title?.includes('Quitus') || title?.includes('signé')) {
      return <CheckCircle size={18} color="#10B981" />;
    }
    if (title?.includes('rejeté') || title?.includes('Rejeté')) {
      return <XCircle size={18} color="#ef4444" />;
    }
    return <Bell size={18} color="#F59E0B" />;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 18px',
        background: notification.is_read ? 'white' : 'rgba(27,20,100,0.03)',
        border: `1px solid ${notification.is_read ? 'var(--border)' : 'rgba(27,20,100,0.15)'}`,
        borderRadius: 'var(--radius-sm)',
        transition: 'all 0.2s',
        position: 'relative'
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
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: notification.is_read ? 'var(--beige)' : 'rgba(27,20,100,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getIcon(notification.title)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: notification.is_read ? 500 : 700,
              color: 'var(--texte)'
            }}>
              {notification.title}
            </h4>
            <p style={{ 
              fontSize: 13, 
              color: 'var(--texte-muted)', 
              marginTop: 4,
              lineHeight: 1.5
            }}>
              {notification.message}
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 10,
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ fontSize: 12, color: 'var(--texte-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {new Date(notification.created_at).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!notification.is_read && (
              <button
                onClick={handleMarkAsRead}
                disabled={loading}
                className="btn btn-bleu btn-sm"
              >
                {loading ? '...' : 'Marquer comme lu'}
              </button>
            )}
            {notification.link && (
              <Link
                to={notification.link}
                className="btn btn-ghost btn-sm"
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

export default function StaffNotifications() {
  const { isStaff } = useAuth();
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
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

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
      <div style={{ background: 'var(--bleu-nuit)', padding: '32px 0 24px' }}>
        <div className="container">
          <button
            onClick={() => navigate('/staff')}
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
                <Bell size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Notifications
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
                {unreadCount > 0 
                  ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes vos notifications sont lues'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="btn btn-primary">
                  <CheckCheck size={16} /> Tout marquer comme lu
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'unread', label: `Non lues (${unreadCount})` },
            { value: 'read', label: `Lues (${notifications.length - unreadCount})` }
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
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>Aucune notification</h3>
            <p style={{ color: 'var(--texte-muted)' }}>
              {filter === 'unread' 
                ? 'Vous n\'avez pas de notifications non lues.'
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
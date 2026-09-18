// pages/admin/AdminNotificationDetail.jsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, CheckCircle, XCircle, Clock, FileText,
  User, Calendar, AlertCircle, Users, Settings, Mail, Eye
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getNotifications, markAsRead } from '../../services/endpoints';

export default function AdminNotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotification = async () => {
      setLoading(true);
      try {
        const response = await getNotifications();
        const notifs = response.data?.results || response.data || [];
        const found = notifs.find(n => String(n.id) === String(id));
        
        if (found) {
          setNotification(found);
          // Marquer comme lue automatiquement
          if (!found.is_read) {
            await markAsRead(found.id);
            found.is_read = true;
          }
        } else {
          setError('Notification non trouvée');
        }
      } catch (error) {
        console.error('Erreur chargement notification:', error);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    
    if (isStaff) {
      loadNotification();
    }
  }, [id, isStaff]);

  const getIcon = (title, type) => {
    if (title?.includes('Mémoire') || title?.includes('dépôt') || type === 'memoire') {
      return <FileText size={48} color="#3b82f6" />;
    }
    if (title?.includes('Quitus') || title?.includes('signé') || type === 'quitus') {
      return <CheckCircle size={48} color="#10B981" />;
    }
    if (title?.includes('rejeté') || title?.includes('Rejeté') || type === 'reject') {
      return <XCircle size={48} color="#ef4444" />;
    }
    if (type === 'user') {
      return <Users size={48} color="#8b5cf6" />;
    }
    if (type === 'system') {
      return <Settings size={48} color="#F59E0B" />;
    }
    return <Bell size={48} color="#64748b" />;
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
            onClick={() => navigate('/admin/notifications')}
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
            <ArrowLeft size={14} /> Retour aux notifications
          </button>
          <h1 className="font-serif" style={{ fontSize: 32, color: 'white', fontWeight: 400 }}>
            Détail de la notification
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px' }} />
            <div className="skeleton" style={{ height: 30, width: '60%', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: 20, width: '80%', margin: '0 auto' }} />
          </div>
        ) : error || !notification ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <h3>{error || 'Notification non trouvée'}</h3>
            <Link to="/admin/notifications" className="btn btn-bleu" style={{ marginTop: 20 }}>
              Retour aux notifications
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius)',
            padding: 32,
            border: '1px solid var(--border)',
            maxWidth: 800,
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `${getTypeColor(notification.type)}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${getTypeColor(notification.type)}30`
              }}>
                {getIcon(notification.title, notification.type)}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{notification.title}</h2>
                  {!notification.is_read && (
                    <span className="badge badge-blue">Non lue</span>
                  )}
                  {notification.type && (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 50,
                      fontSize: 11,
                      background: `${getTypeColor(notification.type)}15`,
                      color: getTypeColor(notification.type),
                      fontWeight: 600
                    }}>
                      {notification.type}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--texte-muted)', marginTop: 4 }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {new Date(notification.created_at).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div style={{
              padding: 20,
              background: 'var(--beige)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 24
            }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--texte)', margin: 0 }}>
                {notification.message}
              </p>
            </div>

            {notification.link && (
              <Link
                to={notification.link}
                className="btn btn-bleu"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Eye size={16} /> Voir la page associée
              </Link>
            )}

            <div style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/admin/notifications')}
                className="btn btn-ghost"
              >
                <ArrowLeft size={16} /> Retour à la liste
              </button>
              {notification.is_read && (
                <span style={{ fontSize: 13, color: 'var(--texte-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} color="#10B981" />
                  Lu le {new Date().toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
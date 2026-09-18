// frontend/src/pages/NotificationDetailPage.jsx - VERSION COMPLÈTE

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Settings, 
  Award,
  Eye
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getNotifications, markAsRead } from '../services/endpoints';

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { markAsRead: markAsReadContext, loadNotifications } = useNotifications();
  
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter le mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadNotification = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await getNotifications();
        const notifs = response.data?.results || response.data || [];
        const found = notifs.find(n => String(n.id) === String(id));
        
        if (found) {
          setNotification(found);
          // Si la notification n'est pas lue, la marquer comme lue
          if (!found.is_read) {
            await markAsRead(found.id);
            // Mettre à jour le contexte
            markAsReadContext(found.id);
            loadNotifications();
          }
        } else {
          setError('Notification non trouvée');
        }
      } catch (error) {
        console.error('Erreur chargement notification:', error);
        setError('Erreur lors du chargement de la notification');
      } finally {
        setLoading(false);
      }
    };

    loadNotification();
  }, [id, user, markAsReadContext, loadNotifications]);

  const getIcon = (title, type) => {
    if (title?.includes('Mémoire') || title?.includes('dépôt') || type === 'memoire') {
      return <FileText size={isMobile ? 36 : 48} color="#3b82f6" />;
    }
    if (title?.includes('Quitus') || title?.includes('signé') || type === 'quitus') {
      return <CheckCircle size={isMobile ? 36 : 48} color="#10B981" />;
    }
    if (title?.includes('rejeté') || title?.includes('Rejeté') || type === 'reject') {
      return <XCircle size={isMobile ? 36 : 48} color="#ef4444" />;
    }
    if (title?.includes('validation') || type === 'validation') {
      return <Award size={isMobile ? 36 : 48} color="#8b5cf6" />;
    }
    if (type === 'system') {
      return <Settings size={isMobile ? 36 : 48} color="#F59E0B" />;
    }
    if (type === 'user') {
      return <Users size={isMobile ? 36 : 48} color="#8b5cf6" />;
    }
    return <Bell size={isMobile ? 36 : 48} color="#64748b" />;
  };

  const getTypeColor = () => {
    switch(notification?.type) {
      case 'memoire': return '#3b82f6';
      case 'quitus': return '#10B981';
      case 'reject': return '#ef4444';
      case 'validation': return '#8b5cf6';
      case 'system': return '#F59E0B';
      case 'user': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getTypeLabel = () => {
    switch(notification?.type) {
      case 'memoire': return 'Mémoire';
      case 'quitus': return 'Quitus';
      case 'reject': return 'Rejet';
      case 'validation': return 'Validation';
      case 'system': return 'Système';
      case 'user': return 'Utilisateur';
      default: return 'Information';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleBack = () => {
    navigate('/mon-compte?tab=notifications');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container" style={{ padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 16px' : '60px 0',
            background: 'white',
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: isMobile ? 40 : 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 8 }}>
              Connexion requise
            </h2>
            <p style={{ color: 'var(--texte-muted)', marginBottom: 24, fontSize: isMobile ? 13 : 15 }}>
              Veuillez vous connecter pour voir cette notification.
            </p>
            <Link 
              to="/connexion"
              className="btn btn-bleu"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8,
                padding: isMobile ? '10px 18px' : '12px 24px',
                fontSize: isMobile ? 13 : 14
              }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '60px 0' }}>
            <div className="skeleton" style={{ 
              width: isMobile ? 48 : 60, 
              height: isMobile ? 48 : 60, 
              borderRadius: '50%', 
              margin: '0 auto 16px' 
            }} />
            <div className="skeleton" style={{ 
              height: isMobile ? 24 : 30, 
              width: '50%', 
              margin: '0 auto 10px' 
            }} />
            <div className="skeleton" style={{ 
              height: isMobile ? 16 : 20, 
              width: '70%', 
              margin: '0 auto' 
            }} />
            <style>{`
              .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 6px;
              }
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !notification) {
    return (
      <Layout>
        <div className="container" style={{ padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 16px' : '60px 0',
            background: 'white',
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: isMobile ? 40 : 48, marginBottom: 16 }}>🔔</div>
            <h2 style={{ 
              fontSize: isMobile ? 18 : 22, 
              fontWeight: 700, 
              marginBottom: 8 
            }}>
              {error || 'Notification introuvable'}
            </h2>
            <p style={{ color: 'var(--texte-muted)', marginBottom: 24, fontSize: isMobile ? 13 : 15 }}>
              La notification que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <button 
              onClick={handleBack}
              className="btn btn-bleu"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8,
                padding: isMobile ? '10px 18px' : '12px 24px',
                fontSize: isMobile ? 13 : 14
              }}
            >
              <ArrowLeft size={isMobile ? 14 : 16} /> Retour aux notifications
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container" style={{ padding: isMobile ? '16px 12px' : '32px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Bouton retour */}
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--texte-muted)',
              fontSize: isMobile ? 12 : 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: isMobile ? '6px 0' : '8px 0',
              marginBottom: isMobile ? 12 : 20,
              transition: 'color 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--bleu-nuit)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--texte-muted)'}
          >
            <ArrowLeft size={isMobile ? 16 : 18} /> Retour aux notifications
          </button>

          {/* Carte de la notification */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {/* En-tête */}
            <div style={{
              padding: isMobile ? '16px 16px' : '24px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: isMobile ? 12 : 16,
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
                borderRadius: '50%',
                background: `${getTypeColor()}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `2px solid ${getTypeColor()}30`
              }}>
                {getIcon(notification.title, notification.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  flexWrap: 'wrap',
                  marginBottom: 4
                }}>
                  <h1 style={{ 
                    fontSize: isMobile ? 17 : 20, 
                    fontWeight: 700, 
                    margin: 0,
                    color: 'var(--bleu-nuit)',
                    wordBreak: 'break-word'
                  }}>
                    {notification.title}
                  </h1>
                  {!notification.is_read && (
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 50,
                      fontSize: isMobile ? 9 : 11,
                      fontWeight: 600,
                      background: '#3b82f615',
                      color: '#3b82f6',
                      border: '1px solid #3b82f620',
                      whiteSpace: 'nowrap'
                    }}>
                      Non lue
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 8 : 12,
                  flexWrap: 'wrap',
                  fontSize: isMobile ? 11 : 13,
                  color: 'var(--texte-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={isMobile ? 12 : 14} /> {formatDate(notification.created_at)}
                  </span>
                  {notification.type && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 50,
                      fontSize: isMobile ? 9 : 11,
                      background: `${getTypeColor()}15`,
                      color: getTypeColor(),
                      fontWeight: 500
                    }}>
                      {getTypeLabel()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Corps du message */}
            <div style={{ padding: isMobile ? '16px' : '28px' }}>
              <div style={{
                padding: isMobile ? '14px' : '20px',
                background: 'var(--beige)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                minHeight: isMobile ? 60 : 100
              }}>
                <p style={{
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: isMobile ? 1.7 : 1.8,
                  color: 'var(--texte)',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {notification.message}
                </p>
              </div>

              {/* Lien associé si présent */}
              {notification.link && (
                <div style={{ marginTop: isMobile ? 16 : 20 }}>
                  <Link
                    to={notification.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      background: 'var(--bleu-nuit)',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: isMobile ? 13 : 14,
                      transition: 'all 0.2s',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bleu-nuit-light)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,20,100,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bleu-nuit)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Eye size={isMobile ? 14 : 16} /> Voir la page associée
                  </Link>
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div style={{
              padding: isMobile ? '12px 16px' : '16px 28px',
              borderTop: '1px solid var(--border)',
              background: 'var(--beige)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <span style={{ 
                fontSize: isMobile ? 10 : 12, 
                color: 'var(--texte-muted)',
                wordBreak: 'break-word'
              }}>
                ID: {notification.id}
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {notification.is_read && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: isMobile ? 11 : 12,
                    color: '#10B981'
                  }}>
                    <CheckCircle size={isMobile ? 12 : 14} /> Lu
                  </span>
                )}
                <button
                  onClick={handleBack}
                  className="btn btn-bleu btn-sm"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6,
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    fontSize: isMobile ? 11 : 12,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowLeft size={isMobile ? 12 : 14} /> Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .btn-bleu {
          background: var(--bleu-nuit);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .btn-bleu:hover {
          background: var(--bleu-nuit-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(27,20,100,0.15);
        }
        .btn-sm {
          padding: 6px 14px;
          font-size: 12px;
        }
        @media (max-width: 480px) {
          .btn-bleu {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
}
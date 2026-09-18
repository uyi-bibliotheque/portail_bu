// components/notifications/NotificationItem.jsx - VERSION CORRIGÉE

import { Link } from 'react-router-dom';
import { Clock, FileText, Users, Bell, CheckCircle, XCircle, Settings, Award } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationItem({ notification, onMarkAsRead, compact = false }) {
  const { id, title, message, link, is_read, created_at, type } = notification;

  const getIcon = () => {
    if (title?.includes('Mémoire') || title?.includes('dépôt') || type === 'memoire') {
      return <FileText size={compact ? 14 : 18} color="#3b82f6" />;
    }
    if (title?.includes('Quitus') || title?.includes('signé') || type === 'quitus') {
      return <CheckCircle size={compact ? 14 : 18} color="#10B981" />;
    }
    if (title?.includes('rejeté') || title?.includes('Rejeté') || type === 'reject') {
      return <XCircle size={compact ? 14 : 18} color="#ef4444" />;
    }
    if (title?.includes('validation') || type === 'validation') {
      return <Award size={compact ? 14 : 18} color="#8b5cf6" />;
    }
    if (type === 'system') {
      return <Settings size={compact ? 14 : 18} color="#F59E0B" />;
    }
    if (type === 'user') {
      return <Users size={compact ? 14 : 18} color="#8b5cf6" />;
    }
    return <Bell size={compact ? 14 : 18} color="#64748b" />;
  };

  const getTypeColor = () => {
    switch(type) {
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
    switch(type) {
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
      const d = new Date(date);
      if (compact) {
        return formatDistanceToNow(d, { locale: fr, addSuffix: true });
      }
      return format(d, 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return '';
    }
  };

  const handleMarkRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  // Contenu de la notification
  const content = (
    <div
      style={{
        display: 'flex',
        gap: compact ? 10 : 14,
        padding: compact ? '10px 14px' : '14px 18px',
        background: is_read ? 'white' : 'rgba(59,130,246,0.03)',
        borderBottom: '1px solid var(--border-light)',
        transition: 'all 0.2s',
        position: 'relative',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = is_read ? 'var(--beige)' : 'rgba(59,130,246,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = is_read ? 'white' : 'rgba(59,130,246,0.03)';
      }}
    >
      {!is_read && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 14,
            transform: 'translateY(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#3b82f6',
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      <div
        style={{
          width: compact ? 32 : 40,
          height: compact ? 32 : 40,
          borderRadius: '50%',
          background: is_read ? 'var(--beige)' : `${getTypeColor()}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: is_read ? 'none' : `2px solid ${getTypeColor()}30`,
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h4
            style={{
              fontSize: compact ? 12 : 14,
              fontWeight: is_read ? 500 : 700,
              color: 'var(--texte)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h4>
        </div>

        <p
          style={{
            fontSize: compact ? 11 : 13,
            color: 'var(--texte-muted)',
            lineHeight: 1.5,
            margin: '4px 0 0',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            fontSize: compact ? 10 : 11,
            color: 'var(--texte-light)',
            flexWrap: 'wrap',
          }}
        >
          <Clock size={compact ? 10 : 12} />
          <span>{formatDate(created_at)}</span>
          {!is_read && compact && (
            <span
              style={{
                padding: '1px 8px',
                borderRadius: 50,
                fontSize: 9,
                background: '#3b82f615',
                color: '#3b82f6',
                fontWeight: 600,
              }}
            >
              Nouveau
            </span>
          )}
          {type && (
            <span
              style={{
                padding: '1px 8px',
                borderRadius: 50,
                fontSize: 9,
                background: `${getTypeColor()}15`,
                color: getTypeColor(),
                fontWeight: 500,
              }}
            >
              {getTypeLabel()}
            </span>
          )}
        </div>
      </div>

      {!is_read && !compact && (
        <button
          onClick={handleMarkRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'all 0.2s',
            flexShrink: 0,
            alignSelf: 'center',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Marquer lu
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(0.8); }
        }
      `}</style>
    </div>
  );

  // ═══ TOUJOURS REDIRIGER VERS LA PAGE DE DÉTAIL ═══
  // Utiliser le chemin exact /notifications/:id
  return (
    <Link 
      to={`/notifications/${id}`}
      style={{ 
        textDecoration: 'none', 
        color: 'inherit', 
        display: 'block',
      }}
      onClick={() => {
        // Marquer comme lu au clic si non lue
        if (!is_read && onMarkAsRead) {
          onMarkAsRead(id);
        }
      }}
    >
      {content}
    </Link>
  );
}
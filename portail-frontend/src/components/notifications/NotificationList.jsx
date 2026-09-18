// frontend/src/components/notifications/NotificationList.jsx
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationList({ compact = false }) {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) {
    return (
      <div style={{ padding: compact ? 16 : 24, textAlign: 'center' }}>
        <div className="skeleton" style={{ height: compact ? 60 : 80, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: compact ? 60 : 80, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: compact ? 60 : 80, borderRadius: 8 }} />
        <style>{`
          .skeleton {
            background: linear-gradient(90deg, var(--beige) 25%, var(--border) 50%, var(--beige) 75%);
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
    );
  }

  if (notifications.length === 0) {
    return (
      <div
        style={{
          padding: compact ? 24 : 40,
          textAlign: 'center',
          color: 'var(--texte-muted)',
        }}
      >
        <Bell size={compact ? 32 : 48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p style={{ fontSize: compact ? 13 : 15, margin: 0, fontWeight: 500 }}>
          Aucune notification
        </p>
        {!compact && (
          <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--texte-light)' }}>
            Vous serez notifié des nouvelles activités
          </p>
        )}
      </div>
    );
  }

  const displayNotifications = compact ? notifications.slice(0, 10) : notifications;

  return (
    <div>
      {displayNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
          compact={compact}
        />
      ))}
      {compact && notifications.length > 10 && (
        <div
          style={{
            padding: '10px 20px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-light)',
            fontSize: 12,
            color: 'var(--texte-muted)',
            background: 'var(--beige)',
          }}
        >
          Et {notifications.length - 10} autre{notifications.length - 10 > 1 ? 's' : ''} notification{notifications.length - 10 > 1 ? 's' : ''}...
        </div>
      )}
    </div>
  );
}
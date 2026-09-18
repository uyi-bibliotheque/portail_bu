// frontend/src/components/notifications/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationList from './NotificationList';

export default function NotificationBell({ className = '' }) {
  const { unreadCount, hasNew, markSeen, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (isOpen) {
      markSeen();
    }
    setIsOpen(!isOpen);
  };

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        markSeen();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [markSeen]);

  // Fermer avec la touche Echap
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        markSeen();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, markSeen]);

  return (
    <div className={`notification-bell ${className}`} ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleDropdown}
        className="notification-bell-btn"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        aria-expanded={isOpen}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          width: 40,
          height: 40,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {hasNew || unreadCount > 0 ? (
          <BellDot size={22} />
        ) : (
          <Bell size={22} />
        )}
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#ef4444',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: '50%',
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translate(4px, -4px)',
              animation: hasNew ? 'pulse 1.5s ease-in-out infinite' : 'none',
              border: '2px solid var(--bleu-nuit)',
              padding: '0 4px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {hasNew && unreadCount === 0 && (
          <span
            className="notification-dot"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#3b82f6',
              animation: 'pulse 1.5s ease-in-out infinite',
              border: '2px solid var(--bleu-nuit)',
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)',
            zIndex: 1000,
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'white',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: 10,
                    padding: '1px 10px',
                    borderRadius: 50,
                    fontWeight: 600,
                  }}
                >
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  Tout lire
                </button>
              )}
              <Link
                to="/mon-compte?tab=notifications"
                className="btn-ghost btn-sm"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => { setIsOpen(false); markSeen(); }}
              >
                Voir tout
              </Link>
            </div>
          </div>

          {/* Liste des notifications */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 100 }}>
            <NotificationList compact={true} />
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 20px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              background: 'var(--beige)',
              flexShrink: 0,
            }}
          >
            <Link
              to="/mon-compte?tab=notifications"
              style={{
                color: 'var(--or)',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
              onClick={() => { setIsOpen(false); markSeen(); }}
            >
              Gérer toutes les notifications →
            </Link>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
            .notification-dropdown::-webkit-scrollbar {
              width: 4px;
            }
            .notification-dropdown::-webkit-scrollbar-track {
              background: transparent;
            }
            .notification-dropdown::-webkit-scrollbar-thumb {
              background: var(--border);
              border-radius: 2px;
            }
            .btn-ghost {
              background: transparent;
              border: 1px solid var(--border);
              border-radius: 6px;
              color: var(--texte);
              cursor: pointer;
              transition: all 0.2s;
              font-family: inherit;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }
            .btn-ghost:hover {
              border-color: var(--or);
              color: var(--or);
            }
            .btn-sm {
              padding: 4px 10px;
              font-size: 11px;
            }
            @media (max-width: 480px) {
              .notification-dropdown {
                position: fixed !important;
                top: 56px !important;
                right: 8px !important;
                left: 8px !important;
                width: auto !important;
                max-width: none !important;
                max-height: calc(100vh - 70px) !important;
                border-radius: 12px !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
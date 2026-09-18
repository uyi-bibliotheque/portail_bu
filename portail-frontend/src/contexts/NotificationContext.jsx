// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from '../services/endpoints';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const intervalRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getUnreadCount();
      const count = response.data?.count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getNotifications();
      const data = response.data?.results || response.data || [];
      setNotifications(data);
      
      const unread = data.filter(n => !n.is_read).length;
      if (unread > unreadCount) {
        setHasNew(true);
      }
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, unreadCount]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      addToast('✅ Notification marquée comme lue', 'success');
    } catch (error) {
      addToast('❌ Erreur lors du marquage', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      setHasNew(false);
      addToast('✅ Toutes les notifications ont été marquées comme lues', 'success');
    } catch (error) {
      addToast('❌ Erreur lors du marquage', 'error');
    }
  };

  const markSeen = () => {
    setHasNew(false);
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      loadNotifications();
      
      // Recharger périodiquement toutes les 30 secondes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        loadUnreadCount();
        loadNotifications();
      }, 30000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setUnreadCount(0);
      setNotifications([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [user, loadUnreadCount, loadNotifications]);

  const value = {
    unreadCount,
    notifications,
    loading,
    hasNew,
    loadNotifications,
    loadUnreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    markSeen,
    setNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
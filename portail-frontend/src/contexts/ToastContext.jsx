// contexts/ToastContext.jsx - VERSION AMÉLIORÉE

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

const COLORS = {
  success: '#10B981',
  error:   '#ef4444',
  warning: '#F59E0B',
  info:    '#3b82f6',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast ${t.type}`}
            style={{ borderLeftColor: COLORS[t.type] }}
          >
            <span style={{ color: COLORS[t.type], flexShrink: 0, marginTop: 1 }}>
              {ICONS[t.type]}
            </span>
            <span style={{ flex: 1, fontSize: 14 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ color: '#94a3b8', flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
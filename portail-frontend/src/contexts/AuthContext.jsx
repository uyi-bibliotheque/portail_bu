// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, getMe } from '../services/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      const { data } = await getMe();
      setUser(data);
      return data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    if (data.user && data.user.role) {
      setUser(data.user);
      loadUser().catch(() => {});
      return data.user;
    }
    try {
      const userData = await loadUser();
      if (userData) return userData;
    } catch {}
    const fallbackUser = data.user ?? data;
    setUser(fallbackUser);
    return fallbackUser;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // ─── Rôles ──────────────────────────────────────────────────────
  const isStudent = user?.role === 'ETUDIANT';
  const isTeacher = user?.role === 'ENSEIGNANT';
  const isLibrarian = user?.role === 'BIBLIO';
  const isAideBiblio = user?.role === 'AIDE_BIBLIO';
  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;
  const isStaff = isLibrarian || isAdmin || isAideBiblio;

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 SOURCE UNIQUE DE VÉRITÉ pour la route d'accueil selon le rôle
  // ⚠️ ORDRE CRITIQUE : ADMIN → AIDE_BIBLIO → BIBLIO → défaut
  // car isStaff inclut isAideBiblio et masquerait la route spécifique
  // ═══════════════════════════════════════════════════════════════════
  const getHomeRoute = useCallback(() => {
    if (!user) return '/connexion';
    if (user.role === 'ADMIN' || user.is_superuser) return '/admin/dashboard';
    if (user.role === 'AIDE_BIBLIO') return '/aide-biblio';
    if (user.role === 'BIBLIO') return '/staff';
    return '/mon-compte';
  }, [user]);

  const getHomeLabel = useCallback(() => {
    if (!user) return 'Connexion';
    if (user.role === 'ADMIN' || user.is_superuser) return 'Admin';
    if (user.role === 'AIDE_BIBLIO') return 'Aide-Biblio';
    if (user.role === 'BIBLIO') return 'Espace Biblio';
    return 'Mon compte';
  }, [user]);

  const getRoleDisplay = useCallback(() => {
    if (!user) return 'Invité';
    const roles = {
      ADMIN: 'Administrateur',
      BIBLIO: 'Bibliothécaire',
      AIDE_BIBLIO: 'Aide-Bibliothécaire',
      ENSEIGNANT: 'Enseignant',
      ETUDIANT: 'Étudiant',
    };
    return roles[user.role] || 'Utilisateur';
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadUser,
        // Rôles booléens
        isStudent,
        isTeacher,
        isLibrarian,
        isAideBiblio,
        isAdmin,
        isStaff,
        // Helpers centralisés
        getHomeRoute,
        getHomeLabel,
        getRoleDisplay,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
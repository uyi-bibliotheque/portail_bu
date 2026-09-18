// pages/MonComptePage.jsx - VERSION COMPLÈTE AVEC MISE À JOUR PROFIL + MOT DE PASSE + PRÉFÉRENCES

import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, RefreshCw, X, Heart, Clock, AlertCircle, 
  ChevronRight, User, ArrowLeft, Mail, Phone, MapPin,
  Calendar, CheckCircle, Settings, Edit2, Save, Loader2,
  LogOut, Shield, Award, Building2, CreditCard, Globe,
  FileText, Download, Eye, CheckSquare, FileCheck, AlertTriangle,
  Library, BookMarked, TrendingUp, Users, GraduationCap,
  Fingerprint, QrCode, Scan, FileSignature, Printer, ExternalLink,
  Bell, CheckCheck, BellDot, Sparkles, Lock, KeyRound
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationList from '../components/notifications/NotificationList';
import {
  getMyLoans, renewLoan,
  getMyReservations, cancelReservation,
  getFavorites, removeFavorite,
  getUserAccount,
  updateProfile,
  changePassword,
  updatePreferences,
  getMyMemoires
} from '../services/endpoints';

// ─── CONFIGURATION DES STATUTS ────────────────────────────────────
const STATUS_LABEL = {
  brouillon: { label: 'Brouillon', badge: 'badge-slate', icon: '📝', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  depot_en_ligne: { label: 'Déposé en ligne', badge: 'badge-blue', icon: '📤', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  convocation_envoyee: { label: 'Convocation envoyée', badge: 'badge-amber', icon: '📧', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  en_attente_verification: { label: 'En vérification', badge: 'badge-purple', icon: '🔍', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  verification_ok: { label: 'Vérifié', badge: 'badge-green', icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  rejete: { label: 'Rejeté', badge: 'badge-red', icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  en_attente_quitus: { label: 'Quitus en attente', badge: 'badge-blue', icon: '⏳', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  quitus_disponible: { label: 'Quitus disponible', badge: 'badge-green', icon: '📄', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  quitus_retire: { label: 'Quitus retiré', badge: 'badge-green', icon: '📋', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

// ─── COMPOSANT STEPPER ────────────────────────────────────────────
function MemoireStatusStepper({ status, rejectionReason }) {
  const steps = [
    { key: 'depot_en_ligne', label: 'Dépôt', icon: '📤' },
    { key: 'convocation_envoyee', label: 'Convocation', icon: '📧' },
    { key: 'en_attente_verification', label: 'Vérification', icon: '🔍' },
    { key: 'verification_ok', label: 'Validé', icon: '✅' },
    { key: 'quitus_disponible', label: 'Quitus', icon: '📄' },
    { key: 'quitus_retire', label: 'Terminé', icon: '📋' },
  ];

  const statusIndex = steps.findIndex(s => s.key === status);
  const isRejected = status === 'rejete';

  if (isRejected) {
    return (
      <div className="stepper-rejected">
        <AlertTriangle size={16} color="#ef4444" />
        <span className="stepper-rejected-text">Dépôt rejeté</span>
        {rejectionReason && (
          <span className="stepper-rejected-reason">— {rejectionReason}</span>
        )}
      </div>
    );
  }

  if (status === 'quitus_retire') {
    return (
      <div className="stepper-completed">
        {steps.map((step, index) => (
          <div key={step.key} className="stepper-step completed">
            <span className="stepper-step-icon">{step.icon}</span>
            <span className="stepper-step-label">{step.label}</span>
            {index < steps.length - 1 && <div className="stepper-line completed" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isActive = index <= statusIndex;
        const isCurrent = index === statusIndex;
        
        return (
          <div key={step.key} className="stepper-step">
            <div className={`stepper-step-content ${isActive ? 'active' : 'inactive'}`}>
              <span className="stepper-step-icon">{step.icon}</span>
              <span className={`stepper-step-label ${isCurrent ? 'current' : ''}`}>
                {step.label}
              </span>
              {isCurrent && <span className="stepper-step-badge">En cours</span>}
            </div>
            {index < steps.length - 1 && (
              <div className={`stepper-line ${isActive && index < statusIndex ? 'active' : 'inactive'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPOSANT TAB BTN ────────────────────────────────────────────
function TabBtn({ active, onClick, children, count, icon }) {
  return (
    <button
      onClick={onClick}
      className={`tab-btn ${active ? 'active' : ''}`}
    >
      <span className="tab-btn-icon">{icon}</span>
      {children}
      {count !== undefined && count > 0 && (
        <span className="tab-btn-badge">{count}</span>
      )}
    </button>
  );
}

// ─── COMPOSANT STATS CARD ─────────────────────────────────────────
function StatsCard({ label, value, icon, color, onClick }) {
  return (
    <div 
      className="stats-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stats-card-content">
        <div className="stats-card-value" style={{ color }}>{value}</div>
        <div className="stats-card-label">{label}</div>
      </div>
      <div className="stats-card-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
export default function MonComptePage() {
  const { user, loading, logout, isStaff, isAdmin } = useAuth();
  const { addToast } = useToast();
  const { unreadCount, loadNotifications, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isEnglish = language === 'en';

  // Redirection pour admin/staff
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      if (isStaff) {
        navigate('/staff', { replace: true });
        return;
      }
    }
  }, [loading, user, isAdmin, isStaff, navigate]);

  // Récupérer l'onglet depuis l'URL
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam || 'depot';

  const [tab, setTab] = useState(initialTab);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservs] = useState([]);
  const [favorites, setFavs] = useState([]);
  const [memoires, setMemoires] = useState([]);
  const [loadingData, setLoadD] = useState(true);
  const [dataError, setDataError] = useState(null);
  
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ✅ NOUVEAUX ÉTATS : mot de passe + préférences
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [preferences, setPreferences] = useState({
    langue: 'fr',
    notifications_email: true,
    notifications_push: true,
    theme: 'light',
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // ─── Charger les informations du compte ────────────────────────
  const loadAccountInfo = async () => {
    if (!user) return;
    
    setAccountLoading(true);
    setAccountError(null);
    try {
      const response = await getUserAccount();
      
      if (response.data?.success && response.data?.account) {
        setAccountInfo(response.data.account);
        setEditData(response.data.account);
        if (response.data.account.preferences) {
          setPreferences(prev => ({ ...prev, ...response.data.account.preferences }));
        }
      } else if (response.data?.account) {
        setAccountInfo(response.data.account);
        setEditData(response.data.account);
      } else {
        const fallbackData = {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role || 'Étudiant',
          phone: user.phone || '',
          subscription_end_date: user.subscription_end_date || null,
          is_active: user.is_active !== undefined ? user.is_active : true,
          auth_source: user.auth_source || 'pmb'
        };
        setAccountInfo(fallbackData);
        setEditData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      }
      
      // Charger les préférences depuis user
      if (user.preferences) {
        setPreferences(prev => ({ ...prev, ...user.preferences }));
      }
    } catch (error) {
      console.error('Erreur chargement compte:', error);
      setAccountError('Impossible de charger les informations du compte');
      setAccountInfo({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || 'Étudiant',
        auth_source: user.auth_source || 'pmb'
      });
      setEditData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // ─── Sauvegarder les modifications du profil ───────────────────
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfile({
        first_name: editData.first_name || '',
        last_name: editData.last_name || '',
        email: editData.email || '',
      });
      
      if (response.status === 200 || response.data?.success) {
        setAccountInfo(prev => ({ 
          ...prev, 
          first_name: editData.first_name,
          last_name: editData.last_name,
          email: editData.email
        }));
        setIsEditing(false);
        addToast('✅ Profil mis à jour avec succès !', 'success');
        await loadAccountInfo();
      } else {
        addToast('Erreur lors de la mise à jour du profil', 'error');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      
      const errorData = error.response?.data;
      let errorMsg = 'Erreur lors de la mise à jour';
      
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (errorData?.detail) {
        errorMsg = errorData.detail;
      } else if (errorData?.email) {
        errorMsg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
      }
      
      addToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Changer le mot de passe ───────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordErrors({});
    
    // Validation locale
    const errors = {};
    
    if (!passwordData.old_password) {
      errors.old_password = 'L\'ancien mot de passe est requis';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'Le nouveau mot de passe est requis';
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = 'Minimum 6 caractères';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
    if (passwordData.old_password === passwordData.new_password) {
      errors.new_password = 'Le nouveau doit être différent de l\'ancien';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const response = await changePassword(passwordData);
      
      if (response.status === 200 || response.data?.success) {
        addToast('🔑 Mot de passe changé avec succès !', 'success');
        setShowPasswordModal(false);
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const backendErrors = {};
        Object.entries(errorData.errors).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setPasswordErrors(backendErrors);
        addToast('Veuillez corriger les erreurs', 'error');
      } else if (errorData?.detail) {
        addToast(errorData.detail, 'error');
      } else {
        addToast('Erreur lors du changement de mot de passe', 'error');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── Sauvegarder les préférences ──────────────────────────────
  const handleSavePreferences = async (newPrefs) => {
    setIsSavingPrefs(true);
    try {
      const response = await updatePreferences(newPrefs);
      
      if (response.status === 200 || response.data?.success) {
        setPreferences(newPrefs);
        addToast('⚙️ Préférences enregistrées', 'success');
      }
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      addToast('Erreur lors de la sauvegarde des préférences', 'error');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // ─── Toggle préférence booléenne ──────────────────────────────
  const handleTogglePreference = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    handleSavePreferences(newPrefs);
  };

  // ─── Chargement des données ────────────────────────────────────
  useEffect(() => {
    if (!user || isAdmin || isStaff) return;
    
    const loadAllData = async () => {
      setLoadD(true);
      setDataError(null);
      
      try {
        await loadAccountInfo();
        await loadNotifications();
        
        const [loansRes, reservsRes, favsRes, memoiresRes] = await Promise.all([
          getMyLoans().catch(err => {
            console.error('Erreur chargement prêts:', err);
            return { data: { results: [] } };
          }),
          getMyReservations().catch(err => {
            console.error('Erreur chargement réservations:', err);
            return { data: { results: [] } };
          }),
          getFavorites().catch(err => {
            console.error('Erreur chargement favoris:', err);
            return { data: { results: [] } };
          }),
          getMyMemoires().catch(err => {
            console.error('Erreur chargement mémoires:', err);
            return { data: { results: [] } };
          })
        ]);
        
        setLoans(loansRes.data?.results || loansRes.data || []);
        setReservs(reservsRes.data?.results || reservsRes.data || []);
        setFavs(favsRes.data?.results || favsRes.data || []);
        setMemoires(memoiresRes.data?.results || memoiresRes.data || []);
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
        setDataError('Erreur lors du chargement des données');
      } finally {
        setLoadD(false);
      }
    };
    
    loadAllData();
  }, [user, isAdmin, isStaff, loadNotifications]);

  // ─── Redirection si non connecté ──────────────────────────────
  if (!loading && !user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!loading && user && (isAdmin || isStaff)) {
    return null;
  }

  // ─── Gestionnaires d'actions ──────────────────────────────────
  const handleRenew = async (id) => {
    try {
      await renewLoan(id);
      addToast('Prêt renouvelé avec succès !', 'success');
      const response = await getMyLoans();
      setLoans(response.data?.results || response.data || []);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible de renouveler ce prêt.';
      addToast(msg, 'error');
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await cancelReservation(id);
      setReservs(prev => prev.filter(r => r.id !== id));
      addToast('Réservation annulée.', 'info');
    } catch (error) {
      addToast('Erreur lors de l\'annulation de la réservation.', 'error');
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await removeFavorite(id);
      setFavs(prev => prev.filter(f => f.id !== id));
      addToast('Retiré des favoris.', 'info');
    } catch (error) {
      addToast('Erreur lors du retrait des favoris.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    addToast('Déconnecté avec succès.', 'info');
  };

  // ─── Utilitaires ───────────────────────────────────────────────
  const today = new Date();
  const isOverdue = (due) => due && new Date(due) < today;

  const getRoleLabel = (role) => {
    const roles = {
      ADMIN: 'Administrateur',
      BIBLIO: 'Bibliothécaire',
      ETUDIANT: 'Étudiant',
      ENSEIGNANT: 'Enseignant / Chercheur'
    };
    return roles[role] || role || 'Utilisateur';
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: '#ef4444',
      BIBLIO: '#3b82f6',
      ETUDIANT: '#10b981',
      ENSEIGNANT: '#8b5cf6'
    };
    return colors[role] || 'var(--or)';
  };

  // Statistiques
  const stats = {
    total: memoires.length,
    en_attente: memoires.filter(m => ['depot_en_ligne', 'convocation_envoyee', 'en_attente_verification'].includes(m.status)).length,
    valides: memoires.filter(m => m.status === 'verification_ok' || m.status === 'en_attente_quitus').length,
    termines: memoires.filter(m => m.status === 'quitus_retire').length,
    rejetes: memoires.filter(m => m.status === 'rejete').length,
  };

  const activeDepots = memoires.filter(m => m.status !== 'quitus_retire' && m.status !== 'rejete');
  const pendingCount = activeDepots.length;

  if (user && (isAdmin || isStaff)) {
    return null;
  }

  return (
    <Layout>
      {/* ─── EN-TÊTE ─── */}
      <div className="profile-header">
        <div className="container">
          <button className="profile-back" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> {isEnglish ? 'Back home' : 'Retour à l\'accueil'}
          </button>
          
          <div className="profile-main">
            <div className="profile-avatar" style={{ borderColor: getRoleColor(user?.role) }}>
              <User size={36} color={getRoleColor(user?.role)} />
            </div>
            
            <div className="profile-info">
              <div className="profile-name-row">
                <h1 className="profile-name">
                  {accountInfo?.first_name || user?.first_name || user?.username}
                  {accountInfo?.last_name && ` ${accountInfo.last_name}`}
                </h1>
                <span className="profile-role" style={{ background: getRoleColor(user?.role) }}>
                  {getRoleLabel(user?.role)}
                </span>
                {accountInfo?.auth_source === 'pmb' && (
                  <span className="profile-source">
                    <Globe size={12} /> PMB
                  </span>
                )}
              </div>
              <div className="profile-details">
                {accountInfo?.email || user?.email ? (
                  <span><Mail size={14} /> {accountInfo?.email || user?.email}</span>
                ) : null}
                {accountInfo?.username && (
                  <span><User size={14} /> @{accountInfo.username}</span>
                )}
                {accountInfo?.is_active !== undefined && (
                  <span className={accountInfo.is_active ? 'text-green' : 'text-red'}>
                    <CheckCircle size={14} /> {accountInfo.is_active ? (isEnglish ? 'Active account' : 'Compte actif') : (isEnglish ? 'Inactive account' : 'Compte inactif')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn-outline-white" onClick={() => setIsEditing(true)} disabled={isEditing}>
                <Edit2 size={14} /> {isEnglish ? 'Edit' : 'Modifier'}
              </button>
              
              {/* ✅ NOUVEAU : Bouton changer mot de passe */}
              <button 
                className="btn-outline-white" 
                onClick={() => setShowPasswordModal(true)}
                title={isEnglish ? 'Change my password' : 'Changer mon mot de passe'}
              >
                <Shield size={14} /> {isEnglish ? 'Password' : 'Mot de passe'}
              </button>
              
              <button className="btn-outline-white btn-logout" onClick={handleLogout}>
                <LogOut size={14} /> {isEnglish ? 'Logout' : 'Déconnexion'}
              </button>
            </div>
          </div>

          {/* Infos du compte */}
          {accountLoading ? (
            <div className="profile-account-loading">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
              ))}
            </div>
          ) : accountError ? (
            <div className="profile-account-error">
              <AlertCircle size={16} /> {accountError}
            </div>
          ) : accountInfo && (
            <div className="profile-account-info">
              {isEditing ? (
                <div className="profile-edit-form">
                  <div className="profile-edit-grid">
                    <div>
                      <label>{isEnglish ? 'First name *' : 'Prénom *'}</label>
                      <input
                        value={editData.first_name || ''}
                        onChange={e => setEditData({...editData, first_name: e.target.value})}
                        placeholder={isEnglish ? 'Your first name' : 'Votre prénom'}
                      />
                    </div>
                    <div>
                      <label>{isEnglish ? 'Last name *' : 'Nom *'}</label>
                      <input
                        value={editData.last_name || ''}
                        onChange={e => setEditData({...editData, last_name: e.target.value})}
                        placeholder={isEnglish ? 'Your last name' : 'Votre nom'}
                      />
                    </div>
                    <div>
                      <label>{isEnglish ? 'Email *' : 'Email *'}</label>
                      <input
                        value={editData.email || ''}
                        onChange={e => setEditData({...editData, email: e.target.value})}
                        placeholder="votre@email.com"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="profile-edit-actions">
                    <button className="btn-or" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                      {isSaving ? (isEnglish ? 'Saving...' : 'Enregistrement...') : (isEnglish ? 'Save' : 'Enregistrer')}
                    </button>
                    <button className="btn-outline" onClick={() => { setIsEditing(false); setEditData(accountInfo); }} disabled={isSaving}>
                      <X size={14} /> {isEnglish ? 'Cancel' : 'Annuler'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {accountInfo.first_name && (
                    <div className="profile-field">
                      <User size={16} color="#3b82f6" />
                      <div>
                        <span className="profile-field-label">{isEnglish ? 'Full name' : 'Nom complet'}</span>
                        <span className="profile-field-value">
                          {accountInfo.first_name} {accountInfo.last_name || ''}
                        </span>
                      </div>
                    </div>
                  )}
                  {accountInfo.email && (
                    <div className="profile-field">
                      <Mail size={16} color="#8b5cf6" />
                      <div>
                        <span className="profile-field-label">Email</span>
                        <span className="profile-field-value">{accountInfo.email}</span>
                      </div>
                    </div>
                  )}
                  {accountInfo.username && (
                    <div className="profile-field">
                      <Fingerprint size={16} color="#f59e0b" />
                      <div>
                        <span className="profile-field-label">{isEnglish ? 'Username' : 'Identifiant'}</span>
                        <span className="profile-field-value">{accountInfo.username}</span>
                      </div>
                    </div>
                  )}
                  {accountInfo.subscription_end_date && (
                    <div className="profile-field">
                      <Calendar size={16} color="#10b981" />
                      <div>
                        <span className="profile-field-label">{isEnglish ? 'Subscription end' : 'Fin d\'abonnement'}</span>
                        <span className="profile-field-value">
                          {new Date(accountInfo.subscription_end_date).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ✅ NOUVEAU : Section Préférences */}
              {!isEditing && (
                <div className="profile-preferences">
                  <h3 className="profile-preferences-title">
                    <Settings size={16} /> {isEnglish ? 'Preferences' : 'Préférences'}
                  </h3>
                  
                  <div className="preferences-grid">
                    {/* Langue */}
                    <div className="preference-item">
                      <div className="preference-info">
                        <Globe size={16} color="#8b5cf6" />
                        <div>
                          <span className="preference-label">{isEnglish ? 'Language' : 'Langue'}</span>
                          <span className="preference-desc">{isEnglish ? 'Interface language' : 'Langue de l\'interface'}</span>
                        </div>
                      </div>
                      <select
                        value={preferences.langue || 'fr'}
                        onChange={(e) => handleSavePreferences({ ...preferences, langue: e.target.value })}
                        className="preference-select"
                        disabled={isSavingPrefs}
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Notifications email */}
                    <div className="preference-item">
                      <div className="preference-info">
                        <Mail size={16} color="#10b981" />
                        <div>
                          <span className="preference-label">{isEnglish ? 'Email notifications' : 'Notifications email'}</span>
                          <span className="preference-desc">{isEnglish ? 'Receive email updates' : 'Recevoir les actualités par email'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('notifications_email')}
                        className={`toggle-btn ${preferences.notifications_email ? 'active' : ''}`}
                        disabled={isSavingPrefs}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>

                    {/* Notifications push */}
                    <div className="preference-item">
                      <div className="preference-info">
                        <Bell size={16} color="#f59e0b" />
                        <div>
                          <span className="preference-label">{isEnglish ? 'Push notifications' : 'Notifications push'}</span>
                          <span className="preference-desc">{isEnglish ? 'Real-time alerts' : 'Alertes en temps réel'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference('notifications_push')}
                        className={`toggle-btn ${preferences.notifications_push ? 'active' : ''}`}
                        disabled={isSavingPrefs}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>

                    {/* Thème */}
                    <div className="preference-item">
                      <div className="preference-info">
                        <Sparkles size={16} color="#3b82f6" />
                        <div>
                          <span className="preference-label">{isEnglish ? 'Theme' : 'Thème'}</span>
                          <span className="preference-desc">{isEnglish ? 'Display theme' : 'Thème d\'affichage'}</span>
                        </div>
                      </div>
                      <select
                        value={preferences.theme || 'light'}
                        onChange={(e) => handleSavePreferences({ ...preferences, theme: e.target.value })}
                        className="preference-select"
                        disabled={isSavingPrefs}
                      >
                        <option value="light">{isEnglish ? 'Light' : 'Clair'}</option>
                        <option value="dark">{isEnglish ? 'Dark' : 'Sombre'}</option>
                        <option value="auto">{isEnglish ? 'Auto' : 'Automatique'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── CORPS DE LA PAGE ─── */}
      <div className="container page-body">
        {/* Statistiques */}
        {!loadingData && !dataError && memoires.length > 0 && (
          <div className="stats-grid">
            <StatsCard
              label={isEnglish ? 'Total submissions' : 'Total des dépôts'}
              value={stats.total}
              icon={<FileText size={20} />}
              color="#1B1464"
            />
            <StatsCard
              label={isEnglish ? 'In progress' : 'En cours'}
              value={stats.en_attente}
              icon={<Clock size={20} />}
              color="#F59E0B"
            />
            <StatsCard
              label={isEnglish ? 'Validated' : 'Validés'}
              value={stats.valides}
              icon={<CheckCircle size={20} />}
              color="#10B981"
            />
            <StatsCard
              label={isEnglish ? 'Completed' : 'Terminés'}
              value={stats.termines}
              icon={<Award size={20} />}
              color="#8b5cf6"
            />
            {stats.rejetes > 0 && (
              <StatsCard
                label={isEnglish ? 'Rejected' : 'Rejetés'}
                value={stats.rejetes}
                icon={<AlertCircle size={20} />}
                color="#ef4444"
              />
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <TabBtn 
              active={tab === 'depot'} 
              onClick={() => setTab('depot')}
              icon="📄"
              count={pendingCount}
            >
              {isEnglish ? 'Submissions' : 'Dépôts'}
            </TabBtn>
            <TabBtn 
              active={tab === 'loans'} 
              onClick={() => setTab('loans')}
              icon="📚"
              count={loans.length}
            >
              {isEnglish ? 'Loans' : 'Prêts'}
            </TabBtn>
            <TabBtn 
              active={tab === 'reservations'} 
              onClick={() => setTab('reservations')}
              icon="🔖"
              count={reservations.length}
            >
              {isEnglish ? 'Reservations' : 'Réservations'}
            </TabBtn>
            <TabBtn 
              active={tab === 'favorites'} 
              onClick={() => setTab('favorites')}
              icon="❤️"
              count={favorites.length}
            >
              {isEnglish ? 'Favorites' : 'Favoris'}
            </TabBtn>
            <TabBtn 
              active={tab === 'notifications'} 
              onClick={() => setTab('notifications')}
              icon={<Bell size={16} />}
              count={unreadCount}
            >
              {isEnglish ? 'Notifications' : 'Notifications'}
            </TabBtn>
          </div>
        </div>

        {/* ─── CHARGEMENT ─── */}
        {loadingData && (
          <div className="loading-state">
            <Loader2 size={40} className="spin" color="var(--or)" />
            <p>{isEnglish ? 'Loading your data...' : 'Chargement de vos données...'}</p>
          </div>
        )}

        {/* ─── ERREUR ─── */}
        {dataError && !loadingData && (
          <div className="error-state">
            <AlertCircle size={32} color="#ef4444" />
            <p>{dataError}</p>
            <button className="btn-ghost btn-sm" onClick={() => window.location.reload()}>
              {isEnglish ? 'Retry' : 'Réessayer'}
            </button>
          </div>
        )}

        {!loadingData && !dataError && (
          <>
            {/* ─── DÉPÔTS ─── */}
            {tab === 'depot' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">{isEnglish ? 'My thesis submissions' : 'Mes dépôts de mémoires'}</h2>
                  <Link to="/depot/soumettre" className="btn-bleu btn-sm">
                    <FileText size={14} /> {isEnglish ? '+ New submission' : '+ Nouveau dépôt'}
                  </Link>
                </div>

                {memoires.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">📄</span>
                    <h3 className="empty-state-title">{isEnglish ? 'No submission yet' : 'Aucun dépôt effectué'}</h3>
                    <p className="empty-state-desc">
                      {isEnglish ? 'Start by submitting your dissertation or thesis online.' : 'Commencez par déposer votre mémoire ou thèse en ligne.'}
                    </p>
                    <Link to="/depot/soumettre" className="btn-bleu" style={{ marginTop: 16 }}>
                      <FileText size={16} /> {isEnglish ? 'Submit now' : 'Déposer maintenant'}
                    </Link>
                  </div>
                ) : (
                  <div className="depots-list">
                    {memoires.map(depot => {
                      const statusInfo = STATUS_LABEL[depot.status] || STATUS_LABEL['depot_en_ligne'];
                      const isRejected = depot.status === 'rejete';
                      const isQuitusAvailable = depot.status === 'quitus_disponible' || depot.status === 'quitus_retire';
                      
                      return (
                        <div key={depot.id} className={`depot-card ${isRejected ? 'rejected' : ''}`}>
                          <div className="depot-header">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="depot-badges">
                                <span className={`badge ${statusInfo.badge}`}>
                                  {statusInfo.icon} {statusInfo.label}
                                </span>
                                {depot.is_quitus_signed && (
                                  <span className="badge badge-green">✅ Quitus signé</span>
                                )}
                                {depot.is_quitus_physically_signed && (
                                  <span className="badge badge-green">📄 Signé physiquement</span>
                                )}
                              </div>
                              <h3 className="depot-title">{depot.title}</h3>
                              <div className="depot-meta">
                                <span>
                                  <Building2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {depot.filiere || depot.department || 'Filière non spécifiée'}
                                </span>
                                <span>
                                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {new Date(depot.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="depot-actions">
                              {depot.status !== 'quitus_retire' && depot.status !== 'rejete' && (
                                <Link to={`/depot/soumettre?edit=${depot.id}`} className="btn-ghost btn-sm">
                                  <Edit2 size={13} /> {isEnglish ? 'Edit' : 'Modifier'}
                                </Link>
                              )}
                              <Link to={`/depot/${depot.id}`} className="btn-ghost btn-sm">
                                <Eye size={13} /> {isEnglish ? 'Details' : 'Détail'}
                              </Link>
                              
                              {isQuitusAvailable && (
                                <Link 
                                  to={`/depot/${depot.id}?view=quitus`}
                                  className="btn-primary btn-sm"
                                  style={{ 
                                    background: '#8b5cf6', 
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                  title="Visualiser le quitus (à récupérer physiquement à la bibliothèque)"
                                >
                                  <Eye size={13} /> Voir quitus
                                </Link>
                              )}
                            </div>
                          </div>

                          <MemoireStatusStepper 
                            status={depot.status} 
                            rejectionReason={depot.rejection_reason} 
                          />

                          {isQuitusAvailable && (
                            <div className={`quitus-info ${depot.is_quitus_physically_signed ? 'signed' : 'available'}`}>
                              <AlertCircle size={16} />
                              <span>
                                <strong>{isEnglish ? 'Quitus available' : 'Quitus disponible'}</strong> — 
                                {depot.is_quitus_physically_signed 
                                  ? (isEnglish ? ' ✅ You have signed the quitus physically.' : ' ✅ Vous avez signé physiquement le quitus.')
                                  : (isEnglish ? ' 📄 Please go to the library to sign and collect your quitus.' : ' 📄 Veuillez vous rendre à la bibliothèque pour signer et récupérer votre quitus.')
                                }
                              </span>
                            </div>
                          )}

                          {depot.rejection_reason && (
                            <div className="rejection-message">
                              <AlertTriangle size={16} color="#ef4444" />
                              <span><strong>{isEnglish ? 'Reason for rejection:' : 'Motif du rejet :'}</strong> {depot.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── PRÊTS ─── */}
            {tab === 'loans' && (
              <div>
                <div className="section-header" style={{ marginBottom: 16 }}>
                  <h2 className="section-title">{isEnglish ? 'Current loans (PMB tracking)' : 'Prêts en cours (Suivi PMB)'}</h2>
                </div>

                <div className="pmb-info-banner" style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--bleu-nuit)'
                }}>
                  <BookOpen size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>{isEnglish ? 'Loan information:' : 'Information sur les prêts :'}</strong> {isEnglish ? 'Physical borrowings and withdrawals are handled directly at the University Library counters. This table shows the real-time tracking of your loans registered on your PMB reader account.' : 'Les emprunts et retraits physiques de documents s\'effectuent directement aux guichets de la Bibliothèque Universitaire. Ce tableau présente le suivi en temps réel de vos emprunts enregistrés sur votre compte lecteur PMB.'}
                  </div>
                </div>

                {loans.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">📚</span>
                    <h3 className="empty-state-title">{isEnglish ? 'No current loans' : 'Aucun prêt en cours'}</h3>
                    <p className="empty-state-desc">
                      {isEnglish ? 'You do not currently have any borrowed books. Visit the University Library to borrow physical books.' : 'Vous n\'avez aucun livre emprunté pour le moment. Rendez-vous à la Bibliothèque Universitaire pour emprunter des ouvrages physiques.'}
                    </p>
                    <Link to="/catalogue" className="btn-bleu" style={{ marginTop: 16 }}>
                      <BookOpen size={16} /> {isEnglish ? 'Browse the catalog' : 'Explorer le catalogue'}
                    </Link>
                  </div>
                ) : (
                  <div className="items-list">
                    {loans.map(loan => {
                      const overdue = isOverdue(loan.due_date);
                      return (
                        <div key={loan.id} className={`item-card ${overdue ? 'overdue' : ''}`}>
                          <div className="item-info">
                            <span className="item-icon">📚</span>
                            <div className="item-details">
                              <Link to={`/catalogue/notice/${loan.notice_id}`} className="item-title">
                                {loan.title}
                              </Link>
                              <div className="item-author">{loan.author}</div>
                              <div className={`item-meta ${overdue ? 'overdue-text' : ''}`}>
                                <Clock size={13} />
                                {overdue ? '⚠️ Retard – ' : 'À retourner le '}
                                {new Date(loan.due_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRenew(loan.id)}
                            className="btn-bleu btn-sm"
                            disabled={!loan.renewable}
                            title={!loan.renewable ? (isEnglish ? 'Renewal unavailable online for this item (check the BU desk)' : 'Renouvellement non disponible en ligne pour cet ouvrage (consultez le guichet BU)') : ''}
                          >
                            <RefreshCw size={13} /> {loan.renewable ? (isEnglish ? 'Renew' : 'Renouveler') : (isEnglish ? 'Not renewable' : 'Non renouvelable')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── RÉSERVATIONS ─── */}
            {tab === 'reservations' && (
              <div>
                <div className="section-header" style={{ marginBottom: 16 }}>
                  <h2 className="section-title">{isEnglish ? 'My reservations (PMB tracking)' : 'Mes réservations (Suivi PMB)'}</h2>
                </div>

                <div className="pmb-info-banner" style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--bleu-nuit)'
                }}>
                  <BookMarked size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>{isEnglish ? 'Reservation information:' : 'Information sur les réservations :'}</strong> {isEnglish ? 'Reservations and withdrawals of documents are handled on site at the University Library counters. This section shows your active requests synchronized with the PMB integrated library system.' : 'Les réservations et retraits d\'ouvrages se font directement sur place aux guichets de la Bibliothèque Universitaire. Cette section affiche vos demandes actives synchronisées avec le SIGB PMB.'}
                  </div>
                </div>

                {reservations.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">🔖</span>
                    <h3 className="empty-state-title">{isEnglish ? 'No reservations' : 'Aucune réservation'}</h3>
                    <p className="empty-state-desc">
                      {isEnglish ? 'You do not have any reservations recorded. To reserve a document on the shelf or on loan, go directly to the BU counters.' : 'Vous n\'avez aucune réservation enregistrée. Pour réserver un document en rayon ou en prêt, adressez-vous directement aux guichets de la BU.'}
                    </p>
                    <Link to="/catalogue" className="btn-bleu" style={{ marginTop: 16 }}>
                      <BookOpen size={16} /> {isEnglish ? 'Browse the catalog' : 'Parcourir le catalogue'}
                    </Link>
                  </div>
                ) : (
                  <div className="items-list">
                    {reservations.map(r => (
                      <div key={r.id} className="item-card">
                        <div className="item-info">
                          <span className="item-icon">📗</span>
                          <div className="item-details">
                            <Link to={`/catalogue/notice/${r.notice_id}`} className="item-title">
                              {r.title}
                            </Link>
                            <div className="item-author">{r.author}</div>
                            <div className="item-meta">
                              <span className="badge badge-or" style={{ fontSize: 11 }}>
                                Position : {r.queue_pos}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelReservation(r.id)}
                          className="btn-ghost btn-sm"
                          style={{ color: 'var(--red)' }}
                        >
                          <X size={13} /> {isEnglish ? 'Cancel' : 'Annuler'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── FAVORIS ─── */}
            {tab === 'favorites' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">{isEnglish ? 'My favorites' : 'Mes favoris'}</h2>
                  <Link to="/favoris" className="btn-bleu btn-sm">
                    ❤️ {isEnglish ? 'View all favorites' : 'Voir tous mes favoris'}
                  </Link>
                </div>
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">❤️</span>
                    <h3 className="empty-state-title">{isEnglish ? 'No favorites' : 'Aucun favori'}</h3>
                    <p className="empty-state-desc">{isEnglish ? 'Save your favorite works to find them easily.' : 'Sauvegardez vos ouvrages préférés pour les retrouver facilement.'}</p>
                    <Link to="/catalogue" className="btn-bleu" style={{ marginTop: 16 }}>
                      <BookOpen size={16} /> {isEnglish ? 'Browse the catalog' : 'Explorer le catalogue'}
                    </Link>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map(f => (
                      <div key={f.id} className="favorite-card">
                        <div className="favorite-icon">📚</div>
                        <div className="favorite-body">
                          <Link to={`/catalogue/notice/${f.notice_id}`} className="favorite-title">
                            {f.title}
                          </Link>
                          <div className="favorite-author">{f.author}</div>
                          <button
                            onClick={() => handleRemoveFavorite(f.id)}
                            className="favorite-remove"
                          >
                            <Heart size={12} fill="#ef4444" color="#ef4444" /> {isEnglish ? 'Remove' : 'Retirer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {tab === 'notifications' && (
              <div style={{ marginTop: 20 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bell size={20} color="var(--or)" />
                      {isEnglish ? 'My notifications' : 'Mes notifications'}
                    </h3>
                    <p style={{ color: 'var(--texte-muted)', margin: '4px 0 0', fontSize: 14 }}>
                      {unreadCount > 0 
                        ? (isEnglish ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`)
                        : (isEnglish ? 'All your notifications have been read ✨' : 'Toutes vos notifications sont lues ✨')}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="btn btn-bleu btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <CheckCheck size={16} /> {isEnglish ? 'Mark all as read' : 'Tout marquer comme lu'}
                    </button>
                  )}
                </div>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}
                >
                  <NotificationList compact={false} />
                </div>
              </div>
            )}

          </>
        )}

        {/* Navigation */}
        <div className="page-footer-nav">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft size={16} /> {isEnglish ? 'Back' : 'Retour'}
          </button>
          <Link to="/" className="btn-bleu">
            🏠 {isEnglish ? 'Home' : 'Accueil'}
          </Link>
        </div>
      </div>

      {/* ✅ MODAL DE CHANGEMENT DE MOT DE PASSE */}
      {showPasswordModal && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isChangingPassword) {
              setShowPasswordModal(false);
              setPasswordErrors({});
            }
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Shield size={20} />
                {isEnglish ? 'Change password' : 'Changer le mot de passe'}
              </h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordErrors({});
                  setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                }}
                className="modal-close"
                disabled={isChangingPassword}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Ancien mot de passe */}
              <div className="password-field">
                <label>{isEnglish ? 'Current password' : 'Mot de passe actuel'}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.old ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    placeholder={isEnglish ? 'Your current password' : 'Votre mot de passe actuel'}
                    className={passwordErrors.old_password ? 'error' : ''}
                    disabled={isChangingPassword}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                    tabIndex={-1}
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {passwordErrors.old_password && (
                  <span className="password-error">
                    <AlertCircle size={12} /> {passwordErrors.old_password}
                  </span>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div className="password-field">
                <label>{isEnglish ? 'New password' : 'Nouveau mot de passe'}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder={isEnglish ? 'At least 6 characters' : 'Au moins 6 caractères'}
                    className={passwordErrors.new_password ? 'error' : ''}
                    disabled={isChangingPassword}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    tabIndex={-1}
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <span className="password-error">
                    <AlertCircle size={12} /> {passwordErrors.new_password}
                  </span>
                )}
              </div>

              {/* Confirmation */}
              <div className="password-field">
                <label>{isEnglish ? 'Confirm password' : 'Confirmer le mot de passe'}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder={isEnglish ? 'Retype new password' : 'Retaper le nouveau mot de passe'}
                    className={passwordErrors.confirm_password ? 'error' : ''}
                    disabled={isChangingPassword}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    tabIndex={-1}
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {passwordErrors.confirm_password && (
                  <span className="password-error">
                    <AlertCircle size={12} /> {passwordErrors.confirm_password}
                  </span>
                )}
              </div>

              <div className="password-hint">
                <AlertCircle size={14} />
                <span>
                  {isEnglish 
                    ? 'Password must be at least 6 characters and different from the current one.' 
                    : 'Le mot de passe doit contenir au moins 6 caractères et être différent de l\'actuel.'}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordErrors({});
                  setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                }}
                className="btn-ghost"
                disabled={isChangingPassword}
              >
                {isEnglish ? 'Cancel' : 'Annuler'}
              </button>
              <button
                onClick={handleChangePassword}
                className="btn-or"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    {isEnglish ? 'Updating...' : 'Modification...'}
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    {isEnglish ? 'Change password' : 'Changer le mot de passe'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ─── PROFILE HEADER ─── */
        .profile-header {
          background: var(--bleu-nuit);
          padding: 32px 0;
        }
        .profile-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          margin-bottom: 16px;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          font-family: inherit;
        }
        .profile-back:hover { color: white; }

        .profile-main {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--or);
          flex-shrink: 0;
        }
        .profile-info { flex: 1; min-width: 0; }
        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .profile-name {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .profile-role {
          padding: 4px 14px;
          border-radius: 50px;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        .profile-source {
          padding: 4px 12px;
          border-radius: 50px;
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid rgba(59,130,246,0.3);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .profile-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
        }
        .profile-details span { display: inline-flex; align-items: center; gap: 6px; }
        .text-green { color: #4ade80; }
        .text-red { color: #f87171; }

        .profile-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .btn-outline-white {
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-outline-white:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.3);
        }
        .btn-outline-white:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-logout {
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
        }
        .btn-logout:hover {
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.1);
        }

        .profile-account-loading {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .profile-account-error {
          margin-top: 20px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.1);
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .profile-account-info {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .profile-field {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 0;
        }
        .profile-field-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.4);
        }
        .profile-field-value {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
        }

        .profile-edit-form {
          grid-column: 1 / -1;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .profile-edit-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .profile-edit-grid label {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 4px;
        }
        .profile-edit-grid input {
          width: 100%;
          padding: 8px 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .profile-edit-grid input:focus {
          outline: none;
          border-color: var(--or);
        }
        .profile-edit-grid input::placeholder { color: rgba(255,255,255,0.3); }
        .profile-edit-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        /* ─── PRÉFÉRENCES ─── */
        .profile-preferences {
          grid-column: 1 / -1;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .profile-preferences-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 16px;
        }
        .preferences-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .preference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .preference-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
        }
        .preference-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .preference-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
        }
        .preference-desc {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 1px;
        }
        .preference-select {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          min-width: 100px;
          transition: all 0.2s;
        }
        .preference-select:focus {
          outline: none;
          border-color: var(--or);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
        }
        .preference-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .preference-select option {
          background: #1B1464;
          color: white;
        }

        /* ─── TOGGLE SWITCH ─── */
        .toggle-btn {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 50px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
          flex-shrink: 0;
        }
        .toggle-btn.active {
          background: #10B981;
          border-color: #10B981;
        }
        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-btn.active .toggle-knob {
          left: 22px;
        }
        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ─── MODAL ─── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0,0,0,0.4);
          animation: slideUp 0.3s ease;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px 16px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: var(--bleu-nuit);
          margin: 0;
        }
        .modal-close {
          background: var(--beige);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--texte-muted);
          transition: all 0.2s;
        }
        .modal-close:hover:not(:disabled) {
          background: var(--border);
          color: var(--texte);
        }
        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 28px 24px;
          border-top: 1px solid var(--border);
        }

        /* ─── PASSWORD FIELDS ─── */
        .password-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .password-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--texte);
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input-wrapper input {
          width: 100%;
          padding: 10px 40px 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          transition: all 0.2s;
          color: var(--texte);
        }
        .password-input-wrapper input:focus {
          outline: none;
          border-color: var(--or);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .password-input-wrapper input.error {
          border-color: #ef4444;
          background: rgba(239,68,68,0.03);
        }
        .password-input-wrapper input:disabled {
          background: var(--beige);
          cursor: not-allowed;
        }
        .password-toggle {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--texte-muted);
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle:hover {
          background: var(--beige);
          color: var(--texte);
        }
        .password-error {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }
        .password-hint {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(124,58,237,0.06);
          border-radius: 8px;
          font-size: 12px;
          color: var(--texte-muted);
          line-height: 1.5;
          border: 1px solid rgba(124,58,237,0.15);
        }
        .password-hint svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--or);
        }

        /* ─── PAGE BODY ─── */
        .page-body { padding: 32px 24px; }

        /* ─── STATS ─── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }
        .stats-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid var(--border);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .stats-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.07);
          border-color: var(--or);
        }
        .stats-card-content { flex: 1; min-width: 0; }
        .stats-card-value { font-size: 26px; font-weight: 800; line-height: 1.2; }
        .stats-card-label { font-size: 12px; color: var(--texte-muted); margin-top: 2px; font-weight: 500; }
        .stats-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        /* ─── STEPPER ─── */
        .stepper, .stepper-completed {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-top: 14px;
          padding: 6px 2px;
          scrollbar-width: none;
        }
        .stepper::-webkit-scrollbar, .stepper-completed::-webkit-scrollbar {
          display: none;
        }
        .stepper-step {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .stepper-step-content {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 12px;
          transition: all 0.3s;
          border: 1px solid var(--border);
          white-space: nowrap;
        }
        .stepper-step-content.active {
          background: rgba(16,185,129,0.08);
          border-color: #10B981;
          color: #047857;
        }
        .stepper-step-content.inactive {
          opacity: 0.5;
          background: var(--beige);
        }
        .stepper-step-icon { font-size: 13px; }
        .stepper-step-label { font-weight: 500; }
        .stepper-step-label.current { font-weight: 700; color: #10B981; }
        .stepper-step-badge {
          font-size: 9px;
          background: #10B981;
          color: white;
          padding: 1px 8px;
          border-radius: 50px;
          animation: pulse 2s infinite;
        }
        .stepper-line {
          width: 20px;
          height: 2px;
          border-radius: 1px;
          margin: 0 4px;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .stepper-line.active { background: #10B981; }
        .stepper-line.inactive { background: var(--border); }
        .stepper-line.completed { background: #10B981; }

        .stepper-completed .stepper-step.completed .stepper-step-content {
          background: rgba(16,185,129,0.08);
          border-color: #10B981;
        }
        .stepper-completed .stepper-step-label { color: #10B981; }

        .stepper-rejected {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(239,68,68,0.06);
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.18);
          margin-top: 12px;
        }
        .stepper-rejected-text { font-weight: 600; color: #b91c1c; font-size: 12px; }
        .stepper-rejected-reason { font-size: 12px; color: #991b1b; }

        /* ─── DEPOT CARD ─── */
        .depot-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 20px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .depot-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          border-color: var(--or);
          transform: translateY(-2px);
        }
        .depot-card.rejected { border-color: rgba(239,68,68,0.3); }
        .depot-card .depot-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; }
        .depot-card .depot-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .depot-card .depot-title { font-size: 16px; font-weight: 700; color: var(--bleu-nuit); margin-bottom: 6px; line-height: 1.3; }
        .depot-card .depot-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--texte-muted); }
        .depot-card .depot-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        /* ─── QUITUS INFO ─── */
        .quitus-info {
          margin-top: 14px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quitus-info.available {
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          color: #6d28d9;
        }
        .quitus-info.signed {
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          color: #065f46;
        }

        /* ─── ITEM CARD ─── */
        .item-card {
          background: white;
          border-radius: 14px;
          border: 1px solid var(--border);
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .item-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          border-color: var(--or);
        }
        .item-card.overdue { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.02); }
        .item-card .item-info { display: flex; gap: 14px; align-items: center; min-width: 0; flex: 1; }
        .item-card .item-icon { font-size: 32px; flex-shrink: 0; }
        .item-card .item-details { min-width: 0; flex: 1; }
        .item-card .item-title { font-weight: 700; font-size: 14px; color: var(--bleu-nuit); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .item-card .item-author { font-size: 13px; color: var(--texte-muted); margin-top: 2px; }
        .item-card .item-meta { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; }
        .item-card .item-meta.overdue-text { color: var(--red); font-weight: 700; }

        /* ─── EMPTY STATE ─── */
        .empty-state {
          text-align: center;
          padding: 60px 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
        }
        .empty-state-icon { font-size: 56px; margin-bottom: 16px; display: block; }
        .empty-state-title { font-size: 18px; font-weight: 600; color: var(--texte); margin-bottom: 8px; }
        .empty-state-desc { color: var(--texte-muted); font-size: 14px; max-width: 400px; margin: 0 auto; }

        /* ─── TABS ─── */
        .tabs-container {
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .tabs-container::-webkit-scrollbar { display: none; }
        .tabs {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          white-space: nowrap;
          min-width: max-content;
        }
        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          background: white;
          color: var(--texte-muted);
          border: 1px solid var(--border);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          font-family: inherit;
          position: relative;
          user-select: none;
        }
        .tab-btn:hover:not(.active) {
          background: var(--beige);
          border-color: var(--border);
          color: var(--bleu-nuit);
        }
        .tab-btn.active {
          background: var(--bleu-nuit);
          color: white;
          border-color: var(--bleu-nuit);
          box-shadow: 0 4px 14px rgba(27,20,100,0.2);
        }
        .tab-btn-icon { font-size: 15px; }
        .tab-btn-badge {
          background: var(--or);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 50px;
          min-width: 20px;
          text-align: center;
        }
        .tab-btn.active .tab-btn-badge {
          background: rgba(255,255,255,0.25);
        }

        /* ─── SECTIONS ─── */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        /* ─── LOADING / ERROR ─── */
        .loading-state {
          text-align: center;
          padding: 60px 24px;
        }
        .loading-state p {
          margin-top: 16px;
          color: var(--texte-muted);
        }
        .error-state {
          text-align: center;
          padding: 40px 24px;
          background: rgba(239,68,68,0.05);
          border-radius: 12px;
          border: 1px solid rgba(239,68,68,0.15);
        }
        .error-state p {
          color: #b91c1c;
          margin: 12px 0;
        }

        /* ─── DEPOTS LIST ─── */
        .depots-list { display: flex; flex-direction: column; gap: 16px; }
        .rejection-message {
          margin-top: 12px;
          padding: 10px 14px;
          background: rgba(239,68,68,0.05);
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.15);
          font-size: 13px;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ─── ITEMS LIST ─── */
        .items-list { display: flex; flex-direction: column; gap: 12px; }

        /* ─── FAVORITES GRID ─── */
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .favorite-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .favorite-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: var(--or);
        }
        .favorite-icon {
          height: 80px;
          background: linear-gradient(135deg, var(--beige), var(--beige-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          border-bottom: 1px solid var(--border);
        }
        .favorite-body { padding: 16px 20px 20px; }
        .favorite-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--bleu-nuit);
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .favorite-author {
          font-size: 13px;
          color: var(--texte-muted);
          margin: 4px 0 12px;
        }
        .favorite-remove {
          background: none;
          border: none;
          color: var(--red);
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: opacity 0.2s;
        }
        .favorite-remove:hover { opacity: 0.7; }

        /* ─── FOOTER NAV ─── */
        .page-footer-nav {
          margin-top: 48px;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        /* ─── BTN UTILITIES ─── */
        .btn-sm { padding: 6px 14px; font-size: 12px; }
        .btn-or {
          background: var(--or);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-or:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-or:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-bleu {
          background: var(--bleu-nuit);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .btn-bleu:hover { opacity: 0.85; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(27,20,100,0.15); }
        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--texte);
        }
        .btn-ghost:hover { border-color: var(--or); color: var(--or); }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.8);
        }
        .btn-outline:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
        .btn-primary {
          background: var(--or);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
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
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ─── BADGES ─── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-slate { background: rgba(148,163,184,0.12); color: #94a3b8; }
        .badge-blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .badge-amber { background: rgba(245,158,11,0.12); color: #F59E0B; }
        .badge-purple { background: rgba(139,92,246,0.12); color: #8b5cf6; }
        .badge-green { background: rgba(16,185,129,0.12); color: #10B981; }
        .badge-red { background: rgba(239,68,68,0.12); color: #ef4444; }
        .badge-or { background: rgba(245,158,11,0.12); color: #F59E0B; }

        /* ─── ANIMATIONS ─── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
        .skeleton {
          background: linear-gradient(90deg, var(--beige) 25%, var(--border) 50%, var(--beige) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
          .favorites-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        }

        @media (max-width: 768px) {
          .profile-main {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            gap: 16px;
          }
          .profile-avatar { width: 68px; height: 68px; }
          .profile-name-row { justify-content: flex-start; gap: 8px; }
          .profile-details { justify-content: flex-start; gap: 12px; font-size: 13px; }
          .profile-actions { width: 100%; display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
          .profile-actions button { flex: 1 1 auto; justify-content: center; padding: 10px 14px; min-width: 120px; }
          .profile-account-info { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); padding: 14px; }
          .profile-field { justify-content: flex-start; }
          .profile-edit-grid { grid-template-columns: 1fr; }
          .profile-edit-actions { justify-content: flex-start; }

          .preferences-grid { grid-template-columns: 1fr; }

          .container { padding: 0 16px; }
          .page-body { padding: 20px 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .stats-card { padding: 14px; }
          .stats-card-value { font-size: 22px; }
          .stats-card-icon { width: 38px; height: 38px; font-size: 18px; }

          .depot-card { padding: 16px; border-radius: 14px; }
          .depot-header { flex-direction: column; align-items: stretch; gap: 10px; }
          .depot-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            width: 100%;
            margin-top: 4px;
          }
          .depot-actions a, .depot-actions button {
            justify-content: center;
            width: 100%;
          }

          .item-card { padding: 14px 16px; flex-direction: column; align-items: stretch; gap: 10px; }
          .item-card button { width: 100%; justify-content: center; }

          .tab-btn { padding: 8px 16px; font-size: 13px; }

          .modal-header { padding: 20px 20px 14px; }
          .modal-body { padding: 20px; }
          .modal-footer { padding: 14px 20px 20px; }
          .modal-content { max-width: 100%; border-radius: 16px; }
        }

        @media (max-width: 480px) {
          .profile-name { font-size: 20px; }
          .profile-actions { flex-direction: column; }
          .profile-actions button { width: 100%; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .favorites-grid { grid-template-columns: 1fr; }
          .quitus-info { font-size: 12px; padding: 10px 12px; }
        }
      `}</style>
    </Layout>
  );
}
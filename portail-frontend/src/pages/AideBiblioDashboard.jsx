// pages/AideBiblioDashboard.jsx - VERSION PROFESSIONNELLE + PROFIL DANS UN MODAL
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookPlus, BookMarked, Edit, Search, Users,
  BarChart3, BookOpen, Clock, ArrowRight,
  Library, User, LogOut, Settings, Bell,
  RefreshCw, AlertCircle, TrendingUp, Award,
  FileText, Layers, Database, CheckCircle,
  ExternalLink, ChevronRight, Sparkles, Activity,
  Calendar, FolderOpen, Hash, Tag, Archive,
  Mail, Shield, Lock, Eye, EyeOff, Save, X,
  UserCircle, AtSign, BadgeCheck, KeyRound
} from 'lucide-react';
import { createPortal } from 'react-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getAideBiblioDashboard,
  redirectToPMB,
  getAideBiblioStats,
  updateProfile,
  changePassword,
} from '../services/endpoints';

const PMB_URL = 'http://10.4.2.112/pmb';

// ═══════════════════════════════════════════════════════════════════
// ─── PALETTE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',
  orDark: '#6D28D9',
  orLight: '#8B5CF6',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  green: '#10B981',
  blue: '#3b82f6',
  amber: '#F59E0B',
  red: '#ef4444',
  texteMuted: '#64748b',
  texteLight: '#94a3b8',
};

// ═══════════════════════════════════════════════════════════════════
// ─── CONFIGURATION DES ACTIONS ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_ACTIONS = [
  {
    id: 'new',
    title: 'Cataloguer un ouvrage',
    description: 'Ajouter un nouvel ouvrage dans le catalogue PMB',
    icon: BookPlus,
    color: COLORS.bleuNuit,
    bg: 'rgba(27,20,100,0.08)',
    action: 'new',
  },
  {
    id: 'search',
    title: 'Rechercher un ouvrage',
    description: 'Consulter et rechercher dans le catalogue PMB',
    icon: Search,
    color: COLORS.or,
    bg: 'rgba(124,58,237,0.08)',
    action: 'search',
  },
  {
    id: 'edit',
    title: 'Modifier un ouvrage',
    description: 'Mettre à jour les informations d\'un ouvrage existant',
    icon: Edit,
    color: COLORS.blue,
    bg: 'rgba(59,130,246,0.08)',
    action: 'edit',
  },
  {
    id: 'loans',
    title: 'Gérer les prêts',
    description: 'Enregistrer un prêt ou un retour d\'ouvrage',
    icon: BookMarked,
    color: COLORS.green,
    bg: 'rgba(16,185,129,0.08)',
    action: 'loans',
  },
  {
    id: 'users',
    title: 'Gérer les lecteurs',
    description: 'Consulter et modifier les comptes lecteurs',
    icon: Users,
    color: COLORS.amber,
    bg: 'rgba(245,158,11,0.08)',
    action: 'users',
  },
  {
    id: 'stats',
    title: 'Statistiques',
    description: 'Consulter les statistiques d\'utilisation du catalogue',
    icon: BarChart3,
    color: COLORS.orDark,
    bg: 'rgba(109,40,217,0.08)',
    action: 'stats',
  },
];

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANTS ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function StatCard({ label, value, icon: Icon, color, bg, subtitle, loading }) {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 22, width: '55%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '75%' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(27,20,100,0.08)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: color,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.texteMuted,
            marginTop: 3,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: 10, color: COLORS.texteLight, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ action, onClick, loading }) {
  const Icon = action.icon;
  return (
    <button
      onClick={() => onClick(action.action)}
      disabled={loading}
      style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid var(--border)',
        padding: '22px 22px',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: loading ? 'wait' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'inherit',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (loading) return;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(27,20,100,0.10)';
        e.currentTarget.style.borderColor = action.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${action.color}, ${action.color}80)`,
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
        className="action-top-bar"
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: action.bg,
          color: action.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          transition: 'all 0.3s',
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontSize: 15.5,
          fontWeight: 700,
          color: COLORS.bleuNuit,
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {action.title}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: COLORS.texteMuted,
          lineHeight: 1.55,
          marginBottom: 16,
          flex: 1,
        }}
      >
        {action.description}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: '1px solid var(--border-light, rgba(0,0,0,0.05))',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: action.color,
            fontWeight: 600,
          }}
        >
          Ouvrir dans PMB
        </span>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: action.bg,
            color: action.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s',
          }}
        >
          <ArrowRight size={14} />
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MODAL "MON COMPTE" (PROFIL + MOT DE PASSE) ──────────────────
// ═══════════════════════════════════════════════════════════════════

function MonCompteModal({ isOpen, onClose, user, onUpdate }) {
  const { addToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [pwdData, setPwdData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwdErrors, setPwdErrors] = useState({});

  // Réinitialiser à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setEditing(false);
      setShowPasswordForm(false);
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
      });
      setPwdData({ old_password: '', new_password: '', confirm_password: '' });
      setPwdErrors({});
    }
  }, [isOpen, user]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSaveProfile = async () => {
    if (!formData.first_name.trim() && !formData.last_name.trim()) {
      addToast('Veuillez renseigner au moins un champ', 'warning');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      });

      addToast('✅ Profil mis à jour avec succès !', 'success');
      setEditing(false);
      onUpdate?.();
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      const msg = err?.response?.data?.detail
        || err?.response?.data?.message
        || Object.values(err?.response?.data || {})[0]
        || 'Erreur lors de la mise à jour';
      addToast(typeof msg === 'string' ? msg : 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
    setEditing(false);
  };

  const validatePwd = () => {
    const err = {};
    if (!pwdData.old_password) err.old_password = 'Mot de passe actuel requis';
    if (!pwdData.new_password) err.new_password = 'Nouveau mot de passe requis';
    else if (pwdData.new_password.length < 8) err.new_password = 'Minimum 8 caractères';
    if (pwdData.new_password !== pwdData.confirm_password)
      err.confirm_password = 'Les mots de passe ne correspondent pas';
    return err;
  };

  const handleChangePassword = async () => {
    const err = validatePwd();
    setPwdErrors(err);
    if (Object.keys(err).length > 0) return;

    setChangingPwd(true);
    try {
      await changePassword({
        old_password: pwdData.old_password,
        new_password: pwdData.new_password,
        confirm_password: pwdData.confirm_password,
      });

      addToast('✅ Mot de passe changé avec succès !', 'success');
      setPwdData({ old_password: '', new_password: '', confirm_password: '' });
      setPwdErrors({});
      setShowPasswordForm(false);
    } catch (err2) {
      console.error('Erreur changement mot de passe:', err2);
      const data = err2?.response?.data;
      let msg = 'Erreur lors du changement de mot de passe';
      if (typeof data === 'string') msg = data;
      else if (data?.detail) msg = data.detail;
      else if (data?.old_password) msg = Array.isArray(data.old_password) ? data.old_password[0] : data.old_password;
      else if (data?.new_password) msg = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
      else if (data?.error) msg = data.error;
      addToast(msg, 'error');
    } finally {
      setChangingPwd(false);
    }
  };

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase()
    || user?.username?.[0]?.toUpperCase()
    || '?';

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mon-compte-title"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,10,42,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483600,
        padding: 'clamp(12px, 3vw, 24px)',
        animation: 'monCompteFadeIn 0.25s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          animation: 'monCompteScaleIn 0.3s ease',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bande décorative */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 60%, ${COLORS.or} 140%)`,
            padding: '24px 28px',
            color: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <UserCircle size={26} />
            </div>
            <div>
              <h2
                id="mon-compte-title"
                style={{
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Mon compte
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.75)',
                  marginTop: 2,
                  margin: 0,
                }}
              >
                Gérez vos informations personnelles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.28)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = '';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: '28px' }}>

          {/* ═══ CARTE IDENTITÉ ═══ */}
          <div
            style={{
              background: COLORS.beige,
              borderRadius: 16,
              padding: '20px 22px',
              marginBottom: 20,
              border: `1px solid ${COLORS.beigeDark}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS.bleuNuit}, ${COLORS.or})`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: `0 8px 24px ${COLORS.bleuNuit}30`,
                  border: '3px solid white',
                }}
              >
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: COLORS.bleuNuit,
                      margin: 0,
                    }}
                  >
                    {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 50,
                      background: 'rgba(16,185,129,0.12)',
                      color: COLORS.green,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    <BadgeCheck size={11} />
                    AIDE-BIBLIOTHÉCAIRE
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px 20px',
                    fontSize: 13,
                    color: COLORS.texteMuted,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AtSign size={13} /> {user?.username || '—'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} /> {user?.email || '—'}
                  </span>
                  {user?.matricule && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Hash size={13} /> {user.matricule}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ BOUTONS D'ACTION ═══ */}
          {!editing && !showPasswordForm && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 20px',
                  borderRadius: 10,
                  background: COLORS.bleuNuit,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 16px ${COLORS.bleuNuit}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.bleuNuit}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.bleuNuit}30`;
                }}
              >
                <Edit size={15} /> Modifier mes informations
              </button>

              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 20px',
                  borderRadius: 10,
                  background: 'white',
                  color: COLORS.or,
                  border: `1px solid ${COLORS.or}40`,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = '';
                }}
              >
                <KeyRound size={15} /> Changer mon mot de passe
              </button>
            </div>
          )}

          {/* ═══ FORMULAIRE INFO ═══ */}
          {editing && (
            <div
              style={{
                background: COLORS.beige,
                borderRadius: 14,
                padding: '20px 22px',
                marginBottom: 8,
                border: `1px solid ${COLORS.beigeDark}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  color: COLORS.bleuNuit,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Edit size={15} /> Modifier mes informations
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: COLORS.bleuNuit, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                    placeholder="Votre prénom"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid white',
                      background: 'white',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: COLORS.bleuNuit,
                      outline: 'none',
                      transition: 'border 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.or; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'white'; }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: COLORS.bleuNuit, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                    placeholder="Votre nom"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid white',
                      background: 'white',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: COLORS.bleuNuit,
                      outline: 'none',
                      transition: 'border 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.or; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'white'; }}
                  />
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: COLORS.texteMuted, marginBottom: 14, fontStyle: 'italic' }}>
                ℹ️ Le nom d'utilisateur, l'email et le matricule ne peuvent pas être modifiés ici.
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: COLORS.bleuNuit,
                    color: 'white',
                    border: 'none',
                    cursor: saving ? 'wait' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    opacity: saving ? 0.7 : 1,
                    boxShadow: `0 4px 16px ${COLORS.bleuNuit}30`,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.bleuNuit}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.bleuNuit}30`;
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Enregistrer
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'white',
                    color: COLORS.texteMuted,
                    border: '1px solid var(--border)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) e.currentTarget.style.background = '#f8f8f8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          {/* ═══ FORMULAIRE MOT DE PASSE ═══ */}
          {showPasswordForm && (
            <div
              style={{
                background: 'rgba(124,58,237,0.04)',
                borderRadius: 14,
                padding: '20px 22px',
                marginTop: 8,
                border: '1px solid rgba(124,58,237,0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                  color: COLORS.or,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Lock size={15} /> Changement de mot de passe
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                {[
                  { key: 'old_password', label: 'Mot de passe actuel', show: showPwd.old, field: 'old' },
                  { key: 'new_password', label: 'Nouveau mot de passe', show: showPwd.new, field: 'new' },
                  { key: 'confirm_password', label: 'Confirmer le mot de passe', show: showPwd.confirm, field: 'confirm' },
                ].map(({ key, label, show, field }) => (
                  <div key={key}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: COLORS.bleuNuit,
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwdData[key]}
                        onChange={(e) => {
                          setPwdData((p) => ({ ...p, [key]: e.target.value }));
                          setPwdErrors((p) => ({ ...p, [key]: '' }));
                        }}
                        placeholder="••••••••"
                        disabled={changingPwd}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 14px',
                          borderRadius: 10,
                          border: `1.5px solid ${pwdErrors[key] ? COLORS.red : 'white'}`,
                          background: 'white',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          color: COLORS.bleuNuit,
                          outline: 'none',
                          transition: 'border 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = pwdErrors[key] ? COLORS.red : COLORS.or;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = pwdErrors[key] ? COLORS.red : 'white';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
                        tabIndex={-1}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: COLORS.texteMuted,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {pwdErrors[key] && (
                      <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>
                        {pwdErrors[key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: COLORS.texteMuted,
                  marginBottom: 14,
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: 8,
                  borderLeft: `3px solid ${COLORS.amber}`,
                }}
              >
                💡 Le mot de passe doit contenir <strong>au moins 8 caractères</strong>.
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPwd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: COLORS.or,
                    color: 'white',
                    border: 'none',
                    cursor: changingPwd ? 'wait' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    opacity: changingPwd ? 0.7 : 1,
                    boxShadow: `0 4px 16px ${COLORS.or}40`,
                  }}
                  onMouseEnter={(e) => {
                    if (!changingPwd) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.or}50`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.or}40`;
                  }}
                >
                  {changingPwd ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Modification...
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} /> Changer le mot de passe
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPwdData({ old_password: '', new_password: '', confirm_password: '' });
                    setPwdErrors({});
                  }}
                  disabled={changingPwd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'white',
                    color: COLORS.texteMuted,
                    border: '1px solid var(--border)',
                    cursor: changingPwd ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!changingPwd) e.currentTarget.style.background = '#f8f8f8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ═══════════════════════════════════════════════════════════════════
// ─── PAGE PRINCIPALE ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AideBiblioDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);
  const [actionLoading, setActionLoading] = useState(null);
  const [showMonCompte, setShowMonCompte] = useState(false);

  // ─── CHARGEMENT DES DONNÉES ────────────────────────────────────
  const loadDashboard = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashboardRes, statsRes] = await Promise.allSettled([
        getAideBiblioDashboard(),
        getAideBiblioStats(),
      ]);

      if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.data?.success) {
        const data = dashboardRes.value.data;
        setDashboardData(data);

        const sections = data?.dashboard?.sections;
        if (Array.isArray(sections) && sections.length > 0) {
          setActions(sections.map((s) => {
            const base = DEFAULT_ACTIONS.find((a) => a.action === (s.action || s.id));
            return {
              id: s.id || s.action,
              title: s.title || base?.title || 'Action',
              description: s.description || base?.description || '',
              icon: base?.icon || BookPlus,
              color: base?.color || COLORS.bleuNuit,
              bg: base?.bg || 'rgba(27,20,100,0.08)',
              action: s.action || s.id,
            };
          }));
        } else {
          setActions(DEFAULT_ACTIONS);
        }
      } else {
        setActions(DEFAULT_ACTIONS);
        if (dashboardRes.status === 'rejected') {
          console.warn('Dashboard aide-biblio indisponible:', dashboardRes.reason);
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
        setStats(statsRes.value.data.stats || {});
      } else {
        setStats(null);
        if (statsRes.status === 'rejected') {
          console.warn('Stats aide-biblio indisponibles:', statsRes.reason);
        }
      }

      if (showToast) addToast('Données actualisées', 'success');
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
      if (showToast) addToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user, loadDashboard]);

  // ─── CALLBACK APRÈS MISE À JOUR DU PROFIL ──────────────────────
  const handleProfileUpdated = useCallback(async () => {
    if (typeof refreshUser === 'function') {
      try { await refreshUser(); } catch (e) { console.warn('Impossible de recharger le profil:', e); }
    }
  }, [refreshUser]);

  // ─── REDIRECTION VERS PMB ──────────────────────────────────────
  const handleAction = async (action) => {
    if (actionLoading) return;
    setActionLoading(action);

    try {
      const response = await redirectToPMB(action);

      if (response?.data?.success && response.data.redirect_url) {
        window.open(response.data.redirect_url, '_blank', 'noopener,noreferrer');
        addToast(`Redirection vers PMB — ${action}`, 'success');
      } else {
        const fallbackUrl = `${PMB_URL}/catalog.php`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        addToast('Ouverture du catalogue PMB', 'info');
      }
    } catch (err) {
      console.error('Erreur redirection PMB:', err);
      window.open(PMB_URL, '_blank', 'noopener,noreferrer');
      addToast('Ouverture de PMB dans un nouvel onglet', 'info');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Déconnexion réussie', 'success');
    navigate('/');
  };

  // ─── RENDER : CHARGEMENT ───────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div style={{
          padding: '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 20,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: `4px solid ${COLORS.beigeDark}`,
            borderTopColor: COLORS.or,
            animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: COLORS.texteMuted, fontSize: 14 }}>
            Chargement de votre espace...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  // ─── RENDER : ERREUR ───────────────────────────────────────────
  if (error && !dashboardData && !stats) {
    return (
      <Layout>
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 auto',
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)',
            color: COLORS.red,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertCircle size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.bleuNuit, marginBottom: 8 }}>
            Impossible de charger votre espace
          </h2>
          <p style={{ color: COLORS.texteMuted, fontSize: 14, marginBottom: 24 }}>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadDashboard()}
              className="btn btn-bleu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                background: COLORS.bleuNuit,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              <RefreshCw size={16} /> Réessayer
            </button>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                background: 'transparent',
                color: COLORS.bleuNuit,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── RENDER : DASHBOARD ────────────────────────────────────────
  return (
    <Layout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes monCompteFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes monCompteScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .skeleton {
          background: linear-gradient(90deg, ${COLORS.beige} 25%, ${COLORS.beigeDark} 50%, ${COLORS.beige} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
        .spin { animation: spin 1s linear infinite; }
        .action-card-wrapper:hover .action-top-bar {
          opacity: 1 !important;
        }
      `}</style>

      {/* ═══ HEADER PREMIUM ═══════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 60%, ${COLORS.or} 140%)`,
          padding: '36px 0 44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container"
          style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 50,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  marginBottom: 14,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Sparkles size={12} />
                ESPACE AIDE-BIBLIOTHÉCAIRE
              </div>

              <h1
                style={{
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  color: 'white',
                  fontWeight: 400,
                  marginBottom: 8,
                  fontFamily: 'var(--font-serif, serif)',
                  lineHeight: 1.15,
                }}
              >
                Bonjour,{' '}
                <span style={{ color: COLORS.orLight }}>
                  {user?.first_name || user?.username}
                </span>{' '}
                👋
              </h1>

              <p
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 'clamp(13px, 1vw, 15px)',
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                {dashboardData?.message ||
                  'Gérez le catalogue PMB et accompagnez les usagers depuis votre espace dédié.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* ✅ Bouton "Mon compte" */}
              <button
                onClick={() => setShowMonCompte(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.18)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.28)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.transform = '';
                }}
                aria-label="Ouvrir mon compte"
              >
                <UserCircle size={16} />
                Mon compte
              </button>

              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: refreshing ? 'wait' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  opacity: refreshing ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                }}
              >
                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.15)',
                  color: 'white',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              label="Total ouvrages catalogués"
              value={stats?.total_ouvrages ?? 0}
              icon={Library}
              color={COLORS.bleuNuit}
              bg={`${COLORS.bleuNuit}10`}
              loading={!stats}
            />
            <StatCard
              label="Ajoutés ce mois"
              value={stats?.ouvrages_ajoutes_mois ?? 0}
              icon={BookPlus}
              color={COLORS.green}
              bg={`${COLORS.green}12`}
              loading={!stats}
            />
            <StatCard
              label="Modifiés ce mois"
              value={stats?.ouvrages_modifies_mois ?? 0}
              icon={Edit}
              color={COLORS.or}
              bg={`${COLORS.or}12`}
              loading={!stats}
            />
            <StatCard
              label="Dernière activité"
              value={
                stats?.derniere_action
                  ? new Date(stats.derniere_action).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '—'
              }
              icon={Activity}
              color={COLORS.blue}
              bg={`${COLORS.blue}12`}
              loading={!stats}
            />
          </div>
        </div>
      </div>

      {/* ═══ CONTENU ════════════════════════════════════════════ */}
      <div className="container" style={{ padding: '32px 24px' }}>

        {/* ═══ ACTIONS DISPONIBLES ═══ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.bleuNuit,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <Library size={22} color={COLORS.or} />
              Actions disponibles
            </h2>
            <p style={{ fontSize: 13, color: COLORS.texteMuted }}>
              Toutes les actions s'ouvrent dans l'interface PMB
            </p>
          </div>
        </div>

        {actions.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              background: 'white',
              borderRadius: 16,
              border: '1px solid var(--border)',
            }}
          >
            <FolderOpen size={48} color={COLORS.texteLight} style={{ marginBottom: 12 }} />
            <p style={{ color: COLORS.texteMuted, fontSize: 14 }}>
              Aucune action disponible pour le moment.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {actions.map((action) => (
              <div key={action.id} className="action-card-wrapper">
                <ActionCard
                  action={action}
                  onClick={handleAction}
                  loading={actionLoading === action.action}
                />
              </div>
            ))}
          </div>
        )}

        {/* ═══ ACCÈS DIRECT AU CATALOGUE PMB ═══ */}
        <div
          style={{
            marginTop: 32,
            padding: '22px 26px',
            background: `linear-gradient(135deg, ${COLORS.beige} 0%, ${COLORS.beigeDark} 100%)`,
            borderRadius: 16,
            border: `1px solid ${COLORS.beigeDark}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: COLORS.bleuNuit,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 20px rgba(27,20,100,0.25)',
              }}
            >
              <Database size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: COLORS.bleuNuit,
                  fontSize: 15,
                  marginBottom: 2,
                }}
              >
                Accès direct au catalogue PMB
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.texteMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Interface complète pour la gestion des ouvrages, prêts et lecteurs
              </div>
            </div>
          </div>
          <a
            href={PMB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 10,
              background: COLORS.bleuNuit,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(27,20,100,0.25)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,20,100,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,20,100,0.25)';
            }}
          >
            <ExternalLink size={14} />
            Ouvrir PMB
          </a>
        </div>
      </div>

      {/* ═══ MODAL "MON COMPTE" ═══ */}
      <MonCompteModal
        isOpen={showMonCompte}
        onClose={() => setShowMonCompte(false)}
        user={user}
        onUpdate={handleProfileUpdated}
      />
    </Layout>
  );
}
// components/common/EditableProfile.jsx
import { useState, useEffect } from 'react';
import {
  User, Edit, Save, X, Lock, KeyRound,
  Mail, AtSign, Hash, BadgeCheck, Eye, EyeOff,
  RefreshCw, Shield, UserCircle
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { updateProfile, changePassword } from '../../services/endpoints';

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

// ─── Mapping rôle → label/couleur ────────────────────────────────
const ROLE_INFO = {
  ADMIN: { label: 'ADMINISTRATEUR', color: '#7C3AED', icon: Shield },
  BIBLIO: { label: 'BIBLIOTHÉCAIRE', color: '#3b82f6', icon: UserCircle },
  AIDE_BIBLIO: { label: 'AIDE-BIBLIOTHÉCAIRE', color: '#10B981', icon: BadgeCheck },
  ETUDIANT: { label: 'ÉTUDIANT', color: '#F59E0B', icon: User },
};

export default function EditableProfile({
  user,
  onUpdate,
  accentColor = COLORS.bleuNuit,
  title = 'Mon profil',
  showMatricule = true,
  showRoleBadge = true,
}) {
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

  // Sync avec les props
  useEffect(() => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
  }, [user]);

  // ─── Sauvegarder les infos ─────────────────────────────────────
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

  // ─── Changer le mot de passe ───────────────────────────────────
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

  const roleInfo = ROLE_INFO[user?.role] || ROLE_INFO.ETUDIANT;
  const RoleIcon = roleInfo.icon;
  const roleColor = roleInfo.color || accentColor;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: '28px 32px',
        marginBottom: 32,
        boxShadow: '0 4px 20px rgba(27,20,100,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bande décorative */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${accentColor}, ${COLORS.or}, ${COLORS.orLight})`,
        }}
      />

      {/* Header profil */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentColor}, ${COLORS.or})`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: `0 8px 24px ${accentColor}30`,
            border: '3px solid white',
          }}
        >
          {initials}
        </div>

        {/* Infos principales */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.bleuNuit,
                margin: 0,
              }}
            >
              {editing ? (
                <span style={{ color: COLORS.texteMuted, fontSize: 14, fontWeight: 500 }}>
                  Modification en cours...
                </span>
              ) : (
                `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username
              )}
            </h3>
            {showRoleBadge && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 50,
                  background: `${roleColor}15`,
                  color: roleColor,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <RoleIcon size={11} />
                {roleInfo.label}
              </span>
            )}
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
            {showMatricule && user?.matricule && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Hash size={13} /> {user.matricule}
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        {!editing && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 10,
                background: COLORS.beige,
                color: COLORS.bleuNuit,
                border: `1px solid ${COLORS.beigeDark}`,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.beigeDark;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.beige;
                e.currentTarget.style.transform = '';
              }}
            >
              <Edit size={14} /> Modifier
            </button>

            <button
              onClick={() => setShowPasswordForm((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 10,
                background: showPasswordForm ? 'rgba(124,58,237,0.10)' : 'white',
                color: COLORS.or,
                border: `1px solid ${COLORS.or}40`,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.10)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showPasswordForm ? 'rgba(124,58,237,0.10)' : 'white';
                e.currentTarget.style.transform = '';
              }}
            >
              <KeyRound size={14} /> {showPasswordForm ? 'Annuler' : 'Mot de passe'}
            </button>
          </div>
        )}
      </div>

      {/* ═══ FORMULAIRE INFO ÉDITABLE ═══ */}
      {editing && (
        <div
          style={{
            background: COLORS.beige,
            borderRadius: 14,
            padding: '20px 22px',
            marginBottom: 16,
            border: `1px solid ${COLORS.beigeDark}`,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.bleuNuit,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
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
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.bleuNuit,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
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

          <div
            style={{
              fontSize: 11.5,
              color: COLORS.texteMuted,
              marginBottom: 14,
              fontStyle: 'italic',
            }}
          >
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
                if (!saving) {
                  e.currentTarget.style.background = '#f8f8f8';
                }
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
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
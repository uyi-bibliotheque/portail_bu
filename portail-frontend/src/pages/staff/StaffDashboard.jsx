// pages/staff/StaffDashboard.jsx - PROFIL DANS UN MODAL "MON COMPTE"
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, AlertCircle, Users,
  Bell, Download, Eye, ArrowLeft, RefreshCw, TrendingUp,
  BookOpen, UserCheck, FileCheck, Printer, ChevronRight,
  Package, Send, FileCheck2, Search, Filter, BarChart2,
  Upload, X, Check, AlertTriangle, Calendar, User,
  Building2, Mail, Phone, Award, Layers, Zap,
  Settings, HelpCircle, LogOut, Menu, Plus, Minus,
  ClipboardList, QrCode, Scan, FileSignature, CloudUpload,
  Archive, UserCircle, AtSign, BadgeCheck, KeyRound,
  EyeOff, Save, Lock, Hash, Edit
} from 'lucide-react';
import { createPortal } from 'react-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import {
  getMemoireStats,
  listMemoires,
  getUnreadCount,
  getNotifications,
  updateMemoireStatus,
  uploadScannedDocument,
  verifyMemoire,
  getMemoireDetail,
  updateProfile,
  changePassword,
} from '../../services/endpoints';

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
// ─── CONFIGURATION ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  depot_en_ligne: { label: 'Déposé en ligne', icon: '📤', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  convocation_envoyee: { label: 'Convocation envoyée', icon: '📧', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  en_attente_verification: { label: 'En vérification', icon: '🔍', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  verification_ok: { label: 'Vérifié', icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  en_attente_quitus: { label: 'Quitus en attente', icon: '⏳', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  quitus_disponible: { label: 'Quitus disponible', icon: '📄', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  quitus_retire: { label: 'Quitus retiré', icon: '📋', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  rejete: { label: 'Rejeté', icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

const WORKFLOW_STEPS = [
  { key: 'depot_en_ligne', label: 'Dépôt en ligne', icon: '📤', color: '#3b82f6' },
  { key: 'convocation_envoyee', label: 'Convocation', icon: '📧', color: '#F59E0B' },
  { key: 'en_attente_verification', label: 'En vérification', icon: '🔍', color: '#8b5cf6' },
  { key: 'verification_ok', label: 'Vérifié', icon: '✅', color: '#10B981' },
  { key: 'en_attente_quitus', label: 'Quitus en attente', icon: '⏳', color: '#10B981' },
  { key: 'quitus_disponible', label: 'Quitus prêt', icon: '📄', color: '#10B981' },
  { key: 'quitus_retire', label: 'Terminé', icon: '📋', color: '#10B981' },
];

// ═══════════════════════════════════════════════════════════════════
// ─── MODAL VÉRIFICATION ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function VerificationModal({ memoire, isOpen, onClose, onVerify, onUploadScanned, loading }) {
  const [documentsConform, setDocumentsConform] = useState(true);
  const [librarianNotes, setLibrarianNotes] = useState('');
  const [scannedFile, setScannedFile] = useState(null);
  const [scannedPreview, setScannedPreview] = useState(null);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScannedFile(file);
      const reader = new FileReader();
      reader.onload = () => setScannedPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    await onVerify(memoire.id, { documents_conform: documentsConform, librarian_notes: librarianNotes });
    setStep(2);
  };

  const handleUploadScanned = async () => {
    if (!scannedFile) { alert('Veuillez sélectionner un fichier scanné'); return; }
    await onUploadScanned(memoire.id, scannedFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>
            {step === 1 ? '🔍 Vérification physique' : '📎 Upload document scanné'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={24} color="#64748b" />
          </button>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: 'var(--beige)', borderRadius: 10 }}>
          <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{memoire?.title}</h4>
          <div style={{ fontSize: 13, color: 'var(--texte-muted)' }}>{memoire?.author_full_name} • Matricule: {memoire?.matricule}</div>
          <div style={{ fontSize: 13, color: 'var(--texte-muted)' }}>{memoire?.filiere} • {memoire?.type_display}</div>
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Les documents sont-ils conformes ?</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDocumentsConform(true)} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: `2px solid ${documentsConform ? '#10B981' : 'var(--border)'}`, background: documentsConform ? 'rgba(16,185,129,0.08)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <CheckCircle size={20} color={documentsConform ? '#10B981' : '#94a3b8'} />
                  <span style={{ fontWeight: documentsConform ? 600 : 400 }}>Conforme</span>
                </button>
                <button onClick={() => setDocumentsConform(false)} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: `2px solid ${!documentsConform ? '#ef4444' : 'var(--border)'}`, background: !documentsConform ? 'rgba(239,68,68,0.08)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <X size={20} color={!documentsConform ? '#ef4444' : '#94a3b8'} />
                  <span style={{ fontWeight: !documentsConform ? 600 : 400 }}>Non conforme</span>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Notes du bibliothécaire (optionnel)</label>
              <textarea value={librarianNotes} onChange={(e) => setLibrarianNotes(e.target.value)} placeholder="Ajoutez des notes sur la vérification..." style={{ width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', background: 'var(--beige)' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 20px' }}>Annuler</button>
              <button onClick={handleVerify} disabled={loading} className="btn btn-primary" style={{ padding: '10px 24px', background: '#8b5cf6', color: 'white' }}>
                {loading ? <RefreshCw size={16} className="spin" /> : 'Valider la vérification'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ padding: '20px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} /> Vérification validée avec succès !
              </p>
              <p style={{ fontSize: 13, color: 'var(--texte-muted)', marginTop: 4 }}>Téléchargez maintenant le document scanné signé par l'étudiant.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Document scanné signé</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--beige)', transition: 'all 0.2s' }} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#8b5cf6'; }} onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { setScannedFile(file); const reader = new FileReader(); reader.onload = () => setScannedPreview(reader.result); reader.readAsDataURL(file); } }}>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} style={{ display: 'none' }} />
                {scannedPreview ? (
                  <div>
                    <img src={scannedPreview} alt="Aperçu" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, marginBottom: 12 }} />
                    <div style={{ fontSize: 13, color: '#10B981' }}>✅ {scannedFile?.name} ({Math.round(scannedFile?.size / 1024)} KB)</div>
                    <button onClick={(e) => { e.stopPropagation(); setScannedFile(null); setScannedPreview(null); }} style={{ marginTop: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={16} /> Supprimer
                    </button>
                  </div>
                ) : (
                  <>
                    <CloudUpload size={40} color="#94a3b8" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 14, color: 'var(--texte-muted)' }}>Glissez-déposez le fichier scanné ici ou cliquez pour sélectionner</p>
                    <p style={{ fontSize: 12, color: 'var(--texte-light)' }}>Format accepté: PDF, JPG, PNG • Max 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 20px' }}>Terminer</button>
              {scannedFile && (
                <button onClick={handleUploadScanned} disabled={loading} className="btn btn-primary" style={{ padding: '10px 24px', background: '#10B981', color: 'white' }}>
                  {loading ? <RefreshCw size={16} className="spin" /> : '📎 Upload le document'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MODAL UPLOAD DOCUMENTS ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function DocumentUploadModal({ isOpen, onClose, memoires, onUploadComplete, loading }) {
  const [selectedMemoire, setSelectedMemoire] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const pdfInputRef = useRef(null);
  const wordInputRef = useRef(null);

  const handleUpload = async () => {
    if (!selectedMemoire || (!pdfFile && !wordFile)) { alert('Veuillez sélectionner un mémoire et au moins un fichier'); return; }
    const formData = new FormData();
    if (pdfFile) formData.append('pdf_file', pdfFile);
    if (wordFile) formData.append('word_file', wordFile);
    await onUploadComplete(selectedMemoire, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>📎 Upload des documents</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={24} color="#64748b" />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Sélectionner le mémoire</label>
          <select value={selectedMemoire} onChange={(e) => setSelectedMemoire(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}>
            <option value="">Choisir un mémoire...</option>
            {memoires.filter(m => m.status === 'verification_ok' || m.status === 'en_attente_quitus').map(m => (
              <option key={m.id} value={m.id}>{m.title} - {m.author_full_name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Fichier PDF</label>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: pdfFile ? 'rgba(16,185,129,0.05)' : 'var(--beige)' }} onClick={() => pdfInputRef.current?.click()}>
            <input ref={pdfInputRef} type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} style={{ display: 'none' }} />
            {pdfFile ? <div style={{ color: '#10B981' }}>✅ {pdfFile.name}</div> : <div style={{ color: 'var(--texte-muted)' }}>📄 Cliquez pour sélectionner un PDF</div>}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Fichier Word</label>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: wordFile ? 'rgba(16,185,129,0.05)' : 'var(--beige)' }} onClick={() => wordInputRef.current?.click()}>
            <input ref={wordInputRef} type="file" accept=".doc,.docx" onChange={(e) => setWordFile(e.target.files[0])} style={{ display: 'none' }} />
            {wordFile ? <div style={{ color: '#10B981' }}>✅ {wordFile.name}</div> : <div style={{ color: 'var(--texte-muted)' }}>📄 Cliquez pour sélectionner un Word</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 20px' }}>Annuler</button>
          <button onClick={handleUpload} disabled={loading || !selectedMemoire || (!pdfFile && !wordFile)} className="btn btn-primary" style={{ padding: '10px 24px', background: '#3b82f6', color: 'white' }}>
            {loading ? <RefreshCw size={16} className="spin" /> : '📤 Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MODAL "MON COMPTE" ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function MonCompteModal({ isOpen, onClose, user, onUpdate, accentColor = '#3b82f6' }) {
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

  const [pwdData, setPwdData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwdErrors, setPwdErrors] = useState({});

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

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isOpen]);

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
      const msg = err?.response?.data?.detail || err?.response?.data?.message || Object.values(err?.response?.data || {})[0] || 'Erreur lors de la mise à jour';
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
    if (pwdData.new_password !== pwdData.confirm_password) err.confirm_password = 'Les mots de passe ne correspondent pas';
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

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

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
        {/* Header du modal */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 60%, ${accentColor} 140%)`,
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
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <UserCircle size={26} />
            </div>
            <div>
              <h2 id="mon-compte-title" style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                Mon compte
              </h2>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2, margin: 0 }}>
                Gérez vos informations personnelles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = ''; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: '28px' }}>

          {/* Carte identité */}
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
                  width: 72, height: 72, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS.bleuNuit}, ${accentColor})`,
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, flexShrink: 0,
                  boxShadow: `0 8px 24px ${COLORS.bleuNuit}30`,
                  border: '3px solid white',
                }}
              >
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: COLORS.bleuNuit, margin: 0 }}>
                    {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                  </h3>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 50,
                    background: 'rgba(59,130,246,0.12)',
                    color: '#3b82f6',
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                  }}>
                    <BadgeCheck size={11} />
                    BIBLIOTHÉCAIRE
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 13, color: COLORS.texteMuted }}>
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

          {/* Boutons d'action */}
          {!editing && !showPasswordForm && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10,
                  background: COLORS.bleuNuit, color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 16px ${COLORS.bleuNuit}30`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.bleuNuit}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.bleuNuit}30`; }}
              >
                <Edit size={15} /> Modifier mes informations
              </button>

              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10,
                  background: 'white', color: COLORS.or,
                  border: `1px solid ${COLORS.or}40`,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = ''; }}
              >
                <KeyRound size={15} /> Changer mon mot de passe
              </button>
            </div>
          )}

          {/* Formulaire infos */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: COLORS.bleuNuit, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Edit size={15} /> Modifier mes informations
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid white', background: 'white', fontSize: 14, fontFamily: 'inherit', color: COLORS.bleuNuit, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid white', background: 'white', fontSize: 14, fontFamily: 'inherit', color: COLORS.bleuNuit, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
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
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 10,
                    background: COLORS.bleuNuit, color: 'white',
                    border: 'none', cursor: saving ? 'wait' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
                    boxShadow: `0 4px 16px ${COLORS.bleuNuit}30`,
                  }}
                >
                  {saving ? <><RefreshCw size={14} className="spin" /> Enregistrement...</> : <><Save size={14} /> Enregistrer</>}
                </button>

                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 10,
                    background: 'white', color: COLORS.texteMuted,
                    border: '1px solid var(--border)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          {/* Formulaire mot de passe */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: COLORS.or, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Lock size={15} /> Changement de mot de passe
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { key: 'old_password', label: 'Mot de passe actuel', show: showPwd.old, field: 'old' },
                  { key: 'new_password', label: 'Nouveau mot de passe', show: showPwd.new, field: 'new' },
                  { key: 'confirm_password', label: 'Confirmer le mot de passe', show: showPwd.confirm, field: 'confirm' },
                ].map(({ key, label, show, field }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.bleuNuit, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwdData[key]}
                        onChange={(e) => { setPwdData((p) => ({ ...p, [key]: e.target.value })); setPwdErrors((p) => ({ ...p, [key]: '' })); }}
                        placeholder="••••••••"
                        disabled={changingPwd}
                        style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 10, border: `1.5px solid ${pwdErrors[key] ? COLORS.red : 'white'}`, background: 'white', fontSize: 14, fontFamily: 'inherit', color: COLORS.bleuNuit, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
                        tabIndex={-1}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: COLORS.texteMuted, display: 'flex', alignItems: 'center' }}
                      >
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {pwdErrors[key] && (
                      <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{pwdErrors[key]}</div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11.5, color: COLORS.texteMuted, marginBottom: 14, padding: '8px 12px', background: 'white', borderRadius: 8, borderLeft: `3px solid ${COLORS.amber}` }}>
                💡 Le mot de passe doit contenir <strong>au moins 8 caractères</strong>.
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPwd}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 10,
                    background: COLORS.or, color: 'white',
                    border: 'none', cursor: changingPwd ? 'wait' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.2s', opacity: changingPwd ? 0.7 : 1,
                    boxShadow: `0 4px 16px ${COLORS.or}40`,
                  }}
                >
                  {changingPwd ? <><RefreshCw size={14} className="spin" /> Modification...</> : <><KeyRound size={14} /> Changer le mot de passe</>}
                </button>

                <button
                  onClick={() => { setShowPasswordForm(false); setPwdData({ old_password: '', new_password: '', confirm_password: '' }); setPwdErrors({}); }}
                  disabled={changingPwd}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 10,
                    background: 'white', color: COLORS.texteMuted,
                    border: '1px solid var(--border)',
                    cursor: changingPwd ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    transition: 'all 0.2s',
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

export default function StaffDashboard() {
  const { user, isStaff, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [memoires, setMemoires] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, memoire: null });
  const [uploadModal, setUploadModal] = useState({ isOpen: false });
  const [actionLoading, setActionLoading] = useState(false);
  const [showMonCompte, setShowMonCompte] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, allRes, unreadRes] = await Promise.all([
        getMemoireStats().catch(() => ({ data: {} })),
        listMemoires({ limit: 100 }).catch(() => ({ data: { results: [] } })),
        getUnreadCount().catch(() => ({ data: { count: 0 } }))
      ]);
      setStats(statsRes.data || {});
      const allData = allRes.data?.results || allRes.data || [];
      setMemoires(allData);
      setUnreadCount(unreadRes.data?.count || 0);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) loadData();
  }, [isStaff]);

  const handleProfileUpdated = useCallback(async () => {
    if (typeof refreshUser === 'function') {
      try { await refreshUser(); } catch (e) { console.warn('Impossible de recharger le profil:', e); }
    }
  }, [refreshUser]);

  const handleArchive = async (id) => {
    setActionLoading(true);
    try {
      const response = await api.post(`/memoires/${id}/test-archive/`);
      if (response.data.success) { addToast(`✅ ${response.data.message}`, 'success'); await loadData(); }
      else { addToast(`❌ ${response.data.error || 'Erreur lors de l\'archivage'}`, 'error'); }
    } catch (error) {
      console.error('Erreur archivage:', error);
      addToast('Erreur lors de l\'archivage', 'error');
    } finally { setActionLoading(false); }
  };

  const handleVerify = async (id, data) => {
    setActionLoading(true);
    try {
      await verifyMemoire(id, data);
      addToast('✅ Vérification validée avec succès !', 'success');
      await loadData();
    } catch (error) { addToast('Erreur lors de la vérification', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUploadScanned = async (id, file) => {
    setActionLoading(true);
    try {
      await uploadScannedDocument(id, file);
      addToast('📎 Document scanné uploadé avec succès !', 'success');
      await loadData();
      setVerificationModal({ isOpen: false, memoire: null });
    } catch (error) { addToast('Erreur lors de l\'upload du document scanné', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleStatusUpdate = async (id, payload) => {
    setActionLoading(true);
    try {
      await updateMemoireStatus(id, payload);
      addToast(`✅ Statut mis à jour avec succès`, 'success');
      await loadData();
    } catch (error) { addToast('Erreur lors de la mise à jour du statut', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUploadDocuments = async (id, formData) => {
    setActionLoading(true);
    try {
      await api.post(`/memoires/${id}/upload/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('📁 Documents uploadés avec succès !', 'success');
      await loadData();
    } catch (error) { addToast('Erreur lors de l\'upload des documents', 'error'); }
    finally { setActionLoading(false); }
  };

  if (!isStaff) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Accès réservé au personnel</h2>
          <Link to="/" className="btn btn-bleu" style={{ marginTop: 20 }}>Retour à l'accueil</Link>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: 'En attente de vérification', value: stats?.en_attente_verification || 0, icon: <Clock size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', link: '/staff/memoires?status=en_attente_verification' },
    { label: 'Convocation envoyée', value: stats?.convocation_envoyee || 0, icon: <Send size={20} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', link: '/staff/memoires?status=convocation_envoyee' },
    { label: 'Vérifiés (OK)', value: stats?.verification_ok || 0, icon: <CheckCircle size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)', link: '/staff/memoires?status=verification_ok' },
    { label: 'Quitus à signer', value: stats?.en_attente_quitus || 0, icon: <FileSignature size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', link: '/staff/memoires?status=en_attente_quitus' },
    { label: 'Quitus disponibles', value: stats?.quitus_disponible || 0, icon: <FileText size={20} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)', link: '/staff/memoires?status=quitus_disponible' },
    { label: 'Terminés', value: stats?.quitus_retire || 0, icon: <Award size={20} />, color: '#1B1464', bg: 'rgba(27,20,100,0.06)', link: '/staff/memoires?status=quitus_retire' },
  ];

  const filteredMemoires = memoires
    .filter(m => {
      if (filterStatus === 'pending') return ['en_attente_verification', 'convocation_envoyee', 'depot_en_ligne'].includes(m.status);
      if (filterStatus === 'verification') return ['en_attente_verification', 'convocation_envoyee'].includes(m.status);
      if (filterStatus === 'quitus') return ['en_attente_quitus', 'quitus_disponible'].includes(m.status);
      return true;
    })
    .filter(m =>
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.author_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.filiere?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Layout>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B1464 0%, #1a365d 50%, #2d4a7a 100%)', padding: '32px 0 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📚</div>
                <div>
                  <h1 className="font-serif" style={{ fontSize: 28, color: 'white', fontWeight: 400 }}>Espace Bibliothécaire</h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Gestion des dépôts de mémoires et thèses</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* ✅ Bouton Mon compte */}
              <button
                onClick={() => setShowMonCompte(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 50,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all 0.2s', backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = ''; }}
                aria-label="Mon compte"
              >
                <UserCircle size={16} />
                Mon compte
              </button>

              <Link to="/staff/notifications" style={{ position: 'relative', padding: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
              <button onClick={loadData} className="btn btn-outline-white btn-sm">
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {statCards.map((card, index) => (
            <Link key={index} to={card.link} style={{ background: 'white', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 12px 0 80px', background: card.bg, opacity: 0.5 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{loading ? '-' : card.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--texte-muted)', marginTop: 2 }}>{card.label}</div>
                </div>
                <div style={{ color: card.color, opacity: 0.6 }}>{card.icon}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions Rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setUploadModal({ isOpen: true })} style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Upload size={18} /> Upload documents
          </button>
          <Link to="/staff/memoires?status=en_attente_verification" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontWeight: 500, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Search size={18} /> Vérifier physiquement
          </Link>
          <Link to="/staff/memoires?status=en_attente_quitus" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontWeight: 500, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <FileSignature size={18} /> Signer quitus
          </Link>
          <Link to="/staff/memoires?status=quitus_disponible" style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontWeight: 500, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Printer size={18} /> Imprimer quitus
          </Link>
        </div>

        {/* Workflow */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 16px', background: 'var(--beige)', borderRadius: 10, marginBottom: 24, fontSize: 12, color: 'var(--texte-muted)', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>📋 Workflow :</span>
          {WORKFLOW_STEPS.map((step, index) => (
            <span key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: step.color }}>{step.icon}</span>
              <span style={{ fontWeight: index === WORKFLOW_STEPS.length - 1 ? 600 : 400 }}>{step.label}</span>
              {index < WORKFLOW_STEPS.length - 1 && <span style={{ color: 'var(--border)', marginLeft: 4 }}>→</span>}
            </span>
          ))}
          <span style={{ color: '#ef4444', marginLeft: 4 }}>| ❌ Rejeté</span>
        </div>

        {/* Filtres et recherche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: `📋 Tous (${memoires.length})` },
              { value: 'pending', label: `⏳ En attente (${memoires.filter(m => ['en_attente_verification', 'convocation_envoyee', 'depot_en_ligne'].includes(m.status)).length})` },
              { value: 'verification', label: `🔍 À vérifier (${memoires.filter(m => ['en_attente_verification', 'convocation_envoyee'].includes(m.status)).length})` },
              { value: 'quitus', label: `📄 Quitus (${memoires.filter(m => ['en_attente_quitus', 'quitus_disponible'].includes(m.status)).length})` },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterStatus(f.value)} style={{ padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: filterStatus === f.value ? 600 : 400, background: filterStatus === f.value ? 'var(--bleu-nuit)' : 'white', color: filterStatus === f.value ? 'white' : 'var(--texte)', border: `1px solid ${filterStatus === f.value ? 'var(--bleu-nuit)' : 'var(--border)'}`, cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--texte-light)' }} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un mémoire..." style={{ padding: '8px 12px 8px 36px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, width: 220, background: 'white' }} />
            </div>
            <Link to="/staff/memoires" className="btn btn-bleu btn-sm">
              <Eye size={14} /> Voir tout
            </Link>
          </div>
        </div>

        {/* Liste des mémoires */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMemoires.slice(0, 10).map(m => {
              const config = STATUS_CONFIG[m.status] || STATUS_CONFIG.depot_en_ligne;
              const stepIndex = WORKFLOW_STEPS.findIndex(s => s.key === m.status);
              return (
                <div key={m.id} style={{ background: 'white', borderRadius: 12, border: `1px solid ${config.border}`, padding: '16px 20px', transition: 'all 0.2s', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  {['en_attente_verification', 'convocation_envoyee', 'depot_en_ligne'].includes(m.status) && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: config.color, borderRadius: '12px 12px 0 0' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 12px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: config.bg, color: config.color }}>{config.icon} {config.label}</span>
                        {m.physical_deposit_confirmed && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>📦 Dépôt physique</span>}
                        {m.documents_conform && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>✅ Conforme</span>}
                        {m.is_quitus_signed && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>✅ Quitus signé</span>}
                        {m.is_archived && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 500, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>📁 Archivé</span>}
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.title}</h4>
                      <div style={{ fontSize: 13, color: 'var(--texte-muted)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <span><User size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {m.author_full_name || m.author_name}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <span><Building2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {m.filiere}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <span>Matricule: {m.matricule}</span>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {WORKFLOW_STEPS.map((step, idx) => {
                          const isActive = idx <= stepIndex;
                          return (
                            <span key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <span style={{ opacity: isActive ? 1 : 0.3, fontSize: 14 }}>{step.icon}</span>
                              {idx < WORKFLOW_STEPS.length - 1 && <span style={{ color: isActive && idx < stepIndex ? step.color : 'var(--border)', margin: '0 2px', fontSize: 10 }}>→</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {m.status === 'en_attente_verification' && (
                        <button onClick={() => setVerificationModal({ isOpen: true, memoire: m })} className="btn btn-primary btn-sm" style={{ background: '#8b5cf6', color: 'white' }} disabled={actionLoading}>
                          <Search size={13} /> Vérifier
                        </button>
                      )}
                      {m.status === 'convocation_envoyee' && (
                        <button onClick={() => handleStatusUpdate(m.id, { status: 'en_attente_verification' })} className="btn btn-primary btn-sm" style={{ background: '#8b5cf6', color: 'white' }} disabled={actionLoading}>
                          <Package size={13} /> Confirmer dépôt
                        </button>
                      )}
                      {m.status === 'verification_ok' && (
                        <button onClick={() => setVerificationModal({ isOpen: true, memoire: m })} className="btn btn-primary btn-sm" style={{ background: '#10B981', color: 'white' }} disabled={actionLoading}>
                          <Upload size={13} /> Upload scan
                        </button>
                      )}
                      {m.status === 'en_attente_quitus' && (
                        <button onClick={() => handleStatusUpdate(m.id, { status: 'quitus_disponible' })} className="btn btn-primary btn-sm" style={{ background: '#10B981', color: 'white' }} disabled={actionLoading}>
                          <FileSignature size={13} /> Signer quitus
                        </button>
                      )}
                      {m.status === 'quitus_disponible' && (
                        <>
                          <button onClick={() => navigate(`/staff/memoires/${m.id}`)} className="btn btn-primary btn-sm" style={{ background: '#3b82f6', color: 'white' }}>
                            <Printer size={13} /> Imprimer
                          </button>
                          <button onClick={() => handleStatusUpdate(m.id, { status: 'quitus_retire' })} className="btn btn-primary btn-sm" style={{ background: '#10B981', color: 'white' }} disabled={actionLoading}>
                            <CheckCircle size={13} /> Retrait
                          </button>
                        </>
                      )}
                      {(m.status === 'verification_ok' || m.status === 'en_attente_quitus' || m.status === 'quitus_disponible') && !m.is_archived && (
                        <button onClick={() => handleArchive(m.id)} className="btn btn-primary btn-sm" style={{ background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }} title="Archiver le document" disabled={actionLoading}>
                          <Archive size={13} /> Archiver
                        </button>
                      )}
                      <Link to={`/staff/memoires/${m.id}`} className="btn btn-ghost btn-sm">
                        <Eye size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMemoires.length === 0 && (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <h3>Aucun mémoire trouvé</h3>
                <p style={{ color: 'var(--texte-muted)' }}>
                  {filterStatus === 'pending' ? 'Tous les mémoires ont été traités. 👍'
                    : filterStatus === 'verification' ? 'Aucun mémoire en attente de vérification.'
                    : filterStatus === 'quitus' ? 'Aucun mémoire en phase de quitus.'
                    : 'Aucun mémoire ne correspond à vos critères.'}
                </p>
              </div>
            )}
          </div>
        )}

        {filteredMemoires.length > 10 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/staff/memoires" className="btn btn-ghost">
              Voir tous les mémoires <ChevronRight size={16} style={{ display: 'inline' }} />
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <VerificationModal
        memoire={verificationModal.memoire}
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, memoire: null })}
        onVerify={handleVerify}
        onUploadScanned={handleUploadScanned}
        loading={actionLoading}
      />

      <DocumentUploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false })}
        memoires={memoires}
        onUploadComplete={handleUploadDocuments}
        loading={actionLoading}
      />

      <MonCompteModal
        isOpen={showMonCompte}
        onClose={() => setShowMonCompte(false)}
        user={user}
        onUpdate={handleProfileUpdated}
        accentColor="#3b82f6"
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes monCompteFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes monCompteScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </Layout>
  );
}
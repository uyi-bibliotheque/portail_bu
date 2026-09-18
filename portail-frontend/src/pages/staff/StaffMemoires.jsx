// pages/staff/StaffMemoires.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, AlertCircle, XCircle,
  Eye, Download, Search, ChevronDown,
  User, Calendar, ArrowLeft, RefreshCw, Printer,
  CheckSquare, X, FileCheck, ChevronRight, Package,
  Send, FileCheck2, Plus, Minus, HelpCircle,
  Building2, School, Users, FileSignature, Scan,
  Upload, CloudUpload, AlertTriangle, Filter,
  ChevronUp, Trash2, Edit, EyeOff, Award, Layers,
  ExternalLink, File, Archive
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  listMemoires,
  updateMemoireStatus,
  downloadQuitus,
  getMemoireStats,
  updateMemoire,
  getMemoireDetail,
  confirmPhysicalSignature,
  uploadScannedDocument,
  verifyMemoire
} from '../../services/endpoints';
import api from '../../services/api';

// ─── CONFIGURATION ────────────────────────────────────────────────

const STATUS_LABEL = {
  brouillon: { label: 'Brouillon', badge: 'badge-slate', icon: '📝', description: 'En cours de rédaction', color: '#94a3b8' },
  depot_en_ligne: { label: 'Déposé en ligne', badge: 'badge-blue', icon: '📤', description: 'En attente de convocation', color: '#3b82f6' },
  convocation_envoyee: { label: 'Convocation envoyée', badge: 'badge-amber', icon: '📧', description: 'En attente de dépôt physique', color: '#F59E0B' },
  relance_envoyee: { label: 'Relance envoyée', badge: 'badge-orange', icon: '⏰', description: 'Délai dépassé', color: '#f97316' },
  en_attente_verification: { label: 'En vérification', badge: 'badge-purple', icon: '🔍', description: 'En attente de vérification physique', color: '#8b5cf6' },
  verification_ok: { label: 'Vérifié', badge: 'badge-green', icon: '✅', description: 'Documents conformes', color: '#10B981' },
  rejete: { label: 'Rejeté', badge: 'badge-red', icon: '❌', description: 'Dépôt rejeté', color: '#ef4444' },
  en_attente_quitus: { label: 'Quitus en attente', badge: 'badge-blue', icon: '⏳', description: 'En attente de signature', color: '#10B981' },
  quitus_disponible: { label: 'Quitus disponible', badge: 'badge-green', icon: '📄', description: 'Quitus prêt', color: '#10B981' },
  quitus_retire: { label: 'Quitus retiré', badge: 'badge-green', icon: '📋', description: 'Dossier terminé', color: '#10B981' },
  abandonne: { label: 'Abandonné', badge: 'badge-slate', icon: '🚫', description: 'Dossier abandonné', color: '#94a3b8' },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous', icon: '📋' },
  { value: 'depot_en_ligne', label: 'Déposés en ligne', icon: '📤' },
  { value: 'convocation_envoyee', label: 'Convocation envoyée', icon: '📧' },
  { value: 'en_attente_verification', label: 'En vérification', icon: '🔍' },
  { value: 'verification_ok', label: 'Vérifiés', icon: '✅' },
  { value: 'rejete', label: 'Rejetés', icon: '❌' },
  { value: 'en_attente_quitus', label: 'Quitus en attente', icon: '⏳' },
  { value: 'quitus_disponible', label: 'Quitus disponibles', icon: '📄' },
  { value: 'quitus_retire', label: 'Terminés', icon: '📋' },
];

const WORKFLOW_STEPS = [
  { key: 'depot_en_ligne', label: 'Dépôt en ligne', icon: '📤', color: '#3b82f6' },
  { key: 'convocation_envoyee', label: 'Convocation', icon: '📧', color: '#F59E0B' },
  { key: 'en_attente_verification', label: 'En vérification', icon: '🔍', color: '#8b5cf6' },
  { key: 'verification_ok', label: 'Vérifié', icon: '✅', color: '#10B981' },
  { key: 'en_attente_quitus', label: 'Quitus en attente', icon: '⏳', color: '#10B981' },
  { key: 'quitus_disponible', label: 'Quitus prêt', icon: '📄', color: '#10B981' },
  { key: 'quitus_retire', label: 'Terminé', icon: '📋', color: '#10B981' },
];

// ─── FONCTION POUR CONSTRUIRE L'URL DES FICHIERS ──────────────

function getFileUrl(memoire, fileType) {
  if (!memoire) return null;

  const urlMap = {
    pdf: memoire.pdf_url,
    word: memoire.word_url,
    scanned: memoire.scanned_url,
    quitus: memoire.quitus_url,
  };

  const url = urlMap[fileType];
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}

// ─── MODAL DE VISUALISATION DES DOCUMENTS ──────────────────────

function DocumentViewerModal({ isOpen, onClose, memoire }) {
  const [activeTab, setActiveTab] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && memoire) {
      setActiveTab('pdf');
      setError(null);
    }
  }, [isOpen, memoire]);

  if (!isOpen || !memoire) return null;

  const hasPdf = !!memoire.pdf_url;
  const hasWord = !!memoire.word_url;
  const hasScanned = !!memoire.scanned_url;
  const hasQuitus = !!memoire.quitus_url;

  const tabs = [
    { key: 'pdf', label: '📄 PDF', active: hasPdf, url: memoire.pdf_url, filename: memoire.pdf_filename || 'document.pdf' },
    { key: 'word', label: '📝 Word', active: hasWord, url: memoire.word_url, filename: memoire.word_filename || 'document.docx' },
    { key: 'scanned', label: '📎 Scanné', active: hasScanned, url: memoire.scanned_url, filename: memoire.scanned_filename || 'scanned.pdf' },
    { key: 'quitus', label: '📋 Quitus', active: hasQuitus, url: memoire.quitus_url, filename: memoire.quitus_filename || 'quitus.pdf' },
  ].filter(t => t.active);

  if (tabs.length === 0) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 40,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <FileText size={64} color="#94a3b8" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun document disponible</h3>
          <p style={{ color: 'var(--texte-muted)', fontSize: 14 }}>
            L'étudiant n'a pas encore téléchargé de documents pour ce mémoire.
          </p>
          <button
            onClick={onClose}
            className="btn btn-bleu"
            style={{ marginTop: 20 }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const currentTab = tabs.find(t => t.key === activeTab);
  const currentUrl = currentTab?.url;

  const handleDownload = async (url, filename) => {
    if (!url) {
      setError('URL du fichier non disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, */*',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setError(`Impossible de télécharger le fichier: ${error.message}`);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const renderDocumentView = () => {
    if (!currentUrl) {
      return (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--texte-muted)' }}>
          <FileText size={56} color="#94a3b8" />
          <p style={{ marginTop: 12 }}>Document non disponible</p>
        </div>
      );
    }

    if (activeTab === 'pdf' || activeTab === 'quitus') {
      return (
        <div style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: '10px 16px',
            background: 'var(--beige)',
            borderRadius: 8,
            flexWrap: 'wrap',
            gap: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {activeTab === 'pdf' ? '📄' : '📋'} {currentTab.filename || 'document.pdf'}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenInNewTab(currentUrl)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                <ExternalLink size={14} /> Nouvel onglet
              </button>
              <button
                onClick={() => handleDownload(currentUrl, currentTab.filename)}
                className="btn btn-primary btn-sm"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={14} className="spin" /> : <Download size={14} />}
                Télécharger
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: 12,
              background: 'rgba(239,68,68,0.08)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={18} />
              {error}
              <button
                onClick={() => window.open(currentUrl, '_blank')}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', color: '#3b82f6' }}
              >
                Ouvrir directement
              </button>
            </div>
          )}

          <div style={{
            flex: 1,
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            minHeight: 350,
            background: '#f8f9fa',
            position: 'relative'
          }}>
            <iframe
              src={currentUrl}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 350,
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              title="Aperçu PDF"
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', minHeight: 400 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '10px 16px',
          background: 'var(--beige)',
          borderRadius: 8,
          flexWrap: 'wrap',
          gap: 8
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {activeTab === 'word' ? '📝' : '📎'} {currentTab.filename || 'document'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleOpenInNewTab(currentUrl)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
            >
              <ExternalLink size={14} /> Nouvel onglet
            </button>
            <button
              onClick={() => handleDownload(currentUrl, currentTab.filename)}
              className="btn btn-primary btn-sm"
              style={{
                background: '#3b82f6',
                color: 'white',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              disabled={loading}
            >
              {loading ? <RefreshCw size={14} className="spin" /> : <Download size={14} />}
              Télécharger
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: 12,
            background: 'rgba(239,68,68,0.08)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          minHeight: 350,
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 40,
          gap: 16
        }}>
          <FileText size={80} color={activeTab === 'word' ? '#3b82f6' : '#10B981'} />
          <p style={{ fontSize: 16, color: 'var(--texte-muted)', textAlign: 'center' }}>
            {activeTab === 'word' ? 'Document Word' : 'Document scanné'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--texte-light)', textAlign: 'center' }}>
            {currentTab.filename}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => handleOpenInNewTab(currentUrl)}
              className="btn btn-bleu"
              style={{ fontSize: 13 }}
            >
              <Eye size={16} /> Visualiser
            </button>
            <button
              onClick={() => handleDownload(currentUrl, currentTab.filename)}
              className="btn btn-primary"
              style={{
                background: '#3b82f6',
                color: 'white',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              disabled={loading}
            >
              {loading ? <RefreshCw size={16} className="spin" /> : <Download size={16} />}
              Télécharger
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} />
              Documents du mémoire
            </h3>
            <p style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
              {memoire.title} • {memoire.author_full_name || memoire.author_name}
              <span style={{ margin: '0 8px' }}>•</span>
              {memoire.matricule}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--beige)',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: '50%',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--beige)'}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 12,
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 400,
                background: activeTab === tab.key ? 'var(--bleu-nuit)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--texte)',
                border: activeTab === tab.key ? '1px solid var(--bleu-nuit)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = 'var(--beige)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', minHeight: 400, position: 'relative' }}>
          {renderDocumentView()}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          fontSize: 12,
          color: 'var(--texte-muted)',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <span>
            📄 {memoire.pdf_url ? '✅ PDF disponible' : '❌ PDF manquant'}
            {' • '}
            📝 {memoire.word_url ? '✅ Word disponible' : '❌ Word manquant'}
            {' • '}
            📎 {memoire.scanned_url ? '✅ Scanné disponible' : '❌ Scanné manquant'}
            {' • '}
            📋 {memoire.quitus_url ? '✅ Quitus disponible' : '❌ Quitus manquant'}
          </span>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            Fermer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// ─── MODAL DE VÉRIFICATION ──────────────────────────────────────

function VerificationModal({ memoire, isOpen, onClose, onVerify, onUploadScanned, loading }) {
  const [documentsConform, setDocumentsConform] = useState(true);
  const [librarianNotes, setLibrarianNotes] = useState('');
  const [scannedFile, setScannedFile] = useState(null);
  const [scannedPreview, setScannedPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setScannedFile(file);
      const reader = new FileReader();
      reader.onload = () => setScannedPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    await onVerify(memoire.id, {
      documents_conform: documentsConform,
      librarian_notes: librarianNotes
    });
    setStep(2);
  };

  const handleUploadScanned = async () => {
    if (!scannedFile) {
      alert('Veuillez sélectionner un fichier scanné');
      return;
    }
    await onUploadScanned(memoire.id, scannedFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            maxWidth: 640,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                {step === 1 ? '🔍 Vérification physique' : '📎 Upload document scanné'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
                {step === 1 ? 'Étape 1/2 - Vérification des documents' : 'Étape 2/2 - Upload du scan signé'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--beige)',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--beige)'}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: step === 1 ? '#8b5cf6' : '#10B981',
              transition: 'background 0.3s'
            }} />
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: step === 1 ? '#8b5cf6' : '#10B981',
              transition: 'background 0.3s'
            }} />
            <div style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: step === 2 ? '#10B981' : 'var(--border)',
              transition: 'background 0.3s'
            }} />
          </div>

          <div style={{ marginBottom: 24, padding: 16, background: 'var(--beige)', borderRadius: 12 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{memoire?.title}</h4>
            <div style={{ fontSize: 13, color: 'var(--texte-muted)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span><User size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {memoire?.author_full_name}</span>
              <span>•</span>
              <span>Matricule: {memoire?.matricule}</span>
              <span>•</span>
              <span>{memoire?.filiere}</span>
            </div>

            <button
              onClick={() => setShowDocumentViewer(true)}
              style={{
                marginTop: 12,
                padding: '6px 14px',
                background: 'var(--bleu-nuit)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Eye size={14} /> Visualiser les documents
            </button>
          </div>

          {step === 1 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Les documents sont-ils conformes ?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    onClick={() => setDocumentsConform(true)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${documentsConform ? '#10B981' : 'var(--border)'}`,
                      background: documentsConform ? 'rgba(16,185,129,0.08)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CheckCircle size={22} color={documentsConform ? '#10B981' : '#94a3b8'} />
                    <span style={{ fontWeight: documentsConform ? 600 : 400 }}>Conforme</span>
                  </button>
                  <button
                    onClick={() => setDocumentsConform(false)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${!documentsConform ? '#ef4444' : 'var(--border)'}`,
                      background: !documentsConform ? 'rgba(239,68,68,0.08)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <X size={22} color={!documentsConform ? '#ef4444' : '#94a3b8'} />
                    <span style={{ fontWeight: !documentsConform ? 600 : 400 }}>Non conforme</span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Notes du bibliothécaire <span style={{ fontWeight: 400, color: 'var(--texte-light)' }}>(optionnel)</span>
                </label>
                <textarea
                  value={librarianNotes}
                  onChange={(e) => setLibrarianNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur la vérification..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: 'var(--beige)',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <button
                  onClick={onClose}
                  className="btn btn-ghost"
                  style={{ padding: '10px 24px' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 28px',
                    background: '#8b5cf6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {loading ? <RefreshCw size={16} className="spin" /> : <CheckCircle size={16} />}
                  Valider la vérification
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{
                padding: '20px',
                background: 'rgba(16,185,129,0.06)',
                borderRadius: 12,
                border: '1px solid rgba(16,185,129,0.2)',
                marginBottom: 20
              }}>
                <p style={{ fontSize: 14, color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} />
                  Vérification validée avec succès !
                </p>
                <p style={{ fontSize: 13, color: 'var(--texte-muted)', marginTop: 4 }}>
                  Téléchargez maintenant le document scanné signé par l'étudiant.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Document scanné signé <span style={{ fontWeight: 400, color: '#ef4444' }}>*</span>
                </label>
                <div
                  style={{
                    border: `2px dashed ${isDragging ? '#8b5cf6' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '32px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(139,92,246,0.05)' : 'var(--beige)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {scannedPreview ? (
                    <div>
                      <img
                        src={scannedPreview}
                        alt="Aperçu"
                        style={{
                          maxHeight: 160,
                          maxWidth: '100%',
                          borderRadius: 8,
                          marginBottom: 12,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>
                        ✅ {scannedFile?.name} ({(scannedFile?.size / 1024).toFixed(1)} KB)
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setScannedFile(null); setScannedPreview(null); }}
                        style={{
                          marginTop: 8,
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <X size={14} /> Supprimer
                      </button>
                    </div>
                  ) : (
                    <>
                      <CloudUpload size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                      <p style={{ fontSize: 14, color: 'var(--texte-muted)', marginBottom: 4 }}>
                        Glissez-déposez le fichier scanné ici
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--texte-light)' }}>
                        ou cliquez pour sélectionner un fichier
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--texte-light)', marginTop: 8 }}>
                        Format accepté: PDF, JPG, PNG • Max 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <button
                  onClick={() => { setStep(1); setScannedFile(null); setScannedPreview(null); }}
                  className="btn btn-ghost"
                  style={{ padding: '10px 20px' }}
                >
                  <ArrowLeft size={14} style={{ marginRight: 4 }} /> Retour
                </button>
                <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 20px' }}>
                  Terminer plus tard
                </button>
                {scannedFile && (
                  <button
                    onClick={handleUploadScanned}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 28px',
                      background: '#10B981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {loading ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
                    Upload le document
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <DocumentViewerModal
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        memoire={memoire}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}

// ─── MODAL DE REJET ─────────────────────────────────────────────

function RejectModal({ isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('Veuillez saisir un motif de rejet');
      return;
    }
    onConfirm(reason);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 32,
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>❌ Rejeter le dépôt</h3>
            <p style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
              Cette action est irréversible.
            </p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'var(--texte-muted)', marginBottom: 16 }}>
          Veuillez indiquer le motif du rejet pour informer l'étudiant.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif du rejet..."
          style={{
            width: '100%',
            minHeight: 100,
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: 20,
            background: 'var(--beige)',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#ef4444'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          autoFocus
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ flex: 1, padding: '10px' }}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{
              flex: 1,
              background: '#ef4444',
              color: 'white',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <X size={16} />}
            Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT CARTE MÉMOIRE ────────────────────────────────────

function MemoireCard({ memoire, onStatusUpdate, onRefresh, onAction, onVerify, onUploadScanned }) {
  const { addToast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const status = STATUS_LABEL[memoire.status] || STATUS_LABEL.brouillon;

  const statusColors = {
    brouillon: { bg: 'rgba(148,163,184,0.1)', border: '#94a3b8' },
    depot_en_ligne: { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6' },
    convocation_envoyee: { bg: 'rgba(245,158,11,0.1)', border: '#F59E0B' },
    relance_envoyee: { bg: 'rgba(249,115,22,0.1)', border: '#f97316' },
    en_attente_verification: { bg: 'rgba(139,92,246,0.1)', border: '#8b5cf6' },
    verification_ok: { bg: 'rgba(16,185,129,0.1)', border: '#10B981' },
    rejete: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444' },
    en_attente_quitus: { bg: 'rgba(16,185,129,0.1)', border: '#10B981' },
    quitus_disponible: { bg: 'rgba(16,185,129,0.1)', border: '#10B981' },
    quitus_retire: { bg: 'rgba(16,185,129,0.1)', border: '#10B981' },
    abandonne: { bg: 'rgba(148,163,184,0.1)', border: '#94a3b8' },
  };
  const color = statusColors[memoire.status] || statusColors.brouillon;

  const hasPdf = !!memoire.pdf_url;
  const hasWord = !!memoire.word_url;
  const isPhysicalConfirmed = memoire.physical_deposit_confirmed;
  const isQuitusPhysicallySigned = memoire.is_quitus_physically_signed;
  const hasQuitusFile = !!memoire.quitus_url;
  const hasScannedDoc = !!memoire.scanned_url;
  const isArchived = memoire.is_archived || false;

  const canSendConvocation = memoire.status === 'depot_en_ligne';
  const canVerify = memoire.status === 'convocation_envoyee' || memoire.status === 'relance_envoyee';
  const canValidateVerification = memoire.status === 'en_attente_verification';
  const canSignQuitus = memoire.status === 'en_attente_quitus';
  const canReject = ['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee', 'en_attente_verification', 'verification_ok'].includes(memoire.status);
  const canReopen = memoire.status === 'rejete';
  const canMarkPhysical = memoire.status === 'convocation_envoyee' || memoire.status === 'relance_envoyee';
  const showDownloadQuitus = (memoire.status === 'quitus_disponible' || memoire.status === 'quitus_retire') && hasQuitusFile;
  const canConfirmRetire = memoire.status === 'quitus_disponible';
  const canUploadScan = memoire.status === 'verification_ok' || memoire.status === 'en_attente_quitus';

  // ─── ARCHIVAGE ───────────────────────────────────────────────────
  // L'archivage est possible pour les statuts: verification_ok, en_attente_quitus, quitus_disponible
  const canArchive = (memoire.status === 'verification_ok' || 
                      memoire.status === 'en_attente_quitus' || 
                      memoire.status === 'quitus_disponible') 
                     && !isArchived && hasPdf;

  const handleSendConvocation = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(memoire.id, { status: 'convocation_envoyee' });
      addToast('📧 Convocation envoyée avec succès !', 'success');
      onRefresh?.();
    } catch (error) {
      addToast('Erreur lors de l\'envoi de la convocation', 'error');
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleMarkPhysical = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('physical_deposit_confirmed', 'true');
      await updateMemoire(memoire.id, formData);
      addToast('📦 Dépôt physique confirmé !', 'success');
      onRefresh?.();
    } catch (error) {
      addToast('Erreur lors de la confirmation du dépôt physique', 'error');
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleAction = async (action, extraData = null) => {
    setLoading(true);
    try {
      if (action === 'archive') {
        // Appeler l'API d'archivage
        const response = await api.post(`/memoires/${memoire.id}/test-archive/`);
        if (response.data.success) {
          addToast(`✅ ${response.data.message}`, 'success');
        } else {
          addToast(`❌ ${response.data.error || 'Erreur lors de l\'archivage'}`, 'error');
        }
        onRefresh?.();
        setShowActions(false);
        setLoading(false);
        return;
      }

      const payload = { status: action };
      if (action === 'rejete' && extraData) {
        payload.rejection_reason = extraData;
      }
      await onStatusUpdate(memoire.id, payload);
      onRefresh?.();
      onAction?.(memoire.id, action);
      addToast(`✅ ${STATUS_LABEL[action]?.label || action} avec succès`, 'success');
    } catch (error) {
      console.error('Erreur action:', error);
      addToast('Erreur lors de l\'action', 'error');
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setShowRejectModal(false);
    await handleAction('rejete', reason);
  };

  const handleDownloadQuitus = async () => {
    try {
      const res = await downloadQuitus(memoire.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quitus_${memoire.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Quitus téléchargé avec succès', 'success');
    } catch (error) {
      addToast('Erreur lors du téléchargement du quitus', 'error');
    }
  };

  const handlePrintQuitus = async () => {
    try {
      const res = await downloadQuitus(memoire.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => printWindow.print());
      }
      URL.revokeObjectURL(url);
      addToast('Impression du quitus en cours...', 'info');
    } catch (error) {
      addToast('Erreur lors de l\'impression du quitus', 'error');
    }
  };

  const actionCount = [
    canSendConvocation,
    canVerify,
    canValidateVerification,
    canSignQuitus,
    canMarkPhysical,
    canReject,
    canReopen,
    canConfirmRetire,
    canUploadScan,
    canArchive
  ].filter(Boolean).length;

  const isPending = ['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee', 'en_attente_verification'].includes(memoire.status);

  return (
    <>
      <div
        style={{
          background: 'white',
          border: `1px solid ${isPending ? color.border + '40' : color.border + '20'}`,
          borderRadius: 16,
          padding: '20px 24px',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
      >
        {isPending && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${color.border}, ${color.border}dd)`,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 14px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 600,
                  background: color.bg,
                  color: color.border
                }}
              >
                {status.icon} {status.label}
              </span>
              {memoire.is_quitus_signed && (
                <span className="badge badge-green" style={{ fontSize: 11 }}>✅ Quitus signé</span>
              )}
              {isQuitusPhysicallySigned && (
                <span className="badge badge-green" style={{ fontSize: 11 }}>📄 Signé physiquement</span>
              )}
              {isPhysicalConfirmed && (
                <span className="badge badge-green" style={{ fontSize: 11 }}>📦 Dépôt physique confirmé</span>
              )}
              {hasScannedDoc && (
                <span className="badge badge-green" style={{ fontSize: 11 }}>📎 Document scanné</span>
              )}
              {isArchived && (
                <span className="badge badge-green" style={{ fontSize: 11 }}>📁 Archivé</span>
              )}
              {actionCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 12px',
                    borderRadius: 50,
                    fontSize: 10,
                    fontWeight: 600,
                    background: 'rgba(59,130,246,0.1)',
                    color: '#3b82f6'
                  }}
                >
                  {actionCount} action{actionCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2, color: 'var(--bleu-nuit)' }}>
              {memoire.title}
            </h3>

            <div style={{ fontSize: 13, color: 'var(--texte-muted)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> {memoire.author_full_name || memoire.author_name}
              </span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={12} /> {memoire.filiere || memoire.department}
              </span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>Matricule: {memoire.matricule || 'N/A'}</span>
            </div>

            <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {hasPdf ? '✅' : '❌'} PDF
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {hasWord ? '✅' : '❌'} Word
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isPhysicalConfirmed ? '✅' : '⏳'} Dépôt physique
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {hasScannedDoc ? '✅' : '⏳'} Document scanné
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isArchived ? '✅' : '⏳'} Archivé
              </span>
            </div>

            {memoire.rejection_reason && (
              <div
                style={{
                  marginTop: 8,
                  padding: '6px 14px',
                  background: 'rgba(239,68,68,0.08)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid rgba(239,68,68,0.15)'
                }}
              >
                <AlertTriangle size={14} />
                {memoire.rejection_reason}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <WorkflowStepper
                currentStatus={memoire.status}
                isRejected={memoire.status === 'rejete'}
                rejectionReason={memoire.rejection_reason}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {(hasPdf || hasWord || hasScannedDoc || hasQuitusFile) && (
              <button
                onClick={() => setShowDocumentViewer(true)}
                className="btn btn-ghost btn-sm"
                style={{
                  background: 'var(--beige)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Eye size={14} /> Docs
              </button>
            )}

            {canSendConvocation && (
              <button
                onClick={handleSendConvocation}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#F59E0B', color: 'white' }}
              >
                <Send size={14} /> Convocation
              </button>
            )}

            {canMarkPhysical && (
              <button
                onClick={handleMarkPhysical}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <Package size={14} /> Dépôt physique
              </button>
            )}

            {canValidateVerification && (
              <button
                onClick={() => setShowVerificationModal(true)}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#8b5cf6', color: 'white' }}
              >
                <Search size={14} /> Vérifier
              </button>
            )}

            {canUploadScan && (
              <button
                onClick={() => setShowVerificationModal(true)}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <Upload size={14} /> Upload scan
              </button>
            )}

            {canSignQuitus && (
              <button
                onClick={() => handleAction('quitus_disponible')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <FileSignature size={14} /> Signer quitus
              </button>
            )}

            {/* ─── BOUTON ARCHIVER ─── */}
            {canArchive && (
              <button
                onClick={() => handleAction('archive')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Archiver le document (renommer et déplacer)"
              >
                <Archive size={14} /> Archiver
              </button>
            )}

            {showDownloadQuitus && (
              <>
                <button
                  onClick={handleDownloadQuitus}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#3b82f6', color: 'white' }}
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={handlePrintQuitus}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#8b5cf6', color: 'white' }}
                >
                  <Printer size={14} />
                </button>
              </>
            )}

            {canConfirmRetire && (
              <button
                onClick={() => handleAction('quitus_retire')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <CheckSquare size={14} /> Retrait
              </button>
            )}

            {actionCount > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="btn btn-ghost btn-sm"
                  disabled={loading}
                  style={{
                    background: 'var(--beige)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {loading ? <RefreshCw size={14} className="spin" /> : <ChevronDown size={14} />}
                  Actions
                </button>
                {showActions && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 6,
                      background: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      boxShadow: 'var(--shadow-lg)',
                      padding: 6,
                      minWidth: 260,
                      zIndex: 10,
                      maxHeight: 400,
                      overflowY: 'auto'
                    }}
                  >
                    {canVerify && (
                      <button
                        onClick={() => handleAction('en_attente_verification')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
                      >
                        <Search size={14} color="#8b5cf6" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>🔍 Mettre en vérification</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            L'étudiant doit venir avec ses documents
                          </div>
                        </div>
                      </button>
                    )}

                    {canValidateVerification && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderLeft: '3px solid #8b5cf6' }}
                      >
                        <Search size={14} color="#8b5cf6" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>🔍 Vérifier physiquement</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Lancer la procédure de vérification
                          </div>
                        </div>
                      </button>
                    )}

                    {canUploadScan && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderLeft: '3px solid #10B981' }}
                      >
                        <Upload size={14} color="#10B981" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>📎 Upload document scanné</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Télécharger le scan signé par l'étudiant
                          </div>
                        </div>
                      </button>
                    )}

                    {canSignQuitus && (
                      <button
                        onClick={() => handleAction('quitus_disponible')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderLeft: '3px solid #10B981' }}
                      >
                        <FileCheck size={14} color="#10B981" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>📄 Signer le quitus</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Générer et signer le quitus
                          </div>
                        </div>
                      </button>
                    )}

                    {canArchive && (
                      <button
                        onClick={() => handleAction('archive')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderLeft: '3px solid #8b5cf6' }}
                      >
                        <Archive size={14} color="#8b5cf6" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>📁 Archiver</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Renommer et déplacer le document
                          </div>
                        </div>
                      </button>
                    )}

                    {canConfirmRetire && (
                      <button
                        onClick={() => handleAction('quitus_retire')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderLeft: '3px solid #10B981' }}
                      >
                        <CheckSquare size={14} color="#10B981" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>📋 Confirmer le retrait</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            L'étudiant a récupéré son quitus
                          </div>
                        </div>
                      </button>
                    )}

                    {(canVerify || canValidateVerification || canSignQuitus || canUploadScan || canArchive) && canReject && (
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
                    )}

                    {canReject && (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', color: '#ef4444' }}
                      >
                        <XCircle size={14} color="#ef4444" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>❌ Rejeter</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Motiver le rejet du dépôt
                          </div>
                        </div>
                      </button>
                    )}

                    {canReopen && (
                      <button
                        onClick={() => handleAction('depot_en_ligne')}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
                      >
                        <RefreshCw size={14} color="#F59E0B" style={{ marginRight: 10 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>🔄 Réouvrir</div>
                          <div style={{ fontSize: 10, color: 'var(--texte-light)' }}>
                            Le dépôt revient en attente de convocation
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        loading={loading}
      />

      <VerificationModal
        memoire={memoire}
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={onVerify}
        onUploadScanned={onUploadScanned}
        loading={loading}
      />

      <DocumentViewerModal
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        memoire={memoire}
      />
    </>
  );
}

// ─── WORKFLOW STEPPER ───────────────────────────────────────────

function WorkflowStepper({ currentStatus, isRejected, rejectionReason }) {
  if (isRejected) {
    return (
      <div
        style={{
          padding: '6px 14px',
          background: 'rgba(239,68,68,0.06)',
          borderRadius: 8,
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <AlertTriangle size={14} color="#ef4444" />
        <span style={{ fontWeight: 600, color: '#b91c1c', fontSize: 12 }}>Dépôt rejeté</span>
        {rejectionReason && (
          <span style={{ fontSize: 11, color: '#991b1b' }}>— {rejectionReason}</span>
        )}
      </div>
    );
  }

  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.key === currentStatus);

  if (currentStatus === 'quitus_retire') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 50,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid #10B981',
                opacity: 1
              }}
            >
              <span style={{ fontSize: 11 }}>{step.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: '#10B981' }}>
                {step.label}
              </span>
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div style={{ width: 14, height: 2, background: '#10B981', margin: '0 2px' }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {WORKFLOW_STEPS.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px 3px 8px',
                borderRadius: 50,
                background: isActive ? `${step.color}15` : 'var(--beige)',
                border: `1px solid ${isActive ? step.color : 'var(--border)'}`,
                opacity: isActive ? 1 : 0.5,
                transition: 'all 0.3s'
              }}
            >
              <span style={{ fontSize: 11 }}>{step.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isActive ? step.color : 'var(--texte-muted)'
                }}
              >
                {step.label}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 7,
                    background: step.color,
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: 50,
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  En cours
                </span>
              )}
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div
                style={{
                  width: 14,
                  height: 2,
                  background: isActive && index < currentIndex ? step.color : 'var(--border)',
                  margin: '0 2px',
                  borderRadius: 1,
                  transition: 'background 0.3s'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────

export default function StaffMemoires() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [memoires, setMemoires] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await getMemoireStats();
      setStats(statsRes.data);

      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const memoiresRes = await listMemoires(params);
      setMemoires(memoiresRes.data?.results || memoiresRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      addToast('Erreur chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadData();
    }
  }, [filter, isStaff]);

  const handleStatusUpdate = async (id, payload) => {
    try {
      await updateMemoireStatus(id, payload);
      await loadData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  };

  const handleVerify = async (id, data) => {
    setActionLoading(true);
    try {
      await verifyMemoire(id, data);
      addToast('✅ Vérification validée avec succès !', 'success');
      await loadData();
    } catch (error) {
      addToast('Erreur lors de la vérification', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadScanned = async (id, file) => {
    setActionLoading(true);
    try {
      await uploadScannedDocument(id, file);
      addToast('📎 Document scanné uploadé avec succès !', 'success');
      await loadData();
    } catch (error) {
      addToast('Erreur lors de l\'upload du document scanné', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const actionLabels = {
      physical_confirmed: 'Dépôt physique confirmé',
      physical_sign: 'Quitus signé physiquement',
      valide: 'Mémoire validé',
      quitus_genere: 'Quitus généré',
      quitus_signe: 'Quitus signé',
      rejete: 'Dépôt rejeté',
      incomplet: 'Dossier réouvert',
      archive: 'Document archivé'
    };
    addToast(`✅ ${actionLabels[action] || action} avec succès`, 'success');
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setSearchParams({ status: value });
  };

  if (!isStaff) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Accès réservé au personnel</h2>
          <Link to="/" className="btn btn-bleu" style={{ marginTop: 20 }}>
            Retour à l'accueil
          </Link>
        </div>
      </Layout>
    );
  }

  const filteredMemoires = memoires.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.author_full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.matricule?.toLowerCase().includes(search.toLowerCase()) ||
    m.filiere?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { key: 'total', label: 'Total', color: 'var(--bleu-nuit)' },
    { key: 'depot_en_ligne', label: 'À convoquer', color: '#3b82f6' },
    { key: 'convocation_envoyee', label: 'Convocation envoyée', color: '#F59E0B' },
    { key: 'en_attente_verification', label: 'En vérification', color: '#8b5cf6' },
    { key: 'verification_ok', label: 'Vérifiés', color: '#10B981' },
    { key: 'quitus_disponible', label: 'Quitus prêts', color: '#10B981' },
    { key: 'quitus_retire', label: 'Terminés', color: '#1B1464' },
    { key: 'rejete', label: 'Rejetés', color: '#ef4444' },
  ];

  return (
    <Layout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
        padding: '32px 0 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/staff')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              marginBottom: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 32, color: 'white', fontWeight: 400 }}>
                Gestion des <span style={{ color: 'var(--or)' }}>Dépôts</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
                Gérez les dépôts de mémoires et thèses étape par étape
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={loadData} className="btn btn-outline-white btn-sm">
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 10,
            marginBottom: 24
          }}>
            {statCards.map(s => (
              <div
                key={s.key}
                onClick={() => handleFilterChange(s.key)}
                style={{
                  background: 'white',
                  border: `1px solid ${filter === s.key ? s.color : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: filter === s.key ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: s.color,
                  transition: 'color 0.2s'
                }}>
                  {stats[s.key] || 0}
                </div>
                <div style={{ fontSize: 10, color: 'var(--texte-muted)', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s.value}
                onClick={() => handleFilterChange(s.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: filter === s.value ? 600 : 400,
                  background: filter === s.value ? 'var(--bleu-nuit)' : 'white',
                  color: filter === s.value ? 'white' : 'var(--texte)',
                  border: `1px solid ${filter === s.value ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--texte-light)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  padding: '7px 12px 7px 36px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 13,
                  width: 200,
                  background: 'white',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--bleu-nuit)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,20,100,0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          padding: '10px 16px',
          background: 'var(--beige)',
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 11,
          color: 'var(--texte-muted)',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600 }}>📋 Workflow :</span>
          {WORKFLOW_STEPS.map((step, index) => (
            <span key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: step.color }}>{step.icon}</span>
              <span style={{ fontWeight: index === WORKFLOW_STEPS.length - 1 ? 500 : 400 }}>
                {step.label}
              </span>
              {index < WORKFLOW_STEPS.length - 1 && (
                <span style={{ color: 'var(--border)', marginLeft: 2 }}>→</span>
              )}
            </span>
          ))}
          <span style={{ color: '#ef4444' }}>| ❌ Rejeté</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
            ))}
          </div>
        ) : filteredMemoires.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3>Aucun dépôt trouvé</h3>
            <p style={{ color: 'var(--texte-muted)' }}>
              {filter !== 'all'
                ? `Aucun dépôt avec le statut "${STATUS_FILTERS.find(f => f.value === filter)?.label || filter}"`
                : 'Aucun dépôt ne correspond à vos critères.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMemoires.map(m => (
              <MemoireCard
                key={m.id}
                memoire={m}
                onStatusUpdate={handleStatusUpdate}
                onRefresh={loadData}
                onAction={handleAction}
                onVerify={handleVerify}
                onUploadScanned={handleUploadScanned}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
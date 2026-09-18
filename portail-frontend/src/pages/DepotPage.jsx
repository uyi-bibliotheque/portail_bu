// pages/DepotPage.jsx - VERSION AVEC BLOCAGE DU DÉPÔT
import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle, Clock, AlertCircle,
  XCircle, Download, Eye, ChevronRight, Plus, ArrowLeft,
  RefreshCw, Printer, User, Calendar, CheckSquare,
  BookOpen, GraduationCap, Users, FileCheck, Send,
  Trash2, Edit2, Info, MapPin, Building2, School,
  Archive, Library, Home, Award, Sparkles, ShieldAlert
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import DepotDisabledModal from '../components/DepotDisabledModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FEATURES } from '../config/features';
import { 
  submitMemoire, getMyMemoires, downloadQuitus, 
  updateMemoireStatus, getMemoireDetail, updateMemoire,
  getMemoireStats
} from '../services/endpoints';

const PMB_OPAC_URL = 'http://10.4.2.112/pmb/opac_css/';

const STATUS_LABEL = {
  brouillon: { label: 'Brouillon', badge: 'badge-slate', icon: '📝', color: '#94a3b8' },
  depot_en_ligne: { label: 'Dépôt en ligne', badge: 'badge-blue', icon: '📤', color: '#3b82f6' },
  convocation_envoyee: { label: 'Convocation envoyée', badge: 'badge-amber', icon: '📧', color: '#F59E0B' },
  relance_envoyee: { label: 'Relance envoyée', badge: 'badge-orange', icon: '⏰', color: '#f97316' },
  en_attente_verification: { label: 'En attente vérification', badge: 'badge-purple', icon: '🔍', color: '#8b5cf6' },
  verification_ok: { label: 'Vérification OK', badge: 'badge-green', icon: '✅', color: '#10B981' },
  rejete: { label: 'Rejeté', badge: 'badge-red', icon: '❌', color: '#ef4444' },
  en_attente_quitus: { label: 'En attente quitus', badge: 'badge-blue', icon: '⏳', color: '#3b82f6' },
  quitus_disponible: { label: 'Quitus disponible', badge: 'badge-green', icon: '📄', color: '#10B981' },
  quitus_retire: { label: 'Quitus retiré', badge: 'badge-green', icon: '📋', color: '#10B981' },
  abandonne: { label: 'Abandonné', badge: 'badge-slate', icon: '🚫', color: '#94a3b8' },
};

// ─── COMPOSANT DE SUIVI DES ÉTAPES ──────────────────────────────

function DepotSteps({ status }) {
  const steps = [
    { key: 'depot_en_ligne', label: 'Dépôt en ligne', icon: '📤' },
    { key: 'convocation_envoyee', label: 'Convocation', icon: '📧' },
    { key: 'en_attente_verification', label: 'Vérification', icon: '🔍' },
    { key: 'verification_ok', label: 'Validé', icon: '✅' },
    { key: 'quitus_disponible', label: 'Quitus', icon: '📄' },
    { key: 'quitus_retire', label: 'Terminé', icon: '📋' },
  ];

  let currentIndex = steps.findIndex(s => s.key === status);
  
  if (status === 'rejete') {
    return (
      <div className="depot-steps-rejected">
        <XCircle size={16} color="#ef4444" />
        <span className="depot-steps-rejected-text">Dépôt rejeté</span>
      </div>
    );
  }

  if (status === 'quitus_retire') {
    currentIndex = steps.length - 1;
  }

  return (
    <div className="depot-steps">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.key} className="depot-step">
            <div className={`depot-step-content ${isActive ? 'active' : 'inactive'}`}>
              <span className="depot-step-icon">{step.icon}</span>
              <span className={`depot-step-label ${isCurrent ? 'current' : ''}`}>
                {step.label}
              </span>
              {isCurrent && (
                <span className="depot-step-badge">En cours</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`depot-step-line ${isActive && index < currentIndex ? 'active' : 'inactive'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPOSANT STATS CARD ──────────────────────────────────────

function StatsCard({ label, value, icon, color, bg }) {
  return (
    <div className="stats-card" style={{ borderColor: color }}>
      <div className="stats-card-content">
        <div className="stats-card-value" style={{ color }}>{value || 0}</div>
        <div className="stats-card-label">{label}</div>
      </div>
      <div className="stats-card-icon" style={{ background: bg || `${color}15`, color }}>
        {icon}
      </div>
    </div>
  );
}

// ─── FORMULAIRE DE DÉPÔT ──────────────────────────────────────────

function DepotForm({ onSuccess, onCancel, initialData }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [typeDoc, setTypeDoc] = useState(initialData?.type_document || 'MEMOIRE');
  const [form, setForm] = useState({
    title: initialData?.title || '',
    filiere: initialData?.filiere || user?.preferences?.departement || '',
    unite_recherche: initialData?.unite_recherche || '',
    laboratoire: initialData?.laboratoire || '',
    abstract: initialData?.abstract || '',
    keywords: initialData?.keywords || '',
    president_jury: initialData?.president_jury || '',
    examinateur_1: initialData?.examinateur_1 || '',
    examinateur_2: initialData?.examinateur_2 || '',
    examinateur_3: initialData?.examinateur_3 || '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [wordFile, setWordFile] = useState(null);
  const [existingPdf, setExistingPdf] = useState(initialData?.pdf_file);
  const [existingWord, setExistingWord] = useState(initialData?.word_file);
  const pdfRef = useRef();
  const wordRef = useRef();
  const [errors, setErrors] = useState({});
  const isEditing = !!initialData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFile = (setter, ref, setExisting) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && 
        file.type !== 'application/msword') {
      addToast('Seuls les fichiers PDF et Word sont acceptés.', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      addToast('Fichier trop volumineux (max 50 Mo).', 'error');
      return;
    }
    setter(file);
    if (setExisting) setExisting(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = 'Le titre est requis';
    if (!form.filiere.trim()) newErrors.filiere = 'La filière est requise';
    if (!form.abstract.trim()) newErrors.abstract = 'Le résumé est requis';
    if (!form.president_jury.trim()) newErrors.president_jury = 'Le président du jury est requis';
    if (!form.examinateur_1.trim()) newErrors.examinateur_1 = "L'examinateur 1 est requis";
    
    if (typeDoc === 'THESE') {
      if (!form.examinateur_2.trim()) newErrors.examinateur_2 = "L'examinateur 2 est requis pour une thèse";
      if (!form.examinateur_3.trim()) newErrors.examinateur_3 = "L'examinateur 3 est requis pour une thèse";
    }
    
    if (!pdfFile && !existingPdf) newErrors.pdf = 'Le fichier PDF est requis';
    if (!wordFile && !existingWord) newErrors.word = 'Le fichier Word est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Veuillez corriger les erreurs', 'error');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    
    fd.append('type_document', typeDoc);
    fd.append('title', form.title);
    fd.append('filiere', form.filiere);
    fd.append('unite_recherche', form.unite_recherche || '');
    fd.append('laboratoire', form.laboratoire || '');
    fd.append('abstract', form.abstract);
    fd.append('keywords', form.keywords || '');
    fd.append('president_jury', form.president_jury);
    fd.append('examinateur_1', form.examinateur_1);
    fd.append('examinateur_2', form.examinateur_2 || '');
    fd.append('examinateur_3', form.examinateur_3 || '');
    
    if (pdfFile) fd.append('pdf_file', pdfFile);
    if (wordFile) fd.append('word_file', wordFile);
    
    try {
      let response;
      if (isEditing) {
        response = await updateMemoire(initialData.id, fd);
        if (response.status === 200) {
          addToast('Dépôt mis à jour avec succès !', 'success');
          onSuccess?.();
        }
      } else {
        response = await submitMemoire(fd);
        if (response.status === 201 || response.status === 200) {
          addToast('✅ Dépôt effectué avec succès ! Un email de confirmation vous a été envoyé.', 'success');
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error('Erreur dépôt:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       err.response?.data?.message ||
                       'Erreur lors du dépôt. Veuillez réessayer.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="depot-form">
      {/* En-tête du formulaire */}
      <div className="depot-form-header">
        <h2 className="depot-form-title">
          {isEditing ? '✏️ Modifier le dépôt' : '📝 Nouveau dépôt'}
        </h2>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Annuler
        </button>
      </div>

      {/* Type de document */}
      <div className="form-group">
        <label className="form-label">Type de document <span className="required">*</span></label>
        <div className="depot-type-grid">
          <label className={`depot-type-option ${typeDoc === 'MEMOIRE' ? 'active' : ''}`}>
            <input
              type="radio"
              name="type_document"
              value="MEMOIRE"
              checked={typeDoc === 'MEMOIRE'}
              onChange={(e) => setTypeDoc(e.target.value)}
            />
            <BookOpen size={18} />
            <div>
              <div className="depot-type-label">Mémoire de Master</div>
              <div className="depot-type-desc">Président + 1 Examinateur</div>
            </div>
          </label>
          <label className={`depot-type-option ${typeDoc === 'THESE' ? 'active' : ''}`}>
            <input
              type="radio"
              name="type_document"
              value="THESE"
              checked={typeDoc === 'THESE'}
              onChange={(e) => setTypeDoc(e.target.value)}
            />
            <GraduationCap size={18} />
            <div>
              <div className="depot-type-label">Thèse de Doctorat</div>
              <div className="depot-type-desc">Président + 3 Examinateurs</div>
            </div>
          </label>
        </div>
      </div>

      {/* Informations de l'étudiant */}
      <div className="depot-student-info">
        <div className="depot-student-header">
          <User size={16} color="var(--or)" />
          <span>Informations de l'étudiant</span>
        </div>
        <div className="depot-student-grid">
          <div>
            <div className="depot-student-label">Matricule</div>
            <div className="depot-student-value">{user?.username || 'N/A'}</div>
          </div>
          <div>
            <div className="depot-student-label">Nom complet</div>
            <div className="depot-student-value">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Champs du formulaire */}
      <div className="form-group">
        <label className="form-label">Titre du document <span className="required">*</span></label>
        <input
          name="title"
          className={`form-input ${errors.title ? 'error' : ''}`}
          value={form.title}
          onChange={handleChange}
          placeholder="Titre complet"
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Filière / Département <span className="required">*</span></label>
        <input
          name="filiere"
          className={`form-input ${errors.filiere ? 'error' : ''}`}
          value={form.filiere}
          onChange={handleChange}
          placeholder="Ex : Informatique"
        />
        {errors.filiere && <div className="form-error">{errors.filiere}</div>}
      </div>

      <div className="depot-form-row">
        <div className="form-group">
          <label className="form-label">Unité de recherche</label>
          <input
            name="unite_recherche"
            className="form-input"
            value={form.unite_recherche}
            onChange={handleChange}
            placeholder="Unité de recherche"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Laboratoire / Spécialité</label>
          <input
            name="laboratoire"
            className="form-input"
            value={form.laboratoire}
            onChange={handleChange}
            placeholder="Laboratoire"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Résumé <span className="required">*</span></label>
        <textarea
          name="abstract"
          className={`form-textarea ${errors.abstract ? 'error' : ''}`}
          value={form.abstract}
          onChange={handleChange}
          placeholder="Résumé du document (250-500 mots recommandés)"
          style={{ minHeight: 120 }}
        />
        {errors.abstract && <div className="form-error">{errors.abstract}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Mots-clés</label>
        <input
          name="keywords"
          className="form-input"
          value={form.keywords}
          onChange={handleChange}
          placeholder="Mots-clés séparés par des virgules"
        />
      </div>

      {/* Jury */}
      <div className="depot-jury-section">
        <div className="depot-jury-header">
          <Users size={16} color="var(--or)" />
          <span>Membres du jury</span>
          <span className="depot-jury-hint">
            ({typeDoc === 'MEMOIRE' ? 'Président + 1 Examinateur' : 'Président + 3 Examinateurs'})
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Président du jury <span className="required">*</span></label>
          <input
            name="president_jury"
            className={`form-input ${errors.president_jury ? 'error' : ''}`}
            value={form.president_jury}
            onChange={handleChange}
            placeholder="Nom du président"
          />
          {errors.president_jury && <div className="form-error">{errors.president_jury}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Examinateur 1 <span className="required">*</span></label>
          <input
            name="examinateur_1"
            className={`form-input ${errors.examinateur_1 ? 'error' : ''}`}
            value={form.examinateur_1}
            onChange={handleChange}
            placeholder="Nom de l'examinateur 1"
          />
          {errors.examinateur_1 && <div className="form-error">{errors.examinateur_1}</div>}
        </div>

        {typeDoc === 'THESE' && (
          <>
            <div className="form-group">
              <label className="form-label">Examinateur 2 <span className="required">*</span></label>
              <input
                name="examinateur_2"
                className={`form-input ${errors.examinateur_2 ? 'error' : ''}`}
                value={form.examinateur_2}
                onChange={handleChange}
                placeholder="Nom de l'examinateur 2"
              />
              {errors.examinateur_2 && <div className="form-error">{errors.examinateur_2}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Examinateur 3 <span className="required">*</span></label>
              <input
                name="examinateur_3"
                className={`form-input ${errors.examinateur_3 ? 'error' : ''}`}
                value={form.examinateur_3}
                onChange={handleChange}
                placeholder="Nom de l'examinateur 3"
              />
              {errors.examinateur_3 && <div className="form-error">{errors.examinateur_3}</div>}
            </div>
          </>
        )}
      </div>

      {/* Fichiers */}
      <div className="depot-files-section">
        <div className="depot-files-header">
          <FileText size={16} color="var(--or)" />
          <span>Fichiers à déposer</span>
          <span className="depot-files-required">*</span>
        </div>

        {/* PDF */}
        <div className="form-group">
          <label className="form-label">Fichier PDF <span className="required">*</span></label>
          <div
            className={`depot-file-dropzone ${pdfFile || existingPdf ? 'has-file' : ''} ${errors.pdf ? 'error' : ''}`}
            onClick={() => pdfRef.current?.click()}
          >
            <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFile(setPdfFile, pdfRef, setExistingPdf)} />
            {(pdfFile || existingPdf) ? (
              <div className="depot-file-selected">
                <CheckCircle size={20} color="var(--green)" />
                <span className="depot-file-name">
                  {pdfFile ? pdfFile.name : existingPdf?.name || 'PDF existant'}
                </span>
                {pdfFile && (
                  <span className="depot-file-size">
                    ({(pdfFile.size / 1024 / 1024).toFixed(1)} Mo)
                  </span>
                )}
                {!pdfFile && existingPdf && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setExistingPdf(null); }}
                    className="depot-file-remove"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="depot-file-placeholder">
                <Upload size={28} color="var(--texte-muted)" />
                <div className="depot-file-text">Cliquez pour sélectionner le PDF</div>
                <div className="depot-file-hint">PDF uniquement – 50 Mo maximum</div>
              </div>
            )}
          </div>
          {errors.pdf && <div className="form-error">{errors.pdf}</div>}
        </div>

        {/* Word */}
        <div className="form-group">
          <label className="form-label">Fichier Word <span className="required">*</span></label>
          <div
            className={`depot-file-dropzone ${wordFile || existingWord ? 'has-file' : ''} ${errors.word ? 'error' : ''}`}
            onClick={() => wordRef.current?.click()}
          >
            <input ref={wordRef} type="file" accept=".doc,.docx" style={{ display: 'none' }} onChange={handleFile(setWordFile, wordRef, setExistingWord)} />
            {(wordFile || existingWord) ? (
              <div className="depot-file-selected">
                <CheckCircle size={20} color="var(--green)" />
                <span className="depot-file-name">
                  {wordFile ? wordFile.name : existingWord?.name || 'Word existant'}
                </span>
                {wordFile && (
                  <span className="depot-file-size">
                    ({(wordFile.size / 1024 / 1024).toFixed(1)} Mo)
                  </span>
                )}
                {!wordFile && existingWord && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setExistingWord(null); }}
                    className="depot-file-remove"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="depot-file-placeholder">
                <Upload size={28} color="var(--texte-muted)" />
                <div className="depot-file-text">Cliquez pour sélectionner le Word</div>
                <div className="depot-file-hint">Word uniquement – 50 Mo maximum</div>
              </div>
            )}
          </div>
          {errors.word && <div className="form-error">{errors.word}</div>}
        </div>
      </div>

      {/* Déclaration */}
      <div className="depot-declaration">
        <label className="depot-declaration-label">
          <input type="checkbox" required />
          <div>
            <strong>Je certifie que :</strong>
            <ul>
              <li>Ce document est la version corrigée finale</li>
              <li>Je m'engage à déposer les documents physiques sous 7 jours</li>
              <li>Les informations fournies sont exactes</li>
            </ul>
          </div>
        </label>
      </div>

      {/* Boutons */}
      <div className="depot-form-actions">
        <button type="submit" className="btn btn-bleu" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={16} className="spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send size={16} />
              {isEditing ? 'Mettre à jour' : 'Soumettre le dépôt'}
            </>
          )}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Annuler
        </button>
      </div>

      <style>{`
        /* ─── FORM STYLES ─── */
        .depot-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 0;
        }

        .depot-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .depot-form-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--bleu-nuit);
        }

        .required {
          color: var(--red);
          font-weight: 700;
        }

        .depot-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .depot-type-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--border);
          background: white;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .depot-type-option.active {
          border-color: var(--or);
          background: rgba(124,58,237,0.05);
        }

        .depot-type-option:hover:not(.active) {
          border-color: var(--or-light);
        }

        .depot-type-option input {
          display: none;
        }

        .depot-type-label {
          font-weight: 600;
          font-size: 14px;
        }

        .depot-type-desc {
          font-size: 11px;
          color: var(--texte-muted);
        }

        .depot-student-info {
          padding: 16px 20px;
          background: var(--beige);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .depot-student-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .depot-student-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .depot-student-label {
          font-size: 11px;
          color: var(--texte-muted);
        }

        .depot-student-value {
          font-weight: 600;
        }

        .depot-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .depot-jury-section {
          padding: 16px 20px;
          background: var(--beige);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .depot-jury-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .depot-jury-hint {
          font-size: 11px;
          color: var(--texte-muted);
          font-weight: 400;
        }

        .depot-files-section {
          padding: 16px 20px;
          background: var(--beige);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .depot-files-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .depot-files-required {
          font-size: 11px;
          color: var(--red);
        }

        .depot-file-dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius-sm);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          background: white;
        }

        .depot-file-dropzone:hover {
          border-color: var(--or);
          background: rgba(124,58,237,0.02);
        }

        .depot-file-dropzone.has-file {
          border-color: var(--green);
          background: rgba(16,185,129,0.04);
        }

        .depot-file-dropzone.error {
          border-color: var(--red);
          background: rgba(239,68,68,0.04);
        }

        .depot-file-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .depot-file-name {
          font-weight: 600;
          color: #047857;
        }

        .depot-file-size {
          font-size: 12px;
          color: var(--texte-muted);
        }

        .depot-file-remove {
          color: var(--red);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: color 0.2s;
        }

        .depot-file-remove:hover {
          color: #b91c1c;
        }

        .depot-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .depot-file-text {
          font-weight: 600;
          margin-top: 4px;
        }

        .depot-file-hint {
          font-size: 12px;
          color: var(--texte-muted);
        }

        .depot-declaration {
          padding: 16px 20px;
          background: rgba(16,185,129,0.04);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(16,185,129,0.15);
        }

        .depot-declaration-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .depot-declaration-label input {
          margin-top: 2px;
          flex-shrink: 0;
          accent-color: var(--or);
        }

        .depot-declaration-label ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }

        .depot-form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .depot-form-actions .btn {
          flex: 1;
          justify-content: center;
          padding: 13px 28px;
          font-size: 15px;
          min-width: 160px;
        }

        .depot-form-actions .btn-ghost {
          flex: 0 1 auto;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 768px) {
          .depot-type-grid {
            grid-template-columns: 1fr;
          }

          .depot-form-row {
            grid-template-columns: 1fr;
          }

          .depot-form-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .depot-form-actions {
            flex-direction: column;
          }

          .depot-form-actions .btn {
            flex: none;
            width: 100%;
          }

          .depot-form-actions .btn-ghost {
            flex: none;
          }

          .depot-student-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .depot-form {
            padding: 16px 0;
          }

          .depot-form-title {
            font-size: 18px;
          }

          .depot-type-option {
            padding: 10px 14px;
          }

          .depot-type-label {
            font-size: 13px;
          }
        }
      `}</style>
    </form>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────

export default function DepotPage() {
  const { user, loading, isStaff } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [view, setView] = useState('list');
  const [selected, setSel] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editingMemoire, setEditingMemoire] = useState(null);
  const [showDisabledModal, setShowDisabledModal] = useState(false);

  // Mettre à jour le titre de la page pour le SEO
  useEffect(() => {
    document.title = 'Dépôt institutionnel - BCUY1';
  }, []);

  // 🔒 Vérifie si le dépôt est autorisé
  const isDepotEnabled = FEATURES.DEPOT_ENABLED === true;

  // 🔒 Redirection vers la page 404 ou un message si le dépôt est désactivé
  // et que l'utilisateur tente d'accéder directement à la page
  useEffect(() => {
    if (!isDepotEnabled && view === 'form') {
      setView('list');
      setShowDisabledModal(true);
    }
  }, [isDepotEnabled, view]);

  const loadDossiers = async () => {
    setLoadingData(true);
    try {
      const [statsRes, memoiresRes] = await Promise.all([
        getMemoireStats().catch(() => ({ data: {} })),
        getMyMemoires().catch(() => ({ data: { results: [] } }))
      ]);
      setStats(statsRes.data || {});
      const data = memoiresRes.data?.results || memoiresRes.data || [];
      setDossiers(data);
    } catch (error) {
      console.error('Erreur chargement dossiers:', error);
      setDossiers([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDossiers();
    }
  }, [user]);

  // Si non connecté, rediriger vers l'inscription
  if (!loading && !user) {
    return <Navigate to="/inscription" replace />;
  }

  const handleSuccess = () => {
    setView('list');
    setEditingMemoire(null);
    loadDossiers();
    addToast('Dossier mis à jour avec succès !', 'success');
  };

  const handleCancel = () => {
    setView('list');
    setEditingMemoire(null);
  };

  // 🔒 Gestionnaire de clic sur "Nouveau dépôt" ou "Commencer un dépôt"
  const handleNewDepotClick = () => {
    if (!isDepotEnabled) {
      setShowDisabledModal(true);
      return;
    }
    setEditingMemoire(null);
    setView('form');
  };

  // 🔒 Gestionnaire de clic sur "Modifier" — vérifie aussi si activé
  const handleEditClick = (memoire) => {
    if (!isDepotEnabled) {
      setShowDisabledModal(true);
      return;
    }
    setEditingMemoire(memoire);
    setView('form');
  };

  const handleDownloadQuitus = async (id) => {
    try {
      const res = await downloadQuitus(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quitus_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Téléchargement du quitus démarré.', 'success');
    } catch (error) {
      addToast('Quitus non disponible ou non encore signé.', 'error');
    }
  };

  // Rendu de la liste
  if (view === 'list') {
    return (
      <Layout>
        {/* ═══ BANDEAU D'INFORMATION — DÉPÔT BLOQUÉ ════════════════ */}
        {!isDepotEnabled && (
          <div
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderBottom: '1px solid #FCD34D',
              padding: '14px 0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="container">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(217,119,6,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={18} color="#D97706" />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#92400E',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>🔒 Dépôt temporairement indisponible</strong> —{' '}
                  La fonctionnalité sera activée dès validation officielle par le Rectorat.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EN-TÊTE SEO ════════════════════════════════════════ */}
        <header className="depot-header">
          <div className="container">
            <nav className="depot-breadcrumb">
              <Link to="/" className="depot-breadcrumb-link">
                <Home size={14} /> {isEnglish ? 'Home' : 'Accueil'}
              </Link>
              <span className="depot-breadcrumb-sep">›</span>
              <Link to="/mon-compte" className="depot-breadcrumb-link">
                {isEnglish ? 'My account' : 'Mon compte'}
              </Link>
              <span className="depot-breadcrumb-sep">›</span>
              <span className="depot-breadcrumb-current">{isEnglish ? 'Institutional deposit' : 'Dépôt institutionnel'}</span>
            </nav>

            <div className="depot-header-content">
              <div>
                <h1 className="depot-header-title">
                  {isEnglish ? 'Institutional ' : 'Dépôt '}<span className="depot-header-highlight">{isEnglish ? 'submission' : 'institutionnel'}</span>
                </h1>
                <p className="depot-header-desc">
                  {isEnglish ? 'Submit and track your dissertations and theses online' : 'Soumettez et suivez vos mémoires & thèses en ligne'}
                </p>
              </div>
              <button
                onClick={() => navigate('/mon-compte')}
                className="depot-header-back"
              >
                <ArrowLeft size={14} /> {isEnglish ? 'My account' : 'Mon compte'}
              </button>
            </div>
          </div>
        </header>

        <main className="container depot-main">
          {/* ═══ MESSAGE D'INDISPONIBILITÉ ═══════════════════════ */}
          {!isDepotEnabled && (
            <div className="depot-empty-state" style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(124,58,237,0.06))',
              border: '1px solid rgba(245,158,11,0.2)',
              marginBottom: 24
            }}>
              <div className="depot-empty-icon" style={{ fontSize: 42 }}>⚠️</div>
              <h3 className="depot-empty-title">Dépôt temporairement indisponible</h3>
              <p className="depot-empty-desc">
                Cette fonctionnalité est actuellement en cours de développement. Le dépôt de mémoire et de thèse en ligne ne sera pas encore disponible tant que le rectorat n'aura pas validé la mise en ligne.
              </p>
              <div className="depot-empty-actions">
                <a
                  href={PMB_OPAC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-bleu"
                >
                  Accéder à l'OPAC PMB
                </a>
                <button
                  onClick={() => navigate('/archives')}
                  className="btn btn-ghost"
                >
                  Voir les archives
                </button>
              </div>
            </div>
          )}

          {/* Statistiques rapides */}
          {stats && (
            <div className="depot-stats-grid">
              <StatsCard
                label="Total des dépôts"
                value={stats.total}
                icon={<FileText size={18} />}
                color="var(--bleu-nuit)"
                bg="rgba(27,20,100,0.06)"
              />
              <StatsCard
                label="En vérification"
                value={stats.en_attente_verification}
                icon={<Clock size={18} />}
                color="#8b5cf6"
                bg="rgba(139,92,246,0.1)"
              />
              <StatsCard
                label="Quitus disponible"
                value={stats.quitus_disponible}
                icon={<CheckCircle size={18} />}
                color="#10B981"
                bg="rgba(16,185,129,0.1)"
              />
              <StatsCard
                label="Terminés"
                value={stats.quitus_retire}
                icon={<Award size={18} />}
                color="#059669"
                bg="rgba(5,150,105,0.1)"
              />
              {stats.rejete > 0 && (
                <StatsCard
                  label="Rejetés"
                  value={stats.rejete}
                  icon={<XCircle size={18} />}
                  color="#ef4444"
                  bg="rgba(239,68,68,0.1)"
                />
              )}
            </div>
          )}

          {/* En-tête de la liste */}
          <div className="depot-list-header">
            <h2 className="depot-list-title">
              Mes dossiers <span className="depot-list-count">({dossiers.length})</span>
            </h2>
            <div className="depot-list-actions">
              <Link
                to="/archives"
                className="depot-list-btn-archives"
              >
                <Archive size={14} /> Répertoire des thèses & mémoires
              </Link>

              {/* 🔒 Bouton Nouveau dépôt — conditionnel */}
              {isDepotEnabled ? (
                <button
                  onClick={handleNewDepotClick}
                  className="depot-list-btn-new"
                >
                  <Plus size={14} /> Nouveau dépôt
                </button>
              ) : (
                <button
                  onClick={() => setShowDisabledModal(true)}
                  className="depot-list-btn-new"
                  style={{
                    background: '#94a3b8',
                    cursor: 'not-allowed',
                    opacity: 0.7,
                  }}
                  title="Fonctionnalité en cours de validation par le Rectorat"
                >
                  <ShieldAlert size={14} /> Dépôt indisponible
                </button>
              )}
            </div>
          </div>

          {/* Liste des dossiers */}
          {loadingData ? (
            <div className="depot-skeleton-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />
              ))}
            </div>
          ) : dossiers.length === 0 ? (
            <div className="depot-empty-state">
              <div className="depot-empty-icon">📄</div>
              <h3 className="depot-empty-title">Aucun dépôt effectué</h3>
              <p className="depot-empty-desc">
                Vous n'avez pas encore déposé de mémoire ou thèse.
                {isDepotEnabled
                  ? ' Commencez votre dépôt dès maintenant.'
                  : ' Le dépôt sera disponible prochainement.'}
              </p>
              <div className="depot-empty-actions">
                {isDepotEnabled ? (
                  <button
                    onClick={handleNewDepotClick}
                    className="btn btn-bleu"
                  >
                    <Plus size={16} /> Commencer un dépôt
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDisabledModal(true)}
                    className="btn btn-bleu"
                    style={{ opacity: 0.8 }}
                  >
                    <ShieldAlert size={16} /> Dépôt indisponible
                  </button>
                )}
                <Link to="/archives" className="btn btn-ghost">
                  <Archive size={16} /> Voir les archives
                </Link>
              </div>
            </div>
          ) : (
            <div className="depot-list">
              {dossiers.map(d => {
                const s = STATUS_LABEL[d.status] || STATUS_LABEL.brouillon;
                const isRejected = d.status === 'rejete';
                const isCompleted = d.status === 'quitus_retire';
                const canEdit = ['brouillon', 'depot_en_ligne', 'rejete'].includes(d.status) && isDepotEnabled;
                const canDownloadQuitus = ['quitus_disponible', 'quitus_retire'].includes(d.status);
                const isArchived = d.is_archived || false;

                return (
                  <div
                    key={d.id}
                    className={`depot-item ${isRejected ? 'rejected' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="depot-item-header">
                      <div className="depot-item-info">
                        <div className="depot-item-badges">
                          <span className={`badge ${s.badge}`}>
                            {s.icon} {s.label}
                          </span>
                          {d.physical_deposit_confirmed && (
                            <span className="badge badge-green">📦 Dépôt physique confirmé</span>
                          )}
                          {d.documents_conform && (
                            <span className="badge badge-green">✅ Documents conformes</span>
                          )}
                          {isArchived && (
                            <span className="badge badge-purple">📁 Archivé</span>
                          )}
                        </div>
                        <h3 className="depot-item-title">{d.title}</h3>
                        <div className="depot-item-meta">
                          <span>{d.filiere}</span>
                          <span>•</span>
                          <span>N° dossier: {d.id?.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {d.rejection_reason && (
                          <div className="depot-item-rejection">
                            <XCircle size={14} /> Motif : {d.rejection_reason}
                          </div>
                        )}
                      </div>
                      <div className="depot-item-actions">
                        {canEdit && (
                          <button
                            onClick={() => handleEditClick(d)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Edit2 size={13} /> Modifier
                          </button>
                        )}
                        <Link
                          to={`/depot/${d.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye size={13} /> Détail
                        </Link>
                        {canDownloadQuitus && (
                          <button
                            onClick={() => handleDownloadQuitus(d.id)}
                            className="btn btn-primary btn-sm"
                            style={{ background: 'var(--or)', color: 'white' }}
                          >
                            <Download size={13} /> Quitus
                          </button>
                        )}
                        {isArchived && (
                          <Link
                            to="/archives"
                            className="btn btn-purple btn-sm"
                            style={{ background: '#8b5cf6', color: 'white' }}
                          >
                            <Archive size={13} /> Archives
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Stepper de suivi */}
                    <DepotSteps status={d.status} />
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* 🔒 Modal de blocage */}
        <DepotDisabledModal
          isOpen={showDisabledModal}
          onClose={() => setShowDisabledModal(false)}
        />

        {/* ═══ STYLES ════════════════════════════════════════════════ */}
        <style>{`
          /* ─── HEADER ─── */
          .depot-header {
            background: linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%);
            padding: 40px 0 32px;
            position: relative;
            overflow: hidden;
          }

          .depot-header::before {
            content: '';
            position: absolute;
            top: -80px;
            right: -80px;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: rgba(124,58,237,0.06);
          }

          .depot-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          .depot-breadcrumb-link {
            color: rgba(255,255,255,0.6);
            transition: color 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
            text-decoration: none;
          }

          .depot-breadcrumb-link:hover {
            color: white;
          }

          .depot-breadcrumb-sep {
            color: rgba(255,255,255,0.3);
          }

          .depot-breadcrumb-current {
            color: var(--or);
            font-weight: 500;
          }

          .depot-header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }

          .depot-header-title {
            font-size: clamp(28px, 5vw, 40px);
            color: white;
            font-weight: 400;
            font-family: var(--font-serif);
            margin-bottom: 4px;
          }

          .depot-header-highlight {
            color: var(--or);
          }

          .depot-header-desc {
            color: rgba(255,255,255,0.65);
            font-size: clamp(14px, 1.2vw, 16px);
          }

          .depot-header-back {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255,255,255,0.6);
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 8px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          }

          .depot-header-back:hover {
            background: rgba(255,255,255,0.15);
            color: white;
          }

          /* ─── MAIN ─── */
          .depot-main {
            padding: 32px 24px;
          }

          /* ─── STATS ─── */
          .depot-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-bottom: 28px;
          }

          .stats-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 18px;
            background: white;
            border-radius: 12px;
            border: 1px solid var(--border);
            border-top: 3px solid var(--bleu-nuit);
            transition: all 0.3s ease;
          }

          .stats-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          }

          .stats-card-content {
            flex: 1;
          }

          .stats-card-value {
            font-size: 24px;
            font-weight: 800;
            line-height: 1.2;
          }

          .stats-card-label {
            font-size: 11px;
            color: var(--texte-muted);
            margin-top: 2px;
          }

          .stats-card-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* ─── LIST HEADER ─── */
          .depot-list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .depot-list-title {
            font-size: 20px;
            font-weight: 700;
          }

          .depot-list-count {
            color: var(--texte-muted);
            font-weight: 400;
          }

          .depot-list-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .depot-list-btn-archives {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid var(--or);
            color: var(--or);
            font-size: 13px;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            transition: all 0.25s ease;
            text-decoration: none;
          }

          .depot-list-btn-archives:hover {
            background: var(--or);
            color: white;
          }

          .depot-list-btn-new {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: 8px;
            background: var(--bleu-nuit);
            color: white;
            font-size: 13px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.25s ease;
            font-family: inherit;
          }

          .depot-list-btn-new:hover {
            background: var(--bleu-nuit-light);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(27,20,100,0.15);
          }

          /* ─── EMPTY STATE ─── */
          .depot-empty-state {
            text-align: center;
            padding: 60px 24px;
            background: white;
            border-radius: 16px;
            border: 1px solid var(--border);
          }

          .depot-empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .depot-empty-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .depot-empty-desc {
            color: var(--texte-muted);
            max-width: 400px;
            margin: 0 auto 16px;
          }

          .depot-empty-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          /* ─── LIST ITEM ─── */
          .depot-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .depot-item {
            background: white;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px 24px;
            transition: all 0.3s ease;
          }

          .depot-item:hover {
            box-shadow: var(--shadow-sm);
          }

          .depot-item.rejected {
            border-color: rgba(239,68,68,0.3);
          }

          .depot-item.completed {
            border-color: rgba(16,185,129,0.3);
          }

          .depot-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 12px;
          }

          .depot-item-info {
            flex: 1;
            min-width: 0;
          }

          .depot-item-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 8px;
          }

          .depot-item-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--bleu-nuit);
            line-height: 1.4;
          }

          .depot-item-meta {
            font-size: 13px;
            color: var(--texte-muted);
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .depot-item-rejection {
            margin-top: 8px;
            padding: 6px 12px;
            background: var(--red-bg);
            border-radius: 6px;
            font-size: 12px;
            color: #b91c1c;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .depot-item-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            flex-shrink: 0;
          }

          .depot-item-actions .btn {
            font-size: 12px;
            padding: 6px 14px;
          }

          .btn-purple {
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .btn-purple:hover {
            background: #7c3aed;
            transform: translateY(-1px);
          }

          /* ─── SKELETON ─── */
          .depot-skeleton-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          /* ─── DEPOT STEPS ─── */
          .depot-steps {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 0;
            flex-wrap: wrap;
          }

          .depot-step {
            display: flex;
            align-items: center;
          }

          .depot-step-content {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px 4px 8px;
            border-radius: 50px;
            font-size: 10px;
            border: 1px solid var(--border);
            transition: all 0.3s;
          }

          .depot-step-content.active {
            background: rgba(16,185,129,0.08);
            border-color: var(--green);
          }

          .depot-step-content.inactive {
            opacity: 0.4;
            background: var(--beige);
          }

          .depot-step-icon {
            font-size: 12px;
          }

          .depot-step-label {
            font-weight: 500;
          }

          .depot-step-label.current {
            font-weight: 700;
            color: var(--green);
          }

          .depot-step-badge {
            font-size: 7px;
            background: var(--green);
            color: white;
            padding: 1px 6px;
            border-radius: 50px;
          }

          .depot-step-line {
            width: 16px;
            height: 2px;
            border-radius: 1px;
            margin: 0 2px;
            transition: all 0.3s;
          }

          .depot-step-line.active {
            background: var(--green);
          }

          .depot-step-line.inactive {
            background: var(--border);
          }

          .depot-steps-rejected {
            padding: 8px 12px;
            background: rgba(239,68,68,0.06);
            border-radius: var(--radius-sm);
            border: 1px solid rgba(239,68,68,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .depot-steps-rejected-text {
            font-weight: 600;
            color: #b91c1c;
          }

          /* ─── RESPONSIVE ─── */
          @media (max-width: 768px) {
            .depot-header {
              padding: 28px 0 20px;
            }

            .depot-header-content {
              flex-direction: column;
              align-items: flex-start;
            }

            .depot-main {
              padding: 20px 16px;
            }

            .depot-stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .depot-list-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .depot-list-actions {
              width: 100%;
            }

            .depot-list-btn-archives,
            .depot-list-btn-new {
              flex: 1;
              justify-content: center;
            }

            .depot-item {
              padding: 16px;
            }

            .depot-item-header {
              flex-direction: column;
            }

            .depot-item-actions {
              width: 100%;
              justify-content: flex-start;
            }

            .depot-steps {
              gap: 2px;
            }

            .depot-step-content {
              padding: 3px 8px 3px 6px;
              font-size: 9px;
            }

            .depot-step-line {
              width: 10px;
            }
          }

          @media (max-width: 480px) {
            .depot-stats-grid {
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }

            .stats-card {
              padding: 12px 14px;
            }

            .stats-card-value {
              font-size: 20px;
            }

            .depot-item {
              padding: 14px;
            }

            .depot-item-title {
              font-size: 14px;
            }

            .depot-item-actions .btn-sm {
              font-size: 11px;
              padding: 4px 10px;
            }

            .depot-empty-state {
              padding: 40px 16px;
            }

            .depot-empty-icon {
              font-size: 48px;
            }
          }
        `}</style>
      </Layout>
    );
  }

  // Rendu du formulaire — BLOQUÉ si non activé
  if (view === 'form') {
    if (!isDepotEnabled) {
      return (
        <Layout>
          <DepotDisabledModal
            isOpen={true}
            onClose={() => setView('list')}
          />
        </Layout>
      );
    }
    return (
      <Layout>
        <div className="container" style={{ padding: '32px 16px' }}>
          <DepotForm 
            onSuccess={handleSuccess} 
            onCancel={handleCancel}
            initialData={editingMemoire}
          />
        </div>
      </Layout>
    );
  }

  // Rendu du détail (si view === 'detail')
  if (view === 'detail' && selected) {
    const s = STATUS_LABEL[selected.status] || STATUS_LABEL.brouillon;
    const isRejected = selected.status === 'rejete';
    const canDownloadQuitus = ['quitus_disponible', 'quitus_retire'].includes(selected.status);
    const isArchived = selected.is_archived || false;

    return (
      <Layout>
        <div className="container" style={{ padding: '32px 16px' }}>
          <div className="depot-detail">
            <button
              onClick={() => setView('list')}
              className="depot-detail-back"
            >
              <ArrowLeft size={14} /> Retour à la liste
            </button>

            <div className="depot-detail-card">
              <div className="depot-detail-header">
                <div>
                  <div className="depot-detail-badges">
                    <span className={`badge ${s.badge}`} style={{ fontSize: 14, padding: '6px 14px' }}>
                      {s.icon} {s.label}
                    </span>
                    {selected.type_document && (
                      <span className="badge badge-blue">
                        {selected.type_document === 'MEMOIRE' ? '📚 Mémoire' : '🎓 Thèse'}
                      </span>
                    )}
                    {isArchived && (
                      <span className="badge badge-purple">📁 Archivé</span>
                    )}
                  </div>
                  <h2 className="depot-detail-title">{selected.title}</h2>
                </div>
                <div className="depot-detail-actions">
                  {canDownloadQuitus && (
                    <button
                      onClick={() => handleDownloadQuitus(selected.id)}
                      className="btn btn-primary"
                      style={{ background: 'var(--or)', color: 'white' }}
                    >
                      <Download size={16} /> Télécharger le Quitus
                    </button>
                  )}
                  {isArchived && (
                    <Link
                      to="/archives"
                      className="btn btn-purple"
                      style={{ background: '#8b5cf6', color: 'white' }}
                    >
                      <Archive size={16} /> Voir dans les archives
                    </Link>
                  )}
                </div>
              </div>

              <div className="depot-detail-grid">
                <div>
                  <p className="depot-detail-label"><strong>Matricule :</strong> {selected.matricule || selected.author_name}</p>
                  <p className="depot-detail-label"><strong>Filière :</strong> {selected.filiere}</p>
                  <p className="depot-detail-label"><strong>Unité de recherche :</strong> {selected.unite_recherche || 'Non spécifié'}</p>
                  <p className="depot-detail-label"><strong>Laboratoire :</strong> {selected.laboratoire || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="depot-detail-label"><strong>Déposé le :</strong> {new Date(selected.created_at).toLocaleDateString('fr-FR')}</p>
                  {selected.submitted_at && (
                    <p className="depot-detail-label"><strong>Soumis le :</strong> {new Date(selected.submitted_at).toLocaleDateString('fr-FR')}</p>
                  )}
                  {selected.physical_verified_at && (
                    <p className="depot-detail-label"><strong>Vérifié le :</strong> {new Date(selected.physical_verified_at).toLocaleDateString('fr-FR')}</p>
                  )}
                  {selected.quitus_available_at && (
                    <p className="depot-detail-label"><strong>Quitus disponible le :</strong> {new Date(selected.quitus_available_at).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>

              {selected.abstract && (
                <div style={{ marginBottom: 24 }}>
                  <h3 className="depot-detail-section-title">Résumé</h3>
                  <p className="depot-detail-abstract">{selected.abstract}</p>
                </div>
              )}

              {selected.keywords && (
                <div style={{ marginBottom: 24 }}>
                  <h3 className="depot-detail-section-title">Mots-clés</h3>
                  <div className="depot-detail-keywords">
                    {selected.keywords.split(',').map((kw, i) => (
                      <span key={i} className="badge badge-blue">{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 className="depot-detail-section-title">Suivi du dossier</h3>
                <DepotSteps status={selected.status} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 className="depot-detail-section-title">Documents</h3>
                <div className="depot-detail-documents">
                  {selected.pdf_file && (
                    <div className="depot-detail-doc">
                      <FileText size={16} color="#3b82f6" />
                      <span>PDF</span>
                      <CheckCircle size={14} color="var(--green)" />
                    </div>
                  )}
                  {selected.word_file && (
                    <div className="depot-detail-doc">
                      <FileText size={16} color="#8b5cf6" />
                      <span>Word</span>
                      <CheckCircle size={14} color="var(--green)" />
                    </div>
                  )}
                  {selected.scanned_document && (
                    <div className="depot-detail-doc">
                      <FileCheck size={16} color="#10B981" />
                      <span>Document scanné</span>
                      <CheckCircle size={14} color="var(--green)" />
                    </div>
                  )}
                </div>
              </div>

              {isRejected && selected.rejection_reason && (
                <div className="depot-detail-rejection">
                  <strong style={{ color: '#b91c1c' }}>Motif du rejet :</strong>
                  <span style={{ color: '#991b1b', marginLeft: 8 }}>{selected.rejection_reason}</span>
                </div>
              )}

              <div className="depot-detail-footer">
                <button onClick={() => setView('list')} className="btn btn-ghost">
                  <ArrowLeft size={14} /> Retour à la liste
                </button>
                <button onClick={() => navigate('/mon-compte')} className="btn btn-bleu">
                  <User size={14} /> Mon compte
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .depot-detail {
            max-width: 900px;
            margin: 0 auto;
            padding: 32px 0;
          }

          .depot-detail-back {
            color: var(--texte-muted);
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 24px;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.2s;
            font-family: inherit;
          }

          .depot-detail-back:hover {
            color: var(--bleu-nuit);
          }

          .depot-detail-card {
            background: white;
            border-radius: var(--radius);
            padding: 32px;
            border: 1px solid var(--border);
          }

          .depot-detail-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
          }

          .depot-detail-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .depot-detail-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .depot-detail-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--bleu-nuit);
          }

          .depot-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }

          .depot-detail-label {
            font-size: 14px;
            color: var(--texte-muted);
          }

          .depot-detail-section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
          }

          .depot-detail-abstract {
            font-size: 14px;
            line-height: 1.8;
            color: var(--texte-muted);
            white-space: pre-line;
          }

          .depot-detail-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .depot-detail-documents {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .depot-detail-doc {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: var(--beige);
            border-radius: var(--radius-xs);
          }

          .depot-detail-rejection {
            padding: 12px 16px;
            background: var(--red-bg);
            border-radius: var(--radius-sm);
            border: 1px solid rgba(239,68,68,0.15);
            margin-bottom: 24px;
          }

          .depot-detail-footer {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          @media (max-width: 768px) {
            .depot-detail-card {
              padding: 20px;
            }

            .depot-detail-grid {
              grid-template-columns: 1fr;
            }

            .depot-detail-header {
              flex-direction: column;
            }

            .depot-detail-actions {
              width: 100%;
            }

            .depot-detail-actions .btn {
              flex: 1;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .depot-detail {
              padding: 16px 0;
            }

            .depot-detail-card {
              padding: 16px;
            }

            .depot-detail-title {
              font-size: 20px;
            }
          }
        `}</style>
      </Layout>
    );
  }

  return null;
}
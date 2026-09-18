// pages/DepotDetailPage.jsx - PAGE DE DÉTAIL D'UN DÉPÔT

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle, Clock, AlertCircle,
  XCircle, Download, Eye, User, Calendar, Building2,
  Users, FileCheck, Archive, Award, BookOpen, GraduationCap,
  Home, ChevronRight, RefreshCw, Printer
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getMemoireDetail, downloadQuitus } from '../services/endpoints';

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

function DepotSteps({ status, isEnglish }) {
  const steps = isEnglish ? [
    { key: 'depot_en_ligne', label: 'Online submission', icon: '📤' },
    { key: 'convocation_envoyee', label: 'Invitation', icon: '📧' },
    { key: 'en_attente_verification', label: 'Verification', icon: '🔍' },
    { key: 'verification_ok', label: 'Validated', icon: '✅' },
    { key: 'quitus_disponible', label: 'Quitus', icon: '📄' },
    { key: 'quitus_retire', label: 'Completed', icon: '📋' },
  ] : [
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
        <span className="depot-steps-rejected-text">{isEnglish ? 'Submission rejected' : 'Dépôt rejeté'}</span>
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
                <span className="depot-step-badge">{isEnglish ? 'In progress' : 'En cours'}</span>
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

export default function DepotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [depot, setDepot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadDepot = async () => {
      if (!id) {
        setError(isEnglish ? 'Submission ID missing' : 'ID de dépôt manquant');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getMemoireDetail(id);
        const data = response.data?.dossier || response.data;
        
        if (data) {
          setDepot(data);
        } else {
          setError(isEnglish ? 'Submission not found' : 'Dépôt non trouvé');
        }
      } catch (err) {
        console.error('Erreur chargement dépôt:', err);
        if (err.response?.status === 404) {
          setError(isEnglish ? 'Submission not found' : 'Dépôt non trouvé');
        } else {
          setError(isEnglish ? 'Error loading this submission' : 'Erreur lors du chargement du dépôt');
        }
        addToast(isEnglish ? 'Error loading this submission' : 'Erreur lors du chargement du dépôt', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDepot();
  }, [id, addToast]);

  const handleDownloadQuitus = async () => {
    try {
      const res = await downloadQuitus(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quitus_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(isEnglish ? 'Quitus download started.' : 'Téléchargement du quitus démarré.', 'success');
    } catch (error) {
      addToast(isEnglish ? 'Quitus unavailable or not yet signed.' : 'Quitus non disponible ou non encore signé.', 'error');
    }
  };

  const handleBack = () => {
    navigate('/mon-compte?tab=depot');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '60px 0' }}>
            <div className="skeleton" style={{ 
              width: isMobile ? 48 : 60, 
              height: isMobile ? 48 : 60, 
              borderRadius: '50%', 
              margin: '0 auto 16px' 
            }} />
            <div className="skeleton" style={{ 
              height: isMobile ? 24 : 30, 
              width: '50%', 
              margin: '0 auto 10px' 
            }} />
            <div className="skeleton" style={{ 
              height: isMobile ? 16 : 20, 
              width: '70%', 
              margin: '0 auto' 
            }} />
            <style>{`
              .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 6px;
              }
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !depot) {
    return (
      <Layout>
        <div className="container" style={{ padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 16px' : '60px 0',
            background: 'white',
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: isMobile ? 40 : 48, marginBottom: 16 }}>📄</div>
            <h2 style={{ 
              fontSize: isMobile ? 18 : 22, 
              fontWeight: 700, 
              marginBottom: 8 
            }}>
              {error || (isEnglish ? 'Submission not found' : 'Dépôt introuvable')}
            </h2>
            <p style={{ color: 'var(--texte-muted)', marginBottom: 24, fontSize: isMobile ? 13 : 15 }}>
              {isEnglish ? 'The submission you are looking for does not exist or you do not have access rights.' : 'Le dépôt que vous recherchez n\'existe pas ou vous n\'avez pas les droits d\'accès.'}
            </p>
            <button 
              onClick={handleBack}
              className="btn btn-bleu"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8,
                padding: isMobile ? '10px 18px' : '12px 24px',
                fontSize: isMobile ? 13 : 14
              }}
            >
              <ArrowLeft size={isMobile ? 14 : 16} /> {isEnglish ? 'Back to my submissions' : 'Retour à mes dépôts'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const s = STATUS_LABEL[depot.status] || STATUS_LABEL.brouillon;
  const isRejected = depot.status === 'rejete';
  const canDownloadQuitus = ['quitus_disponible', 'quitus_retire'].includes(depot.status);
  const isArchived = depot.is_archived || false;

  return (
    <Layout>
      <div className="container" style={{ padding: isMobile ? '16px 12px' : '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Bouton retour */}
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--texte-muted)',
              fontSize: isMobile ? 12 : 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: isMobile ? '6px 0' : '8px 0',
              marginBottom: isMobile ? 12 : 20,
              transition: 'color 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--bleu-nuit)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--texte-muted)'}
          >
            <ArrowLeft size={isMobile ? 16 : 18} /> Retour à mes dépôts
          </button>

          {/* Carte du dépôt */}
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {/* En-tête */}
            <div style={{
              padding: isMobile ? '16px 16px' : '24px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="depot-detail-badges">
                  <span className={`badge ${s.badge}`} style={{ fontSize: isMobile ? 12 : 14, padding: '4px 12px' }}>
                    {s.icon} {s.label}
                  </span>
                  {depot.type_document && (
                    <span className="badge badge-blue" style={{ fontSize: isMobile ? 11 : 13 }}>
                      {depot.type_document === 'MEMOIRE' ? '📚 Mémoire' : '🎓 Thèse'}
                    </span>
                  )}
                  {depot.physical_deposit_confirmed && (
                    <span className="badge badge-green" style={{ fontSize: isMobile ? 11 : 13 }}>📦 Dépôt physique confirmé</span>
                  )}
                  {depot.documents_conform && (
                    <span className="badge badge-green" style={{ fontSize: isMobile ? 11 : 13 }}>✅ Documents conformes</span>
                  )}
                  {isArchived && (
                    <span className="badge badge-purple" style={{ fontSize: isMobile ? 11 : 13 }}>📁 Archivé</span>
                  )}
                </div>
                <h1 style={{ 
                  fontSize: isMobile ? 20 : 28, 
                  fontWeight: 700, 
                  margin: '8px 0 4px',
                  color: 'var(--bleu-nuit)',
                  wordBreak: 'break-word'
                }}>
                  {depot.title}
                </h1>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: isMobile ? 4 : 8,
                  fontSize: isMobile ? 12 : 14,
                  color: 'var(--texte-muted)'
                }}>
                  <span><strong>Matricule:</strong> {depot.matricule || depot.author_name}</span>
                  <span>•</span>
                  <span><strong>Filière:</strong> {depot.filiere}</span>
                  <span>•</span>
                  <span><strong>Déposé le:</strong> {new Date(depot.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {canDownloadQuitus && (
                  <button
                    onClick={handleDownloadQuitus}
                    className="btn btn-primary"
                    style={{ 
                      background: 'var(--or)', 
                      color: 'white',
                      padding: isMobile ? '8px 14px' : '10px 18px',
                      fontSize: isMobile ? 12 : 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={isMobile ? 14 : 16} /> Quitus
                  </button>
                )}
                {isArchived && (
                  <Link
                    to="/archives"
                    className="btn btn-purple"
                    style={{ 
                      background: '#8b5cf6', 
                      color: 'white',
                      padding: isMobile ? '8px 14px' : '10px 18px',
                      fontSize: isMobile ? 12 : 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      textDecoration: 'none'
                    }}
                  >
                    <Archive size={isMobile ? 14 : 16} /> Archives
                  </Link>
                )}
              </div>
            </div>

            {/* Corps */}
            <div style={{ padding: isMobile ? '16px' : '28px' }}>
              {/* Grille d'informations */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 12 : 16,
                marginBottom: 24
              }}>
                <div>
                  <p className="depot-detail-label"><strong>Unité de recherche :</strong> {depot.unite_recherche || 'Non spécifié'}</p>
                  <p className="depot-detail-label"><strong>Laboratoire :</strong> {depot.laboratoire || 'Non spécifié'}</p>
                  {depot.submitted_at && (
                    <p className="depot-detail-label"><strong>Soumis le :</strong> {new Date(depot.submitted_at).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
                <div>
                  {depot.physical_verified_at && (
                    <p className="depot-detail-label"><strong>Vérifié le :</strong> {new Date(depot.physical_verified_at).toLocaleDateString('fr-FR')}</p>
                  )}
                  {depot.quitus_available_at && (
                    <p className="depot-detail-label"><strong>Quitus disponible le :</strong> {new Date(depot.quitus_available_at).toLocaleDateString('fr-FR')}</p>
                  )}
                  {isArchived && depot.archived_at && (
                    <p className="depot-detail-label" style={{ color: '#8b5cf6' }}>
                      <strong>Archivé le :</strong> {new Date(depot.archived_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>

              {/* Résumé */}
              {depot.abstract && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ 
                    fontSize: isMobile ? 15 : 17, 
                    fontWeight: 700, 
                    marginBottom: 8,
                    color: 'var(--bleu-nuit)'
                  }}>
                    Résumé
                  </h3>
                  <p style={{
                    fontSize: isMobile ? 13 : 14,
                    lineHeight: 1.8,
                    color: 'var(--texte-muted)',
                    whiteSpace: 'pre-line'
                  }}>
                    {depot.abstract}
                  </p>
                </div>
              )}

              {/* Mots-clés */}
              {depot.keywords && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ 
                    fontSize: isMobile ? 15 : 17, 
                    fontWeight: 700, 
                    marginBottom: 8,
                    color: 'var(--bleu-nuit)'
                  }}>
                    Mots-clés
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {depot.keywords.split(',').map((kw, i) => (
                      <span key={i} className="badge badge-blue" style={{ fontSize: isMobile ? 11 : 12 }}>
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Jury */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  fontSize: isMobile ? 15 : 17, 
                  fontWeight: 700, 
                  marginBottom: 8,
                  color: 'var(--bleu-nuit)'
                }}>
                  <Users size={isMobile ? 16 : 18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Membres du jury
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                  gap: 8
                }}>
                  <div className="depot-detail-jury-item">
                    <div className="label">Président</div>
                    <div className="value">{depot.president_jury}</div>
                  </div>
                  <div className="depot-detail-jury-item">
                    <div className="label">Examinateur 1</div>
                    <div className="value">{depot.examinateur_1}</div>
                  </div>
                  {depot.examinateur_2 && (
                    <div className="depot-detail-jury-item">
                      <div className="label">Examinateur 2</div>
                      <div className="value">{depot.examinateur_2}</div>
                    </div>
                  )}
                  {depot.examinateur_3 && (
                    <div className="depot-detail-jury-item">
                      <div className="label">Examinateur 3</div>
                      <div className="value">{depot.examinateur_3}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suivi */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  fontSize: isMobile ? 15 : 17, 
                  fontWeight: 700, 
                  marginBottom: 8,
                  color: 'var(--bleu-nuit)'
                }}>
                  Suivi du dossier
                </h3>
                <DepotSteps status={depot.status} />
              </div>

              {/* Documents */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  fontSize: isMobile ? 15 : 17, 
                  fontWeight: 700, 
                  marginBottom: 8,
                  color: 'var(--bleu-nuit)'
                }}>
                  Documents
                </h3>
                <div style={{ display: 'flex', gap: isMobile ? 8 : 16, flexWrap: 'wrap' }}>
                  {depot.pdf_file && (
                    <div className="depot-detail-doc">
                      <FileText size={isMobile ? 14 : 16} color="#3b82f6" />
                      <span style={{ fontSize: isMobile ? 12 : 13 }}>PDF</span>
                      <CheckCircle size={isMobile ? 12 : 14} color="var(--green)" />
                    </div>
                  )}
                  {depot.word_file && (
                    <div className="depot-detail-doc">
                      <FileText size={isMobile ? 14 : 16} color="#8b5cf6" />
                      <span style={{ fontSize: isMobile ? 12 : 13 }}>Word</span>
                      <CheckCircle size={isMobile ? 12 : 14} color="var(--green)" />
                    </div>
                  )}
                  {depot.scanned_document && (
                    <div className="depot-detail-doc">
                      <FileCheck size={isMobile ? 14 : 16} color="#10B981" />
                      <span style={{ fontSize: isMobile ? 12 : 13 }}>Document scanné</span>
                      <CheckCircle size={isMobile ? 12 : 14} color="var(--green)" />
                    </div>
                  )}
                  {isArchived && (
                    <div className="depot-detail-doc" style={{ background: 'rgba(139,92,246,0.08)' }}>
                      <Archive size={isMobile ? 14 : 16} color="#8b5cf6" />
                      <span style={{ fontSize: isMobile ? 12 : 13 }}>Archivé</span>
                      <CheckCircle size={isMobile ? 12 : 14} color="#8b5cf6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rejet */}
              {isRejected && depot.rejection_reason && (
                <div className="depot-detail-rejection">
                  <strong style={{ color: '#b91c1c' }}>Motif du rejet :</strong>
                  <span style={{ color: '#991b1b', marginLeft: 8 }}>{depot.rejection_reason}</span>
                </div>
              )}

              {/* Footer */}
              <div className="depot-detail-footer">
                <button onClick={handleBack} className="btn btn-ghost">
                  <ArrowLeft size={isMobile ? 14 : 16} /> Retour
                </button>
                <button onClick={() => navigate('/mon-compte')} className="btn btn-bleu">
                  <User size={isMobile ? 14 : 16} /> Mon compte
                </button>
                <Link to="/archives" className="btn btn-purple" style={{ background: '#8b5cf6', color: 'white', textDecoration: 'none' }}>
                  <Archive size={isMobile ? 14 : 16} /> Voir les archives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .depot-detail-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .depot-detail-label {
          font-size: ${isMobile ? '13px' : '14px'};
          color: var(--texte-muted);
          margin: 4px 0;
        }

        .depot-detail-jury-item {
          padding: 8px 12px;
          background: var(--beige);
          border-radius: var(--radius-xs);
        }
        .depot-detail-jury-item .label {
          font-size: 11px;
          color: var(--texte-muted);
        }
        .depot-detail-jury-item .value {
          font-weight: 600;
          font-size: 13px;
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
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .depot-detail-footer .btn {
          flex: isMobile ? '1' : 'none';
          justify-content: center;
          padding: ${isMobile ? '10px 16px' : '12px 24px'};
          font-size: ${isMobile ? '13px' : '14px'};
        }

        /* Stepper styles */
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
        .depot-step-icon { font-size: 12px; }
        .depot-step-label { font-weight: 500; }
        .depot-step-label.current { font-weight: 700; color: var(--green); }
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
        .depot-step-line.active { background: var(--green); }
        .depot-step-line.inactive { background: var(--border); }
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

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          font-family: inherit;
        }
        .btn-bleu {
          background: var(--bleu-nuit);
          color: white;
        }
        .btn-bleu:hover {
          background: var(--bleu-nuit-light);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(27,20,100,0.15);
        }
        .btn-ghost {
          background: transparent;
          color: var(--texte);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover {
          border-color: var(--or);
          color: var(--or);
        }
        .btn-purple {
          background: #8b5cf6;
          color: white;
          border: none;
        }
        .btn-purple:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        .btn-primary {
          background: var(--or);
          color: white;
          border: none;
        }
        .btn-primary:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
}
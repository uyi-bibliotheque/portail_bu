// pages/admin/AdminMemoires.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, AlertCircle, XCircle,
  Eye, Download, Search, Filter, ChevronDown,
  User, Calendar, ArrowLeft, RefreshCw, Printer,
  CheckSquare, X, Info, FileCheck, TrendingUp,
  BarChart2, PieChart, Users, Award, Send, Package,
  FileSignature, Scan, Upload, CloudDownload
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  listMemoires,
  updateMemoireStatus,
  downloadQuitus,
  getMemoireStats,
  getMemoireDetail
} from '../../services/endpoints';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', badge: 'badge-slate', icon: '📝', color: '#94a3b8' },
  depot_en_ligne: { label: 'Déposé en ligne', badge: 'badge-blue', icon: '📤', color: '#3b82f6' },
  convocation_envoyee: { label: 'Convocation envoyée', badge: 'badge-amber', icon: '📧', color: '#F59E0B' },
  relance_envoyee: { label: 'Relance envoyée', badge: 'badge-orange', icon: '⏰', color: '#f97316' },
  en_attente_verification: { label: 'En vérification', badge: 'badge-purple', icon: '🔍', color: '#8b5cf6' },
  verification_ok: { label: 'Vérifié', badge: 'badge-green', icon: '✅', color: '#10B981' },
  rejete: { label: 'Rejeté', badge: 'badge-red', icon: '❌', color: '#ef4444' },
  en_attente_quitus: { label: 'Quitus en attente', badge: 'badge-blue', icon: '⏳', color: '#10B981' },
  quitus_disponible: { label: 'Quitus disponible', badge: 'badge-green', icon: '📄', color: '#10B981' },
  quitus_retire: { label: 'Quitus retiré', badge: 'badge-green', icon: '📋', color: '#10B981' },
  abandonne: { label: 'Abandonné', badge: 'badge-slate', icon: '🚫', color: '#94a3b8' },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'depot_en_ligne', label: 'Déposés en ligne' },
  { value: 'convocation_envoyee', label: 'Convocation envoyée' },
  { value: 'en_attente_verification', label: 'En vérification' },
  { value: 'verification_ok', label: 'Vérifiés' },
  { value: 'quitus_disponible', label: 'Quitus disponibles' },
  { value: 'quitus_retire', label: 'Terminés' },
  { value: 'rejete', label: 'Rejetés' },
];

// ─── COMPOSANT CARTE MÉMOIRE ───────────────────────────────────

function MemoireCard({ memoire, onStatusUpdate, onRefresh }) {
  const { addToast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const status = STATUS_CONFIG[memoire.status] || STATUS_CONFIG.brouillon;

  const handleAction = async (action, extraData = null) => {
    setLoading(true);
    try {
      const payload = { status: action };
      if (action === 'rejete' && extraData) {
        payload.rejection_reason = extraData;
      }
      await onStatusUpdate(memoire.id, payload);
      onRefresh?.();
      addToast(`✅ ${STATUS_CONFIG[action]?.label || action} avec succès`, 'success');
    } catch (error) {
      addToast('Erreur lors de l\'action', 'error');
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      addToast('Veuillez saisir un motif de rejet', 'error');
      return;
    }
    setShowRejectModal(false);
    await handleAction('rejete', rejectReason);
    setRejectReason('');
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
      addToast('Quitus téléchargé', 'success');
    } catch (error) {
      addToast('Erreur téléchargement quitus', 'error');
    }
  };

  const canValidateVerification = memoire.status === 'en_attente_verification';
  const canSendConvocation = memoire.status === 'depot_en_ligne';
  const canMarkPhysical = memoire.status === 'convocation_envoyee' || memoire.status === 'relance_envoyee';
  const canSignQuitus = memoire.status === 'en_attente_quitus';
  const canReject = ['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee', 'en_attente_verification', 'verification_ok'].includes(memoire.status);
  const canReopen = memoire.status === 'rejete';
  const showDownloadQuitus = (memoire.status === 'quitus_disponible' || memoire.status === 'quitus_retire') && !!memoire.quitus_file;
  const canConfirmRetire = memoire.status === 'quitus_disponible';

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  };

  return (
    <>
      <div style={{
        background: 'white',
        border: `1px solid ${memoire.status === 'rejete' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: 20,
        transition: 'all 0.2s',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className={`badge ${status.badge}`}>
                {status.icon} {status.label}
              </span>
              {memoire.is_quitus_signed && (
                <span className="badge badge-green">✅ Quitus signé</span>
              )}
              {memoire.physical_deposit_confirmed && (
                <span className="badge badge-blue">📦 Dépôt physique confirmé</span>
              )}
              {memoire.documents_conform && (
                <span className="badge badge-green">✅ Conforme</span>
              )}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{memoire.title}</h3>
            
            <div style={{ fontSize: 13, color: 'var(--texte-muted)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <span><User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {memoire.author_full_name || memoire.author_name}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>Matricule: {memoire.matricule || 'N/A'}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>{memoire.filiere || memoire.department}</span>
            </div>

            <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {memoire.pdf_file ? '✅' : '❌'} PDF
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {memoire.word_file ? '✅' : '❌'} Word
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {memoire.scanned_document ? '✅' : '❌'} Scanné
              </span>
            </div>

            {memoire.rejection_reason && (
              <div style={{
                marginTop: 8,
                padding: '6px 12px',
                background: 'var(--red-bg)',
                borderRadius: 6,
                fontSize: 12,
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <XCircle size={14} /> {memoire.rejection_reason}
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                marginTop: 8,
                color: 'var(--texte-muted)',
                fontSize: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {showDetails ? '▲ Moins de détails' : '▼ Plus de détails'}
            </button>

            {showDetails && (
              <div style={{
                marginTop: 8,
                padding: 12,
                background: 'var(--beige)',
                borderRadius: 'var(--radius-xs)',
                fontSize: 12,
                color: 'var(--texte-muted)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4
              }}>
                <div><strong>ID:</strong> {memoire.id}</div>
                <div><strong>Type:</strong> {memoire.type_document || 'Mémoire'}</div>
                <div><strong>Déposé le:</strong> {formatDate(memoire.created_at)}</div>
                <div><strong>Modifié le:</strong> {formatDate(memoire.updated_at)}</div>
                {memoire.submitted_at && <div><strong>Soumis:</strong> {formatDate(memoire.submitted_at)}</div>}
                {memoire.physical_verified_at && <div><strong>Vérifié:</strong> {formatDate(memoire.physical_verified_at)}</div>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {canSendConvocation && (
              <button
                onClick={() => handleAction('convocation_envoyee')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#F59E0B', color: 'white' }}
              >
                <Send size={13} /> Convocation
              </button>
            )}

            {canMarkPhysical && (
              <button
                onClick={() => handleAction('en_attente_verification')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <Package size={13} /> Dépôt physique
              </button>
            )}

            {canValidateVerification && (
              <button
                onClick={() => handleAction('verification_ok')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#8b5cf6', color: 'white' }}
              >
                <CheckCircle size={13} /> Vérifier
              </button>
            )}

            {canSignQuitus && (
              <button
                onClick={() => handleAction('quitus_disponible')}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ background: '#10B981', color: 'white' }}
              >
                <FileSignature size={13} /> Signer quitus
              </button>
            )}

            {showDownloadQuitus && (
              <>
                <button
                  onClick={handleDownloadQuitus}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#3b82f6', color: 'white' }}
                >
                  <Download size={13} />
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
                <CheckSquare size={13} /> Retrait
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="btn btn-ghost btn-sm"
                disabled={loading}
              >
                {loading ? <RefreshCw size={13} className="spin" /> : <ChevronDown size={13} />}
                Actions
              </button>
              {showActions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  boxShadow: 'var(--shadow-md)',
                  padding: 8,
                  minWidth: 200,
                  zIndex: 10,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}>
                  {canSendConvocation && (
                    <button
                      onClick={() => handleAction('convocation_envoyee')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <Send size={14} color="#F59E0B" /> Envoyer convocation
                    </button>
                  )}
                  {canMarkPhysical && (
                    <button
                      onClick={() => handleAction('en_attente_verification')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <Package size={14} color="#10B981" /> Dépôt physique
                    </button>
                  )}
                  {canValidateVerification && (
                    <button
                      onClick={() => handleAction('verification_ok')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <CheckCircle size={14} color="#8b5cf6" /> Valider vérification
                    </button>
                  )}
                  {canSignQuitus && (
                    <button
                      onClick={() => handleAction('quitus_disponible')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <FileSignature size={14} color="#10B981" /> Signer quitus
                    </button>
                  )}
                  {canConfirmRetire && (
                    <button
                      onClick={() => handleAction('quitus_retire')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <CheckSquare size={14} color="#10B981" /> Confirmer retrait
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  )}
                  {canReopen && (
                    <button
                      onClick={() => handleAction('depot_en_ligne')}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <RefreshCw size={14} /> Réouvrir
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}
        onClick={e => {
          if (e.target === e.currentTarget) setShowRejectModal(false);
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius)',
            padding: 32,
            maxWidth: 440,
            width: '100%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              ❌ Rejeter le dépôt
            </h3>
            <p style={{ fontSize: 14, color: 'var(--texte-muted)', marginBottom: 16 }}>
              Veuillez indiquer le motif du rejet pour informer l'étudiant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du rejet..."
              style={{
                width: '100%',
                minHeight: 80,
                padding: '12px 14px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: 16
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-ghost"
                style={{ flex: 1 }}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleRejectConfirm}
                className="btn btn-primary"
                style={{ flex: 1, background: '#ef4444', color: 'white' }}
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────

export default function AdminMemoires() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [memoires, setMemoires] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, memoiresRes] = await Promise.all([
        getMemoireStats(),
        listMemoires({ status: filter !== 'all' ? filter : undefined })
      ]);
      setStats(statsRes.data);
      setMemoires(memoiresRes.data?.results || memoiresRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      addToast('Erreur chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, addToast]);

  useEffect(() => {
    if (isStaff) {
      loadData();
    }
  }, [filter, isStaff, loadData]);

  const handleStatusUpdate = async (id, payload) => {
    try {
      await updateMemoireStatus(id, payload);
      await loadData();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  };

  const filteredMemoires = memoires.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.author_full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.matricule?.toLowerCase().includes(search.toLowerCase()) ||
    m.filiere?.toLowerCase().includes(search.toLowerCase())
  );

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

  // Statistiques pour les cartes
  const statCards = [
    { key: 'total', label: 'Total', color: 'var(--bleu-nuit)' },
    { key: 'depot_en_ligne', label: 'À convoquer', color: '#3b82f6' },
    { key: 'convocation_envoyee', label: 'Convocation', color: '#F59E0B' },
    { key: 'en_attente_verification', label: 'En vérification', color: '#8b5cf6' },
    { key: 'verification_ok', label: 'Vérifiés', color: '#10B981' },
    { key: 'quitus_disponible', label: 'Quitus disponibles', color: '#10B981' },
    { key: 'quitus_retire', label: 'Terminés', color: '#0F2A4A' },
    { key: 'rejete', label: 'Rejetés', color: '#ef4444' },
  ];

  return (
    <Layout>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: '32px 0 24px' }}>
        <div className="container">
          <button
            onClick={() => navigate('/dashboard')}
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
          <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
            Gestion des <span style={{ color: 'var(--or)' }}>Dépôts</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Validez, gérez et suivez les dépôts de mémoires et thèses
          </p>
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
                onClick={() => setFilter(s.key)}
                style={{
                  background: 'white',
                  border: `1px solid ${filter === s.key ? s.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-xs)',
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
                onClick={() => setFilter(s.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: filter === s.value ? 600 : 400,
                  background: filter === s.value ? 'var(--bleu-nuit)' : 'white',
                  color: filter === s.value ? 'white' : 'var(--texte)',
                  border: `1px solid ${filter === s.value ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                {s.label}
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
                  background: 'white'
                }}
              />
            </div>
            <button onClick={loadData} className="btn btn-ghost btn-sm">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : filteredMemoires.length === 0 ? (
          <div className="empty-state">
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
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Layout>
  );
}
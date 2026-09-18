// pages/staff/StaffQuitus.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Download, CheckCircle, Clock, AlertCircle,
  ArrowLeft, RefreshCw, Printer, Eye, Search,
  User, Calendar, FileCheck, XCircle, ChevronRight
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  listMemoires,
  updateMemoireStatus,
  downloadQuitus,
  getMemoireStats
} from '../../services/endpoints';

const STATUS_LABEL = {
  en_attente: { label: 'En attente', badge: 'badge-amber', icon: '⏳' },
  valide: { label: 'Validé', badge: 'badge-green', icon: '✅' },
  quitus_genere: { label: 'Quitus généré', badge: 'badge-blue', icon: '📄' },
  quitus_signe: { label: 'Quitus signé', badge: 'badge-green', icon: '✅' },
};

export default function StaffQuitus() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [memoires, setMemoires] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, memoiresRes] = await Promise.all([
        getMemoireStats(),
        listMemoires({ 
          status: filter !== 'all' ? filter : undefined,
          limit: 50
        })
      ]);
      setStats(statsRes.data);
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

  const handleGenerateQuitus = async (id) => {
    try {
      await updateMemoireStatus(id, { status: 'quitus_genere' });
      addToast('Quitus généré avec succès !', 'success');
      loadData();
    } catch (error) {
      addToast('Erreur lors de la génération du quitus', 'error');
    }
  };

  const handleSignQuitus = async (id) => {
    try {
      await updateMemoireStatus(id, { status: 'quitus_signe' });
      addToast('Quitus signé avec succès !', 'success');
      loadData();
    } catch (error) {
      addToast('Erreur lors de la signature du quitus', 'error');
    }
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
      addToast('Quitus téléchargé', 'success');
    } catch (error) {
      addToast('Erreur téléchargement quitus', 'error');
    }
  };

  const handlePrintQuitus = async (id) => {
    try {
      const res = await downloadQuitus(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.print();
      }
      URL.revokeObjectURL(url);
    } catch (error) {
      addToast('Erreur impression quitus', 'error');
    }
  };

  const filteredMemoires = memoires.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.author_full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase())
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

  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '32px 0 24px' }}>
        <div className="container">
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
          <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
            Gestion des <span style={{ color: 'var(--or)' }}>Quitus</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Générez, signez et imprimez les quitus de bibliothèque
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
            marginBottom: 24
          }}>
            {[
              { key: 'valide', label: 'À générer', color: '#3b82f6' },
              { key: 'quitus_genere', label: 'À signer', color: '#8b5cf6' },
              { key: 'quitus_signe', label: 'Signés', color: '#10B981' },
            ].map(s => (
              <div key={s.key} style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{stats[s.key] || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{s.label}</div>
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
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'Tous' },
              { value: 'valide', label: 'À générer' },
              { value: 'quitus_genere', label: 'À signer' },
              { value: 'quitus_signe', label: 'Signés' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: filter === f.value ? 600 : 400,
                  background: filter === f.value ? 'var(--bleu-nuit)' : 'white',
                  color: filter === f.value ? 'white' : 'var(--texte)',
                  border: `1px solid ${filter === f.value ? 'var(--bleu-nuit)' : 'var(--border)'}`,
                  transition: 'all 0.2s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--texte-light)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  padding: '8px 12px 8px 36px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
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
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : filteredMemoires.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>Aucun mémoire trouvé</h3>
            <p style={{ color: 'var(--texte-muted)' }}>
              Aucun mémoire ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredMemoires.map(m => {
              const status = STATUS_LABEL[m.status] || { label: m.status, badge: 'badge-slate', icon: '📄' };
              const canGenerate = m.status === 'valide';
              const canSign = m.status === 'quitus_genere';
              const hasQuitus = m.status === 'quitus_signe';
              const canPrint = m.quitus_file;

              return (
                <div
                  key={m.id}
                  style={{
                    background: 'white',
                    border: `1px solid ${m.status === 'quitus_signe' ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 20px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span className={`badge ${status.badge}`}>
                          {status.icon} {status.label}
                        </span>
                        {m.is_quitus_signed && (
                          <span className="badge badge-green">✅ Signé</span>
                        )}
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{m.title}</h4>
                      <div style={{ fontSize: 12, color: 'var(--texte-muted)' }}>
                        <User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        {' '}{m.author_full_name || m.author_name}
                        {' • '}
                        <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        {' '}{m.department} • Promotion {m.graduation_year}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {canGenerate && (
                        <button
                          onClick={() => handleGenerateQuitus(m.id)}
                          className="btn btn-bleu btn-sm"
                        >
                          <FileText size={13} /> Générer
                        </button>
                      )}
                      {canSign && (
                        <button
                          onClick={() => handleSignQuitus(m.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <FileCheck size={13} /> Signer
                        </button>
                      )}
                      {hasQuitus && canPrint && (
                        <>
                          <button
                            onClick={() => handleDownloadQuitus(m.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Download size={13} /> Télécharger
                          </button>
                          <button
                            onClick={() => handlePrintQuitus(m.id)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Printer size={13} /> Imprimer
                          </button>
                        </>
                      )}
                      {m.status !== 'quitus_signe' && m.status !== 'valide' && m.status !== 'quitus_genere' && (
                        <span style={{ fontSize: 12, color: 'var(--texte-light)' }}>
                          En attente de validation
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
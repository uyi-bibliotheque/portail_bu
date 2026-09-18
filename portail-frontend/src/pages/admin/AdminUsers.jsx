// pages/admin/AdminUsers.jsx - VERSION COMPLÈTE CORRIGÉE
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, RefreshCw, UserPlus, Shield, BookOpen, UserCheck } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { listUsers, createUser } from '../../services/endpoints';

const COLORS = {
  bleuNuit: '#1B1464',
  bleuNuitLight: '#2D2178',
  or: '#7C3AED',
  beige: '#F5F3FF',
  beigeDark: '#EDE9FE',
  texteMuted: '#64748b',
};

const AVAILABLE_ROLES = [
  { value: 'BIBLIO', label: '📚 Bibliothécaire', description: 'Gestion des mémoires et quitus' },
  { value: 'AIDE_BIBLIO', label: '🤝 Aide-Bibliothécaire', description: 'Catalogage et gestion du PMB' },
  { value: 'ADMIN', label: '⚙️ Administrateur', description: 'Accès complet au système' },
];

export default function AdminUsers() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    role: 'BIBLIO', password: '', confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoadingData(true);
    try {
      const response = await listUsers();
      let usersData = [];
      if (Array.isArray(response.data)) usersData = response.data;
      else if (response.data?.results) usersData = response.data.results;
      else if (response.data?.data) usersData = response.data.data;
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers([]);
      setError('Erreur lors du chargement');
      addToast('Erreur chargement', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username) { setError('Identifiant requis'); return; }
    if (!form.password) { setError('Mot de passe requis'); return; }
    if (form.password.length < 6) { setError('Min. 6 caractères'); return; }
    if (form.password !== form.confirm_password) { setError('Mots de passe différents'); return; }
    if (!form.email) { setError('Email requis'); return; }
    if (!form.first_name || !form.last_name) { setError('Prénom et nom requis'); return; }

    setCreating(true);
    try {
      await createUser(form);
      setSuccess('Utilisateur créé avec succès !');
      setForm({ username: '', email: '', first_name: '', last_name: '', role: 'BIBLIO', password: '', confirm_password: '' });
      await loadUsers();
      addToast('✅ Utilisateur créé', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erreur création';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      addToast('❌ ' + (typeof msg === 'string' ? msg : 'Erreur'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <Shield size={14} />;
      case 'BIBLIO': return <BookOpen size={14} />;
      case 'AIDE_BIBLIO': return <UserCheck size={14} />;
      default: return null;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-or';
      case 'BIBLIO': return 'badge-blue';
      case 'AIDE_BIBLIO': return 'badge-purple';
      default: return 'badge-slate';
    }
  };

  if (!authLoading && !user) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Accès non autorisé</h2>
          <button onClick={() => navigate('/connexion')} className="btn btn-bleu" style={{ marginTop: 20 }}>
            Se connecter
          </button>
        </div>
      </Layout>
    );
  }

  if (!authLoading && !isAdmin) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Accès réservé aux administrateurs</h2>
          <button onClick={() => navigate('/')} className="btn btn-bleu" style={{ marginTop: 20 }}>
            Retour à l'accueil
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.bleuNuit} 0%, ${COLORS.bleuNuitLight} 100%)`,
        padding: '32px 0 24px'
      }}>
        <div className="container">
          <button
            onClick={() => navigate('/admin/dashboard?tab=users')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'color 0.2s', fontFamily: 'inherit'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </button>
          <h1 style={{ fontSize: 32, color: 'white', fontWeight: 400, fontFamily: 'serif' }}>
            👥 Gestion des <span style={{ color: COLORS.or }}>Utilisateurs</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Créez et gérez les comptes du personnel
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div className="users-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24 }}>

          {/* Liste des utilisateurs */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)', padding: 20
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12
            }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>
                Liste des utilisateurs ({users.length})
              </h3>
              <button onClick={loadUsers} className="btn btn-ghost btn-sm" disabled={loadingData}>
                <RefreshCw size={14} className={loadingData ? 'spin' : ''} />
                {loadingData ? 'Chargement...' : 'Rafraîchir'}
              </button>
            </div>

            {loadingData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.texteMuted }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id || u.username}>
                        <td style={{ fontWeight: 600 }}>
                          {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                        </td>
                        <td style={{ color: COLORS.texteMuted, fontSize: 12 }}>
                          {u.email || '-'}
                        </td>
                        <td>
                          <span className={`badge ${getRoleBadge(u.role)}`} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            {getRoleIcon(u.role)}
                            {u.role_display || u.role || 'Utilisateur'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Formulaire de création */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)', padding: 20,
            position: 'sticky', top: 20, alignSelf: 'start'
          }}>
            <h3 style={{
              fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <UserPlus size={18} color={COLORS.or} /> Créer un utilisateur
            </h3>

            {error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                color: '#b91c1c', marginBottom: 12, fontSize: 13
              }}>
                ❌ {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '10px 14px', background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                color: '#047857', marginBottom: 12, fontSize: 13
              }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Identifiant *</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input" type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemple.cm"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input
                    className="form-input"
                    value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    className="form-input"
                    value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input
                  className="form-input" type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 caractères"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe *</label>
                <input
                  className="form-input" type="password"
                  value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="Confirmer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle *</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: COLORS.texteMuted, marginTop: 6 }}>
                  {AVAILABLE_ROLES.map(role => (
                    <div key={role.value} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0'
                    }}>
                      <span style={{
                        display: 'inline-block', width: 4, height: 4,
                        borderRadius: '50%',
                        background: form.role === role.value ? COLORS.or : 'var(--border)'
                      }} />
                      <strong>{role.label}</strong>
                      <span style={{ color: COLORS.texteMuted }}>— {role.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn-bleu"
                  disabled={creating}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {creating ? 'Création...' : '➕ Créer'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setForm({
                    username: '', email: '', first_name: '', last_name: '',
                    role: 'BIBLIO', password: '', confirm_password: ''
                  })}
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bouton retour en bas */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/admin/dashboard?tab=users')}
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .spin { animation: spin 1s linear infinite; }
        .skeleton {
          background: linear-gradient(90deg, #f0ede8 25%, #e8e4dd 50%, #f0ede8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
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
        .badge-slate { background: rgba(148,163,184,0.12); color: #64748b; }
        .badge-blue { background: rgba(59,130,246,0.12); color: #2563eb; }
        .badge-purple { background: rgba(124,58,237,0.12); color: #7c3aed; }
        .badge-or { background: rgba(124,58,237,0.12); color: #7c3aed; }
        .form-group { margin-bottom: 4px; }
        .form-label {
          display: block;
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 4px;
          color: var(--texte);
        }
        .form-input, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          background: white;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: ${COLORS.or};
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          font-family: inherit;
        }
        .btn-sm { padding: 5px 12px; font-size: 12px; }
        .btn-bleu { background: ${COLORS.bleuNuit}; color: white; }
        .btn-bleu:hover { background: ${COLORS.bleuNuitLight}; }
        .btn-ghost {
          background: transparent;
          color: var(--texte);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover { background: ${COLORS.beige}; border-color: ${COLORS.or}; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        table th {
          text-align: left;
          padding: 10px 12px;
          font-weight: 600;
          color: ${COLORS.texteMuted};
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        table td { padding: 12px; border-bottom: 1px solid ${COLORS.beigeDark}; }
        table tr:hover td { background: ${COLORS.beige}; }

        @media (max-width: 1024px) {
          .users-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}
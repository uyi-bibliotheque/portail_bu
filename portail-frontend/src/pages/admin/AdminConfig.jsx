// pages/admin/AdminConfig.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings, Save, RefreshCw, ArrowLeft,
  Shield, Users, BookOpen, Bell, Globe,
  Mail, Database, Server, AlertCircle
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getConfig, saveConfig, updateConfig } from '../../services/endpoints';

function ConfigSection({ title, icon, children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-sm)',
      padding: 24,
      border: '1px solid var(--border)',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ color: 'var(--or)' }}>{icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ConfigField({ label, name, value, onChange, type = 'text', options = null, help = '' }) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" htmlFor={name}>{label}</label>
      {type === 'select' ? (
        <select
          id={name}
          className="form-select"
          value={value}
          onChange={e => onChange(name, e.target.value)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'boolean' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id={name}
            checked={value === 'true' || value === true}
            onChange={e => onChange(name, e.target.checked ? 'true' : 'false')}
          />
          <label htmlFor={name} style={{ fontSize: 14, cursor: 'pointer' }}>
            {value === 'true' || value === true ? 'Activé' : 'Désactivé'}
          </label>
        </div>
      ) : (
        <input
          id={name}
          className="form-input"
          type={type}
          value={value || ''}
          onChange={e => onChange(name, e.target.value)}
        />
      )}
      {help && <div style={{ fontSize: 11, color: 'var(--texte-muted)', marginTop: 4 }}>{help}</div>}
    </div>
  );
}

export default function AdminConfig() {
  const { isStaff } = useAuth();
  const { addToast } = useToast();
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await getConfig();
      const data = response.data || [];
      // Transformer en objet key: value
      const configObj = {};
      data.forEach(item => {
        configObj[item.key] = item.value;
      });
      setConfigs(configObj);
    } catch (error) {
      console.error('Erreur chargement config:', error);
      addToast('Erreur chargement configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarder chaque configuration modifiée
      const promises = Object.entries(configs).map(([key, value]) =>
        updateConfig(key, { value })
      );
      await Promise.all(promises);
      addToast('Configuration sauvegardée', 'success');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      addToast('Erreur sauvegarde configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius)' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ background: 'var(--bleu-nuit)', padding: '32px 0 24px' }}>
        <div className="container">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard?tab=config')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              marginBottom: 16,
              transition: 'color 0.2s',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0
            }}
          >
            <ArrowLeft size={14} /> Retour au tableau de bord
          </button>
          <h1 className="font-serif" style={{ fontSize: 36, color: 'white', fontWeight: 400 }}>
            Configuration <span style={{ color: 'var(--or)' }}>du portail</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Gérez les paramètres généraux du portail documentaire
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Section Générale */}
          <ConfigSection title="Paramètres généraux" icon={<Globe size={20} />}>
            <ConfigField
              label="Nom du portail"
              name="SITE_NAME"
              value={configs.SITE_NAME}
              onChange={handleChange}
              help="Nom affiché dans l'en-tête et les emails"
            />
            <ConfigField
              label="Description du portail"
              name="SITE_DESCRIPTION"
              value={configs.SITE_DESCRIPTION}
              onChange={handleChange}
              help="Description affichée dans le pied de page"
            />
            <ConfigField
              label="Mode maintenance"
              name="MAINTENANCE_MODE"
              value={configs.MAINTENANCE_MODE}
              onChange={handleChange}
              type="boolean"
              help="Active le mode maintenance (seuls les administrateurs peuvent accéder)"
            />
          </ConfigSection>

          {/* Section Emails */}
          <ConfigSection title="Emails et notifications" icon={<Mail size={20} />}>
            <ConfigField
              label="Email d'envoi"
              name="DEFAULT_FROM_EMAIL"
              value={configs.DEFAULT_FROM_EMAIL}
              onChange={handleChange}
              type="email"
              help="Email utilisé pour l'envoi des notifications"
            />
            <ConfigField
              label="Email de contact"
              name="CONTACT_EMAIL"
              value={configs.CONTACT_EMAIL}
              onChange={handleChange}
              type="email"
              help="Email affiché dans la page contact"
            />
            <ConfigField
              label="Activer les emails"
              name="EMAIL_NOTIFICATIONS"
              value={configs.EMAIL_NOTIFICATIONS}
              onChange={handleChange}
              type="boolean"
              help="Active l'envoi d'emails pour les notifications"
            />
          </ConfigSection>

          {/* Section Sécurité */}
          <ConfigSection title="Sécurité et authentification" icon={<Shield size={20} />}>
            <ConfigField
              label="Temps d'expiration JWT (minutes)"
              name="JWT_EXPIRATION"
              value={configs.JWT_EXPIRATION}
              onChange={handleChange}
              type="number"
              help="Durée de validité des tokens JWT en minutes"
            />
            <ConfigField
              label="Tentatives de connexion max"
              name="MAX_LOGIN_ATTEMPTS"
              value={configs.MAX_LOGIN_ATTEMPTS}
              onChange={handleChange}
              type="number"
              help="Nombre maximal de tentatives de connexion avant blocage"
            />
          </ConfigSection>

          {/* Section Mémoires */}
          <ConfigSection title="Dépôt de mémoires" icon={<BookOpen size={20} />}>
            <ConfigField
              label="Taille max des fichiers (Mo)"
              name="MAX_FILE_SIZE"
              value={configs.MAX_FILE_SIZE}
              onChange={handleChange}
              type="number"
              help="Taille maximale des fichiers PDF en Mo"
            />
            <ConfigField
              label="Formats acceptés"
              name="ALLOWED_FILE_TYPES"
              value={configs.ALLOWED_FILE_TYPES}
              onChange={handleChange}
              help="Extensions de fichiers autorisées (séparées par des virgules)"
            />
          </ConfigSection>

          {/* Section PMB */}
          <ConfigSection title="Intégration PMB" icon={<Database size={20} />}>
            <ConfigField
              label="URL du webservice PMB"
              name="PMB_WS_URL"
              value={configs.PMB_WS_URL}
              onChange={handleChange}
              help="URL du webservice PMB pour les connexions"
            />
            <ConfigField
              label="Source ID PMB"
              name="PMB_SOURCE_ID"
              value={configs.PMB_SOURCE_ID}
              onChange={handleChange}
              help="ID de la source PMB à utiliser"
            />
          </ConfigSection>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={handleSave}
              className="btn btn-bleu"
              disabled={saving}
              style={{ padding: '12px 32px' }}
            >
              <Save size={18} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={loadConfig} className="btn btn-ghost" disabled={saving}>
              <RefreshCw size={18} /> Réinitialiser
            </button>
          </div>

          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'var(--beige)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 12,
            color: 'var(--texte-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={14} />
            Les modifications seront appliquées immédiatement.
          </div>
        </div>
      </div>
    </Layout>
  );
}
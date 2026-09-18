// pages/LoginPage.jsx - VERSION PROFESSIONNELLE (CORRIGÉE - redirection directe)

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, AlertCircle, Shield, User, ArrowRight, CheckCircle } from 'lucide-react';
import libraryLogo from '../assets/images/Bc_logo.png';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  // ✅ Détermine la route selon le rôle
  const getRedirectPath = (userData) => {
    if (!userData) return '/mon-compte';
    const role = userData.role;
    const isSuperuser = userData.is_superuser;
    
    if (role === 'ADMIN' || isSuperuser) return '/admin/dashboard';
    if (role === 'BIBLIO') return '/staff';
    if (role === 'AIDE_BIBLIO') return '/aide-biblio';
    return '/mon-compte';
  };

  // ✅ Redirection si l'utilisateur est DÉJÀ connecté au montage
  useEffect(() => {
    if (user && !authLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      const path = getRedirectPath(user);
      console.log('🔀 [useEffect] Redirection vers:', path, 'pour rôle:', user.role);
      navigate(path, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.username || !form.password) {
      setError(isEnglish ? 'Please fill in all fields.' : 'Veuillez remplir tous les champs.');
      return;
    }
    
    setLoading(true);
    try {
      const userData = await login(form.username, form.password);
      
      // ✅ Récupérer l'utilisateur de manière fiable
      const resolvedUser = userData?.user ?? userData;
      const role = resolvedUser?.role;
      
      console.log('🔀 [handleSubmit] Connexion réussie. Rôle:', role);
      console.log('🔀 [handleSubmit] Données utilisateur:', resolvedUser);
      
      addToast(isEnglish ? 'Login successful! Welcome.' : 'Connexion réussie ! Bienvenue.', 'success');

      // ✅ Redirection DIRECTE basée sur le rôle retourné par login()
      const path = getRedirectPath(resolvedUser);
      console.log('🔀 [handleSubmit] Redirection immédiate vers:', path);
      
      hasRedirected.current = true;
      navigate(path, { replace: true });
      
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      const msg = err.response?.data?.detail
        || err.response?.data?.non_field_errors?.[0]
        || (isEnglish ? 'Invalid credentials. Please check your username and password.' : 'Identifiants incorrects. Vérifiez votre login et mot de passe.');
      setError(msg);
      setLoading(false); // ✅ Reset uniquement en cas d'erreur
    }
    // ⚠️ Pas de finally : si succès, on garde le loader jusqu'à la navigation
  };

  return (
    <Layout>
      <div style={{
        minHeight: 'calc(100vh - var(--header-h) - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #f8f6f1 0%, #ffffff 50%, #f0eee9 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs */}
        <div style={{
          position: 'absolute', top: -150, right: -150,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(27,20,100,0.03)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(201,168,106,0.04)', pointerEvents: 'none'
        }} />
        
        <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 20px', background: 'white', borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: 24
            }}>
              <img src={libraryLogo} alt="Logo BCU UYI" style={{ height: 72, width: 'auto', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 6 }}>
              {isEnglish ? 'Welcome' : 'Bienvenue'}
            </h1>
            <p style={{ color: 'var(--texte-muted)', fontSize: 15 }}>
              {isEnglish ? 'Academic documentary portal of the Central University Library' : 'Portail documentaire de la Bibliothèque Centrale Universitaire'}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'white', borderRadius: 20, padding: '40px 36px 32px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            {/* Info */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(27,20,100,0.03)',
              border: '1px solid rgba(27,20,100,0.06)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
              fontSize: 13, color: 'var(--texte-muted)', lineHeight: 1.6
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(27,20,100,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1
              }}>
                <BookOpen size={14} color="var(--bleu-nuit)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--bleu-nuit)', marginBottom: 2 }}>
                  {isEnglish ? 'Authentication' : 'Authentification'}
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{isEnglish ? 'Students:' : 'Étudiants :'}</span> {isEnglish ? 'SIGB PMB credentials' : 'identifiants SIGB PMB'}
                  <br />
                  <span style={{ fontWeight: 500 }}>{isEnglish ? 'Staff:' : 'Personnel :'}</span> {isEnglish ? 'institutional credentials' : 'identifiants institutionnels'}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.12)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                fontSize: 13, color: '#b91c1c'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Identifiant */}
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="username" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontWeight: 600, fontSize: 13, color: 'var(--texte)', marginBottom: 6
                }}>
                  <User size={16} /> {isEnglish ? 'Username' : 'Identifiant'}
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isEnglish ? 'Your SIGB username or login' : 'Votre identifiant SIGB ou username'}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: `2px solid ${focusedField === 'username' ? 'var(--or)' : 'var(--border)'}`,
                    fontSize: 14, outline: 'none', background: 'white',
                    fontFamily: 'inherit', transition: 'border-color 0.2s'
                  }}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="password" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontWeight: 600, fontSize: 13, color: 'var(--texte)', margin: 0
                  }}>
                    <Shield size={16} /> {isEnglish ? 'Password' : 'Mot de passe'}
                  </label>
                  <Link to="/mot-de-passe-oublie" style={{ fontSize: 12, color: 'var(--or)', fontWeight: 500, textDecoration: 'none' }}>
                    {isEnglish ? 'Forgot password?' : 'Mot de passe oublié ?'}
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '12px 48px 12px 16px', borderRadius: 10,
                      border: `2px solid ${focusedField === 'password' ? 'var(--or)' : 'var(--border)'}`,
                      fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      color: 'var(--texte-muted)', cursor: 'pointer', padding: 4
                    }}
                    aria-label={showPw ? (isEnglish ? 'Hide password' : 'Masquer') : (isEnglish ? 'Show password' : 'Afficher')}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 24, flexWrap: 'wrap', gap: 8
              }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: 'var(--texte-muted)', cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--or)', cursor: 'pointer' }}
                  />
                  {isEnglish ? 'Remember me' : 'Se souvenir de moi'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--texte-light)' }}>
                  <CheckCircle size={14} /> {isEnglish ? 'Secure login' : 'Connexion sécurisée'}
                </div>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: 'var(--bleu-nuit)', color: 'white', border: 'none',
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: 18, height: 18, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {isEnglish ? 'Logging in...' : 'Connexion en cours...'}
                  </>
                ) : (
                  <>
                    {isEnglish ? 'Log in' : 'Se connecter'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--texte-muted)' }}>
              {isEnglish ? 'Need help?' : 'Besoin d\'aide ?'}{' '}
              <Link to="/contact" style={{ color: 'var(--bleu-nuit)', fontWeight: 600, textDecoration: 'none' }}>
                {isEnglish ? 'Contact the library' : 'Contactez la bibliothèque'}
              </Link>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, color: 'var(--texte-light)' }}>
              <span>© {new Date().getFullYear()} BCU UYI</span>
              <span>•</span>
              <Link to="/mentions-legales" style={{ color: 'var(--texte-light)', textDecoration: 'none' }}>{isEnglish ? 'Legal notice' : 'Mentions légales'}</Link>
              <span>•</span>
              <Link to="/confidentialite" style={{ color: 'var(--texte-light)', textDecoration: 'none' }}>{isEnglish ? 'Privacy' : 'Confidentialité'}</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
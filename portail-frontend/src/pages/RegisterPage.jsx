// pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle,
  Loader2, UserCheck, BookOpen, AlertCircle, Building2,
  GraduationCap, School, ChevronRight, ArrowLeft,
  Shield, Award, Sparkles, Calendar, Fingerprint
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { register, checkAvailability } from '../services/endpoints';
import { useToast } from '../contexts/ToastContext';
import logo from '../assets/images/Bc_logo.png';

const FACULTIES = [
  { value: 'FS', label: 'FS - Faculté des Sciences' },
  { value: 'FALSH', label: 'FALSH - Faculté des Arts, Lettres et Sciences Humaines' },
  { value: 'FSE', label: 'FSE - Faculté des Sciences de l\'Éducation' },
  { value: 'FMSB', label: 'FMSB - Faculté de Médecine et des Sciences Biomédicales' },
  { value: 'ENS', label: 'ENS - École Normale Supérieure de Yaoundé' },
  { value: 'ENSPY', label: 'ENSPY - École Nationale Supérieure Polytechnique de Yaoundé' },
  { value: 'IUT-Bois', label: 'IUT-Bois - Institut Universitaire de Technologie du Bois' },
];

const DEPARTEMENTS = {
  'FS': [
    'Biochimie',
    'Biologie et Physiologie Animales',
    'Biologie et Physiologie Végétales',
    'Chimie Inorganique',
    'Chimie Organique',
    'Informatique',
    'Mathématiques',
    'Microbiologie',
    'Physique',
    'Sciences de la Terre et de l\'Univers'
  ],
  'Sciences': [
    'Biochimie',
    'Biologie et Physiologie Animales',
    'Biologie et Physiologie Végétales',
    'Chimie Inorganique',
    'Chimie Organique',
    'Informatique',
    'Mathématiques',
    'Microbiologie',
    'Physique',
    'Sciences de la Terre et de l\'Univers'
  ],
  'FALSH': [
    'Allemand',
    'Anglais',
    'Anthropologie',
    'Arts et Archéologie',
    'Espagnol',
    'Géographie',
    'Histoire',
    'Langues Africaines et Linguistique',
    'Lettres Bilingues',
    'Littérature et Civilisation Africaine',
    'Lettres Modernes Françaises',
    'Philosophie',
    'Psychologie',
    'Sciences du Langage',
    'Sociologie',
    'Tourisme et Hôtellerie'
  ],
  'FSE': [
    'Curricula et Évaluation',
    'Didactique des Disciplines',
    'Enseignements Fondamentaux en Éducation',
    'Management de l\'Éducation'
  ],
  'FMSB': [
    'Anatomie Pathologique',
    'Chirurgie et Spécialités',
    'Gynécologie et Obstétrique',
    'Médecine Interne et Spécialités',
    'Pédiatrie',
    'Sciences Morphologiques',
    'Sciences Physiologiques',
    'Santé Publique',
    'Pharmacie et Sciences du Médicament',
    'Odontostomatologie (Chirurgie Dentaire)'
  ],
  'ENS': [
    'Allemand',
    'Anglais',
    'Biologie',
    'Chimie',
    'Espagnol',
    'Géographie',
    'Histoire',
    'Informatique',
    'Langues d\'Enseignement et Bilinguisme',
    'Lettres Modernes',
    'Mathématiques',
    'Physique',
    'Sciences de l\'Éducation'
  ],
  'ENSPY': [
    'Génie Civil',
    'Génie Mécanique',
    'Génie Électrique',
    'Génie Informatique',
    'Génie Chimique et Procédés',
    'Génie Télécommunications',
    'Génie Industriel'
  ],
  'Polytech': [
    'Génie Civil',
    'Génie Mécanique',
    'Génie Électrique',
    'Génie Informatique',
    'Génie Chimique et Procédés',
    'Génie Télécommunications'
  ],
  'IUT-Bois': [
    'Génie du Bois',
    'Génie Industriel et Productique',
    'Maintenance Industrielle',
    'Énergie et Environnement du Bois',
    'Chimie et Transformation du Bois'
  ],
  'IUT_BOIS': [
    'Génie du Bois',
    'Génie Industriel et Productique',
    'Maintenance Industrielle',
    'Énergie et Environnement du Bois',
    'Chimie et Transformation du Bois'
  ],
  'UIT-Bois': [
    'Génie du Bois',
    'Génie Industriel et Productique',
    'Maintenance Industrielle',
    'Énergie et Environnement du Bois'
  ],
};

const NIVEAUX = [
  { value: 'Master 1', label: 'Master 1' },
  { value: 'Master 2', label: 'Master 2' },
  { value: 'Doctorat', label: 'Doctorat (Thèse)' },
];

// ─── COMPOSANT INPUT AVEC ICÔNE ─────────────────────────────────

function FormInput({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched,
  icon: Icon,
  placeholder,
  disabled,
  success,
  loading,
  rightElement,
  required = true
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group-modern">
      <label className="form-label-modern">
        {Icon && <Icon size={16} />}
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          name={name}
          type={inputType}
          className={`form-input-modern ${touched && error ? 'error' : ''} ${success ? 'success' : ''}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
        />
        {loading && (
          <Loader2 size={18} className="spin input-icon" />
        )}
        {!loading && success && (
          <CheckCircle size={18} className="input-icon success-icon" />
        )}
        {!loading && touched && error && (
          <XCircle size={18} className="input-icon error-icon" />
        )}
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightElement}
      </div>
      {touched && error && (
        <div className="error-message">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matriculeAvailable, setMatriculeAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  
  const [form, setForm] = useState({
    matricule: '',
    email: '',
    first_name: '',
    last_name: '',
    faculte: '',
    departement: '',
    niveau: 'Master 2',
    password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [departements, setDepartements] = useState([]);

  // Mettre à jour les départements quand la faculté change
  useEffect(() => {
    if (form.faculte && DEPARTEMENTS[form.faculte]) {
      setDepartements(DEPARTEMENTS[form.faculte]);
      if (!DEPARTEMENTS[form.faculte].includes(form.departement)) {
        setForm(prev => ({ ...prev, departement: '' }));
      }
    } else {
      setDepartements([]);
    }
  }, [form.faculte]);

  // Vérification du matricule
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.matricule.length >= 3) {
        checkMatricule(form.matricule);
      } else {
        setMatriculeAvailable(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.matricule]);

  // Vérification de l'email
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.email.includes('@') && form.email.includes('.')) {
        checkEmail(form.email);
      } else {
        setEmailAvailable(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.email]);

  // Vérification de la force du mot de passe
  useEffect(() => {
    const password = form.password;
    let score = 0;
    let label = 'Faible';
    let color = '#ef4444';

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score >= 4) { label = 'Fort'; color = '#10B981'; }
    else if (score >= 3) { label = 'Moyen'; color = '#F59E0B'; }
    else if (score >= 2) { label = 'Faible'; color = '#ef4444'; }
    else { label = 'Très faible'; color = '#ef4444'; }

    setPasswordStrength({ score, label, color });
  }, [form.password]);

  const checkMatricule = async (value) => {
    if (value.length < 3) return;
    setChecking(true);
    try {
      const response = await checkAvailability('matricule', value);
      setMatriculeAvailable(response.data.available);
    } catch (error) {
      console.error('Erreur vérification matricule:', error);
    } finally {
      setChecking(false);
    }
  };

  const checkEmail = async (value) => {
    if (!value.includes('@')) return;
    setChecking(true);
    try {
      const response = await checkAvailability('email', value);
      setEmailAvailable(response.data.available);
    } catch (error) {
      console.error('Erreur vérification email:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name) => {
    const value = form[name];
    let error = '';
    
    switch(name) {
      case 'matricule':
        if (!value) error = 'Le matricule est requis';
        else if (value.length < 3) error = 'Le matricule doit contenir au moins 3 caractères';
        else if (matriculeAvailable === false) error = 'Ce matricule est déjà utilisé';
        break;
      case 'email':
        if (!value) error = 'L\'email est requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email invalide (ex: nom@domaine.cm)';
        else if (emailAvailable === false) error = 'Cet email est déjà utilisé';
        break;
      case 'first_name':
        if (!value) error = 'Le prénom est requis';
        else if (value.length < 2) error = 'Le prénom doit contenir au moins 2 caractères';
        break;
      case 'last_name':
        if (!value) error = 'Le nom est requis';
        else if (value.length < 2) error = 'Le nom doit contenir au moins 2 caractères';
        break;
      case 'faculte':
        if (!value) error = 'La faculté est requise';
        break;
      case 'departement':
        if (!value) error = 'Le département est requis';
        break;
      case 'password':
        if (!value) error = 'Le mot de passe est requis';
        else if (value.length < 6) error = '6 caractères minimum';
        break;
      case 'confirm_password':
        if (!value) error = 'Confirmez le mot de passe';
        else if (value !== form.password) error = 'Les mots de passe ne correspondent pas';
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['matricule', 'email', 'first_name', 'last_name', 'faculte', 'departement', 'password', 'confirm_password'];
    let isValid = true;
    fields.forEach(field => {
      const isFieldValid = validateField(field);
      if (!isFieldValid) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Veuillez corriger les erreurs', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await register(form);
      
      if (response.data.success) {
        addToast('🎉 Inscription réussie ! Vous pouvez maintenant vous connecter avec votre email ou matricule.', 'success');
        setTimeout(() => navigate('/connexion'), 2000);
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      const errorMsg = error.response?.data?.errors || 
                       error.response?.data?.detail || 
                       'Erreur lors de l\'inscription. Veuillez réessayer.';
      addToast(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return form.matricule && form.email && form.first_name && form.last_name && 
           form.faculte && form.departement && form.password && form.confirm_password &&
           !errors.matricule && !errors.email && !errors.password && !errors.confirm_password &&
           matriculeAvailable !== false && emailAvailable !== false &&
           form.password === form.confirm_password;
  };

  return (
    <Layout noFooter>
      <div className="register-page">
        <div className="register-container">
          {/* Logo et titre */}
          <div className="register-header">
            <Link to="/" className="register-logo">
              <img src={logo} alt="BCU UYI" />
            </Link>
            <div className="register-title">
              <h1>
                <Sparkles size={28} className="title-icon" />
                Créer un compte
              </h1>
              <p>Inscrivez-vous pour déposer votre mémoire ou thèse</p>
            </div>
          </div>

          {/* Card */}
          <div className="register-card">
            <form onSubmit={handleSubmit}>
              {/* Matricule */}
              <div className="form-row">
                <FormInput
                  label="Matricule"
                  name="matricule"
                  value={form.matricule}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.matricule}
                  touched={touched.matricule}
                  icon={Fingerprint}
                  placeholder="Ex: 21T2345"
                  disabled={loading}
                  success={matriculeAvailable === true}
                  loading={checking}
                />
                <div className="input-hint">
                  <Calendar size={12} /> Format: 21T2345 (année + initiale + numéro)
                </div>
              </div>

              {/* Email */}
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                icon={Mail}
                placeholder="votre@email.cm"
                disabled={loading}
                success={emailAvailable === true}
                loading={checking}
              />

              {/* Prénom & Nom */}
              <div className="form-row-duo">
                <FormInput
                  label="Prénom"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.first_name}
                  touched={touched.first_name}
                  icon={User}
                  placeholder="Prénom"
                  disabled={loading}
                />
                <FormInput
                  label="Nom"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.last_name}
                  touched={touched.last_name}
                  icon={User}
                  placeholder="Nom"
                  disabled={loading}
                />
              </div>

              {/* Faculté & Département */}
              <div className="form-row-duo">
                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <Building2 size={16} /> Faculté *
                  </label>
                  <div className="input-wrapper">
                    <select
                      name="faculte"
                      className={`form-select-modern ${touched.faculte && errors.faculte ? 'error' : ''}`}
                      value={form.faculte}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading}
                    >
                      <option value="">Sélectionner une faculté</option>
                      {FACULTIES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  {touched.faculte && errors.faculte && (
                    <div className="error-message">
                      <AlertCircle size={12} /> {errors.faculte}
                    </div>
                  )}
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">
                    <School size={16} /> Département *
                  </label>
                  <div className="input-wrapper">
                    <select
                      name="departement"
                      className={`form-select-modern ${touched.departement && errors.departement ? 'error' : ''}`}
                      value={form.departement}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading || !form.faculte}
                    >
                      <option value="">
                        {!form.faculte ? 'Sélectionnez d\'abord une faculté' : 'Sélectionner un département'}
                      </option>
                      {departements.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  {touched.departement && errors.departement && (
                    <div className="error-message">
                      <AlertCircle size={12} /> {errors.departement}
                    </div>
                  )}
                </div>
              </div>

              {/* Niveau */}
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <GraduationCap size={16} /> Niveau *
                </label>
                <div className="input-wrapper">
                  <select
                    name="niveau"
                    className="form-select-modern"
                    value={form.niveau}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {NIVEAUX.map(n => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="form-row-duo">
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                    icon={Lock}
                    placeholder="Minimum 6 caractères"
                    disabled={loading}
                  />
                  {form.password && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div 
                          className="password-strength-fill"
                          style={{ 
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            background: passwordStrength.color
                          }}
                        />
                      </div>
                      <span style={{ color: passwordStrength.color, fontSize: 11, fontWeight: 600 }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="Confirmer"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.confirm_password}
                    touched={touched.confirm_password}
                    icon={Lock}
                    placeholder="Confirmer le mot de passe"
                    disabled={loading}
                    success={form.confirm_password && form.password === form.confirm_password && form.password.length >= 6}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="info-box">
                <AlertCircle size={16} className="info-icon" />
                <div>
                  <strong>À savoir :</strong> Ce compte vous permettra de déposer votre mémoire ou thèse en ligne.
                  <br />
                  <strong style={{ color: 'var(--or)' }}>⚠️ Important :</strong> Après l'inscription, vous pourrez déposer vos documents et recevoir une convocation pour le dépôt physique.
                </div>
              </div>

              {/* Boutons */}
              <div className="form-actions">
                <Link to="/connexion" className="btn-back">
                  <ArrowLeft size={16} /> Retour
                </Link>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} />
                      S'inscrire
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="register-footer">
            <p>
              Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
            </p>
            <p>
              En vous inscrivant, vous acceptez nos{' '}
              <Link to="/conditions">conditions d'utilisation</Link>
            </p>
          </div>
        </div>

        {/* Styles */}
        <style>{`
          /* ─── PAGE ─── */
          .register-page {
            min-height: calc(100vh - var(--header-h));
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
            background: linear-gradient(135deg, var(--beige) 0%, white 100%);
          }
          .register-container {
            width: 100%;
            max-width: 620px;
          }

          /* ─── HEADER ─── */
          .register-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .register-logo {
            display: inline-block;
          }
          .register-logo img {
            height: 64px;
            width: auto;
            margin-bottom: 16px;
          }
          .register-title h1 {
            font-size: 28px;
            font-weight: 800;
            color: var(--bleu-nuit);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .register-title .title-icon {
            color: var(--or);
          }
          .register-title p {
            color: var(--texte-muted);
            font-size: 14px;
            margin-top: 4px;
          }

          /* ─── CARD ─── */
          .register-card {
            background: white;
            border-radius: var(--radius);
            padding: 32px 28px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
            border: 1px solid var(--border);
          }

          /* ─── FORM GROUP ─── */
          .form-group-modern {
            margin-bottom: 16px;
          }
          .form-label-modern {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: var(--texte);
            margin-bottom: 6px;
          }
          .form-label-modern .required-star {
            color: var(--red);
            margin-left: 2px;
          }

          .input-wrapper {
            position: relative;
          }
          .input-wrapper .input-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
          }
          .input-wrapper .success-icon {
            color: var(--green);
          }
          .input-wrapper .error-icon {
            color: var(--red);
          }

          .form-input-modern {
            width: 100%;
            padding: 11px 14px;
            border: 2px solid var(--border);
            border-radius: var(--radius-sm);
            font-size: 14px;
            font-family: inherit;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;
            color: var(--texte);
          }
          .form-input-modern:focus {
            outline: none;
            border-color: var(--or);
            box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
          }
          .form-input-modern.error {
            border-color: var(--red);
            box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
          }
          .form-input-modern.success {
            border-color: var(--green);
          }
          .form-input-modern:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .form-select-modern {
            width: 100%;
            padding: 11px 14px;
            border: 2px solid var(--border);
            border-radius: var(--radius-sm);
            font-size: 14px;
            font-family: inherit;
            background: white;
            color: var(--texte);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 36px;
          }
          .form-select-modern:focus {
            outline: none;
            border-color: var(--or);
            box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
          }
          .form-select-modern.error {
            border-color: var(--red);
          }
          .form-select-modern:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: var(--texte-muted);
            padding: 4px;
          }
          .password-toggle:hover {
            color: var(--texte);
          }

          .input-hint {
            font-size: 11px;
            color: var(--texte-light);
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .error-message {
            font-size: 12px;
            color: var(--red);
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .form-row-duo {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          /* ─── PASSWORD STRENGTH ─── */
          .password-strength {
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .password-strength-bar {
            flex: 1;
            height: 4px;
            background: var(--beige);
            border-radius: 2px;
            overflow: hidden;
          }
          .password-strength-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.3s ease;
          }

          /* ─── INFO BOX ─── */
          .info-box {
            padding: 14px 16px;
            background: var(--beige);
            border-radius: var(--radius-xs);
            font-size: 13px;
            color: var(--texte-muted);
            line-height: 1.6;
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            align-items: flex-start;
            border-left: 3px solid var(--or);
          }
          .info-box .info-icon {
            flex-shrink: 0;
            margin-top: 2px;
            color: var(--or);
          }

          /* ─── ACTIONS ─── */
          .form-actions {
            display: flex;
            gap: 12px;
          }
          .form-actions .btn-back {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            border: 2px solid var(--border);
            border-radius: var(--radius-sm);
            background: transparent;
            color: var(--texte);
            font-weight: 600;
            font-size: 14px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            cursor: pointer;
          }
          .form-actions .btn-back:hover {
            border-color: var(--or);
            color: var(--or);
          }

          .form-actions .btn-submit {
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--bleu-nuit), #2D2178);
            border: none;
            border-radius: var(--radius-sm);
            color: white;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(27,20,100,0.15);
          }
          .form-actions .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(27,20,100,0.2);
          }
          .form-actions .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          /* ─── FOOTER ─── */
          .register-footer {
            text-align: center;
            margin-top: 24px;
          }
          .register-footer p {
            font-size: 13px;
            color: var(--texte-muted);
            margin-bottom: 4px;
          }
          .register-footer a {
            color: var(--bleu-nuit);
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }
          .register-footer a:hover {
            color: var(--or);
          }
          .register-footer p:last-child {
            font-size: 12px;
            color: var(--texte-light);
          }
          .register-footer p:last-child a {
            color: var(--or);
            font-weight: 500;
          }

          /* ─── ANIMATIONS ─── */
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }

          /* ─── RESPONSIVE ─── */
          @media (max-width: 640px) {
            .register-card {
              padding: 24px 16px;
            }
            .form-row-duo {
              grid-template-columns: 1fr;
            }
            .form-actions {
              flex-direction: column;
            }
            .form-actions .btn-back,
            .form-actions .btn-submit {
              flex: none;
              width: 100%;
            }
            .register-title h1 {
              font-size: 22px;
            }
            .register-title h1 .title-icon {
              display: none;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
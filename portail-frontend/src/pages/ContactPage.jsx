// pages/ContactPage.jsx - VERSION FINALE (Google Maps + honeypot + reCAPTCHA)
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ShieldCheck, Loader2, ExternalLink } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { sendContact } from '../services/endpoints';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const SUBJECTS = [
  { fr: 'Renseignements généraux', en: 'General information' },
  { fr: 'Catalogue et recherche documentaire', en: 'Catalog and research support' },
  { fr: 'Emprunt et retour d\'ouvrages', en: 'Book borrowing and return' },
  { fr: 'Dépôt de mémoire / Quitus', en: 'Dissertation deposit / Quitus' },
  { fr: 'Accès aux ressources numériques', en: 'Access to digital resources' },
  { fr: 'Formation documentaire', en: 'Documentary training' },
  { fr: 'Signalement d\'erreur sur le portail', en: 'Portal error report' },
  { fr: 'Autre', en: 'Other' },
];

// ═══════════════════════════════════════════════════════════════════
// ─── Coordonnées de la BCU UYI ────────────────────────────────────
// Plus Code Google Maps : VG42+VM6 Yaoundé
// Adresse : Campus principal Ngoa-Ekelle, Université de Yaoundé I
// BP 1312, Yaoundé, Cameroun
// Tél : +237 242 06 47 28
// ═══════════════════════════════════════════════════════════════════
const BCU_COORDS = {
  lat: 3.8667,
  lng: 11.5050,
  plusCode: 'VG42+VM6',
  city: 'Yaoundé',
  // ✅ URLs Google Maps avec Plus Code (localisation exacte)
  embedUrl: (lang = 'fr', zoom = 17) =>
    `https://www.google.com/maps?q=VG42%2BVM6+Yaound%C3%A9&hl=${lang}&z=${zoom}&output=embed`,
  openUrl: () =>
    `https://www.google.com/maps/search/?api=1&query=VG42%2BVM6+Yaound%C3%A9`,
};

export default function ContactPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isEnglish = language === 'en';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (executeRecaptcha) {
      setRecaptchaReady(true);
      console.log('✅ reCAPTCHA v3 prêt');
    } else {
      console.warn('⚠️ reCAPTCHA non disponible — le backend fonctionnera en fail-open');
    }
  }, [executeRecaptcha]);

  // ═══════════════════════════════════════════════════════════════════
  // TRADUCTIONS
  // ═══════════════════════════════════════════════════════════════════
  const t = {
    fr: {
      title: 'Nous',
      titleHighlight: 'contacter',
      subtitle: 'Bibliothèque Centrale Universitaire — Université de Yaoundé I',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      hours: 'Horaires d\'ouverture',
      addressContent: 'Campus principal Ngoa-Ekelle\nUniversité de Yaoundé I\nBP 1312, Yaoundé, Cameroun',
      hoursContent: 'Lundi : 12h00 – 22h00\nMardi – Vendredi : 09h00 – 22h00\nSamedi : 10h00 – 16h00\nDimanche : Fermé',
      mapTitle: 'Localisation BCU UYI sur Google Maps',
      openInGoogleMaps: 'Ouvrir dans Google Maps',
      formTitle: 'Formulaire de contact',
      fullName: 'Nom complet',
      fullNamePlaceholder: 'Votre nom',
      emailLabel: 'Email',
      emailPlaceholder: 'votre@email.cm',
      subjectLabel: 'Sujet',
      subjectPlaceholder: '-- Choisissez un sujet --',
      messageLabel: 'Message',
      messagePlaceholder: 'Décrivez votre demande en détail…',
      characters: 'caractères',
      antiSpam: 'Protection anti-spam active. Vos données ne seront utilisées que pour répondre à votre demande.',
      recaptchaNotice: 'Ce site est protégé par reCAPTCHA v3 (Google).',
      sendButton: 'Envoyer le message',
      sending: 'Envoi en cours…',
      successTitle: 'Message envoyé !',
      successText: 'Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais (sous 2 jours ouvrables).',
      sendAnother: 'Envoyer un autre message',
      messageSent: 'Message envoyé avec succès !',
      recaptchaError: 'Vérification de sécurité échouée. Veuillez réessayer.',
      sendError: 'Erreur lors de l\'envoi. Veuillez réessayer.',
      rateLimit: 'Trop de demandes. Veuillez patienter un instant.',
      errorName: 'Le nom est requis.',
      errorEmail: 'Adresse email invalide.',
      errorSubject: 'Veuillez choisir un sujet.',
      errorMessage: 'Le message doit contenir au moins 20 caractères.',
      seoTitle: 'Contact',
      seoDescription: 'Contactez la Bibliothèque Centrale Universitaire de Yaoundé I pour les renseignements, l\'aide à la recherche documentaire et les demandes de service.',
      seoKeywords: 'contact bibliothèque UYI, téléphone bibliothèque Yaoundé, aide documentaire, contact UYI',
    },
    en: {
      title: 'Contact',
      titleHighlight: 'us',
      subtitle: 'Central University Library — University of Yaoundé I',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      hours: 'Opening hours',
      addressContent: 'Ngoa-Ekelle Main Campus\nUniversity of Yaoundé I\nBP 1312, Yaoundé, Cameroon',
      hoursContent: 'Monday: 12h00 – 22h00\nTuesday – Friday: 09h00 – 22h00\nSaturday: 10h00 – 16h00\nSunday: Closed',
      mapTitle: 'BCU UYI location on Google Maps',
      openInGoogleMaps: 'Open in Google Maps',
      formTitle: 'Contact form',
      fullName: 'Full name',
      fullNamePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.cm',
      subjectLabel: 'Subject',
      subjectPlaceholder: '-- Choose a subject --',
      messageLabel: 'Message',
      messagePlaceholder: 'Describe your request in detail…',
      characters: 'characters',
      antiSpam: 'Anti-spam protection active. Your data will only be used to respond to your request.',
      recaptchaNotice: 'This site is protected by reCAPTCHA v3 (Google).',
      sendButton: 'Send message',
      sending: 'Sending…',
      successTitle: 'Message sent!',
      successText: 'We have received your message and will respond as soon as possible (within 2 business days).',
      sendAnother: 'Send another message',
      messageSent: 'Message sent successfully!',
      recaptchaError: 'Security verification failed. Please try again.',
      sendError: 'Error sending message. Please try again.',
      rateLimit: 'Too many requests. Please wait a moment.',
      errorName: 'Name is required.',
      errorEmail: 'Invalid email address.',
      errorSubject: 'Please choose a subject.',
      errorMessage: 'The message must contain at least 20 characters.',
      seoTitle: 'Contact',
      seoDescription: 'Contact the Central University Library of Yaoundé I for information, documentary research assistance and service requests.',
      seoKeywords: 'contact library UYI, phone library Yaoundé, documentary help, contact UYI',
    },
  };

  const tr = t[language] || t.fr;

  // ═══════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════
  const validate = useCallback(() => {
    const err = {};
    if (!form.name.trim()) err.name = tr.errorName;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = tr.errorEmail;
    if (!form.subject) err.subject = tr.errorSubject;
    if (form.message.trim().length < 20) err.message = tr.errorMessage;
    return err;
  }, [form, tr]);

  // ═══════════════════════════════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ─── Anti-spam honeypot (silencieux) ────────────────────────
    if (form.honeypot && form.honeypot.trim() !== '') {
      console.warn('🍯 Honeypot détecté — soumission ignorée');
      return;
    }

    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      const firstError = Object.keys(err)[0];
      document.getElementById(firstError)?.focus();
      return;
    }

    setLoading(true);

    try {
      // 1. Génération du token reCAPTCHA v3
      let recaptchaToken = '';
      if (executeRecaptcha && recaptchaReady) {
        try {
          recaptchaToken = await executeRecaptcha('contact_form');
          console.log('✅ Token reCAPTCHA généré:', recaptchaToken.substring(0, 20) + '...');
        } catch (recaptchaErr) {
          console.error('❌ Erreur génération token reCAPTCHA:', recaptchaErr);
        }
      }

      // 2. Envoi du formulaire (avec _hp_field au lieu de website)
      await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        recaptcha_token: recaptchaToken,
        _hp_field: form.honeypot,   // ← Nom neutre (anti auto-fill)
      });

      setSuccess(true);
      addToast(tr.messageSent, 'success');

    } catch (error) {
      console.error('❌ Erreur envoi contact:', error);

      const errorCode = error?.response?.data?.code;
      const errorDetail = error?.response?.data?.detail;
      const status = error?.response?.status;

      if (errorCode === 'recaptcha_failed') {
        addToast(errorDetail || tr.recaptchaError, 'error');
      } else if (status === 429) {
        addToast(tr.rateLimit, 'error');
      } else if (status === 400 && error?.response?.data) {
        const backendErrors = error.response.data;
        const firstError = Object.values(backendErrors)[0];
        addToast(typeof firstError === 'string' ? firstError : tr.sendError, 'error');
      } else {
        addToast(tr.sendError, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const resetForm = () => {
    setSuccess(false);
    setForm({ name: '', email: '', subject: '', message: '', honeypot: '' });
    setErrors({});
  };

  // ═══════════════════════════════════════════════════════════════════
  // FAQ SCHEMA
  // ═══════════════════════════════════════════════════════════════════
  const faqSchema = {
    mainEntity: [
      {
        '@type': 'Question',
        name: isEnglish
          ? 'How can I contact the University of Yaoundé I library?'
          : 'Comment contacter la bibliothèque universitaire de Yaoundé I ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isEnglish
            ? 'You can reach us by phone, by email, or through the contact form on this site.'
            : 'Vous pouvez nous contacter par téléphone, par e-mail, ou via le formulaire de contact de ce site.'
        }
      },
      {
        '@type': 'Question',
        name: isEnglish
          ? 'How can I get help with documentary research?'
          : 'Comment obtenir de l\'aide pour la recherche documentaire ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: isEnglish
            ? 'Our documentary mediation team supports users in searching the catalog, electronic resources and institutional theses and dissertations.'
            : 'Notre équipe de médiation documentaire accompagne les usagers pour la recherche dans le catalogue, les ressources électroniques et les thèses et mémoires institutionnels.'
        }
      }
    ]
  };

  const contactItems = [
    { Icon: MapPin, title: tr.address, content: tr.addressContent },
    { Icon: Phone, title: tr.phone, content: '+237 242 06 47 28' },
    { Icon: Mail, title: tr.email, content: 'biblio.Bibliotheque@uy1.uninet.cm' },
    { Icon: Clock, title: tr.hours, content: tr.hoursContent },
  ];

  const lang = isEnglish ? 'en' : 'fr';
  // ✅ URLs Google Maps avec Plus Code (VG42+VM6)
  const googleMapsEmbedUrl = BCU_COORDS.embedUrl(lang, 17);
  const googleMapsOpenUrl = BCU_COORDS.openUrl();

  return (
    <>
      <Seo
        title={tr.seoTitle}
        path="/contact"
        description={tr.seoDescription}
        keywords={tr.seoKeywords}
        canonical="https://bcu-uyi.cm/contact"
        faqSchema={faqSchema}
      />
      <Layout>
        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
          padding: isMobile ? '32px 0 24px' : '48px 0 32px'
        }}>
          <div className="container">
            <h1 className="font-serif" style={{
              fontSize: isMobile ? 32 : 40,
              color: 'white',
              fontWeight: 400,
              marginBottom: 8
            }}>
              {tr.title} <span style={{ color: 'var(--or)' }}>{tr.titleHighlight}</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: isMobile ? 14 : 15
            }}>
              {tr.subtitle}
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: isMobile ? '32px 16px' : '56px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.6fr)',
            gap: isMobile ? 32 : 48,
            alignItems: 'start'
          }}>
            {/* INFOS CONTACT */}
            <div>
              {contactItems.map(({ Icon, title, content }, index) => (
                <div
                  key={title}
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    padding: isMobile ? '16px 0' : '20px 0',
                    borderBottom: index < contactItems.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{
                    width: isMobile ? 40 : 44,
                    height: isMobile ? 40 : 44,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--bleu-nuit), #2D2178)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--or)'
                  }}>
                    <Icon size={isMobile ? 16 : 18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: isMobile ? 13 : 14,
                      marginBottom: 4
                    }}>
                      {title}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 12 : 13,
                      color: 'var(--texte-muted)',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.7,
                      wordBreak: 'break-word'
                    }}>
                      {content}
                    </div>
                  </div>
                </div>
              ))}

              {/* CARTE GOOGLE MAPS */}
              <div style={{ marginTop: 24 }}>
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  height: isMobile ? 220 : 280,
                  position: 'relative',
                  background: '#f5f5f5',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                }}>
                  <iframe
                    title={tr.mapTitle}
                    src={googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                  <a
                    href={googleMapsOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      background: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: 50,
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 600,
                      color: 'var(--bleu-nuit)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--or)';
                      e.currentTarget.style.color = 'var(--or)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(124,58,237,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--bleu-nuit)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    <MapPin size={14} />
                    <span>{tr.openInGoogleMaps}</span>
                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </a>
                </div>
              </div>
            </div>

            {/* FORMULAIRE */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius)',
              padding: isMobile ? 24 : 40,
              boxShadow: 'var(--shadow)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
                  <div style={{
                    width: isMobile ? 64 : 72,
                    height: isMobile ? 64 : 72,
                    borderRadius: '50%',
                    background: 'var(--green-bg, #d1fae5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--green, #059669)'
                  }}>
                    <CheckCircle size={isMobile ? 32 : 36} />
                  </div>
                  <h2 style={{
                    fontWeight: 800,
                    fontSize: isMobile ? 20 : 22,
                    marginBottom: 10
                  }}>
                    {tr.successTitle}
                  </h2>
                  <p style={{
                    color: 'var(--texte-muted)',
                    marginBottom: 24,
                    lineHeight: 1.7,
                    fontSize: isMobile ? 14 : 16
                  }}>
                    {tr.successText}
                  </p>
                  <button
                    onClick={resetForm}
                    className="btn btn-bleu"
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    {tr.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 style={{
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 700,
                    marginBottom: isMobile ? 16 : 24
                  }}>
                    {tr.formTitle}
                  </h2>

                  {/* HONEYPOT ANTI-BOT (corrigé) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      top: '-9999px',
                      width: 1,
                      height: 1,
                      overflow: 'hidden',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                  >
                    <label htmlFor="_hp_field">
                      {isEnglish ? 'Do not fill this field' : 'Ne pas remplir ce champ'}
                    </label>
                    <input
                      id="_hp_field"
                      type="text"
                      name="_hp_field"
                      value={form.honeypot}
                      onChange={e => set('honeypot', e.target.value)}
                      tabIndex={-1}
                      autoComplete="new-password"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Nom + Email */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? 12 : 16,
                    marginBottom: isMobile ? 12 : 20
                  }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name" style={{ fontSize: isMobile ? 13 : 14 }}>
                        {tr.fullName} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder={tr.fullNamePlaceholder}
                        style={{
                          fontSize: isMobile ? 14 : 15,
                          borderColor: errors.name ? '#ef4444' : undefined
                        }}
                        disabled={loading}
                      />
                      {errors.name && (
                        <div className="form-error" style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email" style={{ fontSize: isMobile ? 13 : 14 }}>
                        {tr.emailLabel} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder={tr.emailPlaceholder}
                        style={{
                          fontSize: isMobile ? 14 : 15,
                          borderColor: errors.email ? '#ef4444' : undefined
                        }}
                        disabled={loading}
                      />
                      {errors.email && (
                        <div className="form-error" style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sujet */}
                  <div className="form-group" style={{ marginBottom: isMobile ? 12 : 20 }}>
                    <label className="form-label" htmlFor="subject" style={{ fontSize: isMobile ? 13 : 14 }}>
                      {tr.subjectLabel} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className={`form-select ${errors.subject ? 'error' : ''}`}
                      value={form.subject}
                      onChange={e => set('subject', e.target.value)}
                      style={{
                        fontSize: isMobile ? 14 : 15,
                        borderColor: errors.subject ? '#ef4444' : undefined
                      }}
                      disabled={loading}
                    >
                      <option value="">{tr.subjectPlaceholder}</option>
                      {SUBJECTS.map(s => {
                        const label = isEnglish ? s.en : s.fr;
                        return (
                          <option key={label} value={label}>{label}</option>
                        );
                      })}
                    </select>
                    {errors.subject && (
                      <div className="form-error" style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                        {errors.subject}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="form-group" style={{ marginBottom: isMobile ? 12 : 20 }}>
                    <label className="form-label" htmlFor="message" style={{ fontSize: isMobile ? 13 : 14 }}>
                      {tr.messageLabel} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className={`form-textarea ${errors.message ? 'error' : ''}`}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder={tr.messagePlaceholder}
                      style={{
                        minHeight: isMobile ? 120 : 160,
                        fontSize: isMobile ? 14 : 15,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        borderColor: errors.message ? '#ef4444' : undefined
                      }}
                      disabled={loading}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 4,
                      flexWrap: 'wrap',
                      gap: 4
                    }}>
                      {errors.message ? (
                        <div className="form-error" style={{ color: '#ef4444', fontSize: 12 }}>
                          {errors.message}
                        </div>
                      ) : (
                        <div />
                      )}
                      <div style={{
                        fontSize: 11,
                        color: 'var(--texte-light, #94a3b8)',
                        marginLeft: 'auto'
                      }}>
                        {form.message.length} {tr.characters}
                      </div>
                    </div>
                  </div>

                  {/* Notice anti-spam */}
                  <div style={{
                    background: 'var(--beige, #f5f3ff)',
                    borderRadius: 10,
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    fontSize: isMobile ? 11 : 12,
                    color: 'var(--texte-muted)',
                    marginBottom: isMobile ? 16 : 20,
                    lineHeight: 1.6,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <ShieldCheck
                      size={isMobile ? 14 : 16}
                      style={{ marginTop: 2, flexShrink: 0, color: 'var(--or)' }}
                    />
                    <div>
                      <div>{tr.antiSpam}</div>
                      <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 11, opacity: 0.75 }}>
                        🔒 {tr.recaptchaNotice}
                      </div>
                    </div>
                  </div>

                  {/* Bouton submit */}
                  <button
                    type="submit"
                    className="btn btn-bleu"
                    style={{
                      padding: isMobile ? '12px 20px' : '13px 28px',
                      fontSize: isMobile ? 14 : 15,
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'wait' : 'pointer'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={isMobile ? 16 : 18} className="animate-spin" />
                        {tr.sending}
                      </>
                    ) : (
                      <>
                        <Send size={isMobile ? 16 : 18} />
                        {tr.sendButton}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .container {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
          }
          @media (max-width: 480px) {
            .container {
              padding-left: 12px !important;
              padding-right: 12px !important;
            }
          }
        `}</style>
      </Layout>
    </>
  );
}

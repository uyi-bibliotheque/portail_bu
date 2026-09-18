// src/main.jsx - VERSION CORRIGÉE (sans BrowserRouter en double)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App.jsx';
import './index.css';

// ═══════════════════════════════════════════════════════════════════
// ✅ CONFIGURATION reCAPTCHA v3
// ═══════════════════════════════════════════════════════════════════
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.warn(
    '⚠️ VITE_RECAPTCHA_SITE_KEY non définie dans .env\n' +
    '👉 Ajoutez : VITE_RECAPTCHA_SITE_KEY=votre_cle_publique\n' +
    '👉 Puis redémarrez : npm run dev'
  );
} else {
  console.log('✅ reCAPTCHA Site Key détectée:', RECAPTCHA_SITE_KEY.substring(0, 15) + '...');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ PAS de <BrowserRouter> ici — il est DÉJÀ dans App.jsx */}
    {/* ✅ Le provider reCAPTCHA enveloppe tout */}
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      language={navigator.language || 'fr'}
      useEnterprise={false}
      useRecaptchaNet={false}
    >
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>,
);
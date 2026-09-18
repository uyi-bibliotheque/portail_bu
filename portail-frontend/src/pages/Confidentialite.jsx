// pages/Confidentialite.jsx - VERSION REFACTORISÉE
import Layout from '../components/layout/Layout';
import { Shield, Lock, UserCheck, Eye, FileText, Mail, Database, Server, Trash2, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Confidentialite() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  return (
    <Layout>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)',
        padding: 'clamp(32px, 5vw, 60px) 0 clamp(24px, 3vw, 40px) 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.08)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -120,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.05)',
          pointerEvents: 'none'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Bouton retour - mieux espacé */}
          <div style={{ marginBottom: 'clamp(24px, 3vw, 40px)' }}>
            <Link 
              to="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'rgba(255,255,255,0.8)',
                fontSize: 'clamp(13px, 1vw, 14px)',
                fontWeight: 500,
                transition: 'all 0.2s',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              <ArrowLeft size={16} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}
            </Link>
          </div>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: 'white',
            padding: '6px 16px',
            borderRadius: 50,
            fontSize: 'clamp(10px, 0.8vw, 12px)',
            fontWeight: 700,
            marginBottom: 'clamp(12px, 1.5vw, 20px)',
            letterSpacing: '0.06em'
          }}>
            <Lock size={14} /> {isEnglish ? 'PRIVACY' : 'CONFIDENTIALITÉ'}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            color: 'white',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 'clamp(8px, 1vw, 16px)'
          }}>
            {isEnglish ? 'Privacy Policy' : 'Politique de Confidentialité'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(14px, 1.2vw, 18px)',
            maxWidth: 640,
            marginTop: 0,
            lineHeight: 1.6
          }}>
            {isEnglish
              ? 'The Central University Library of Yaoundé I is committed to protecting your personal data in accordance with applicable legislation.'
              : 'La Bibliothèque Centrale Universitaire de Yaoundé I s\'engage à protéger vos données personnelles conformément à la législation en vigueur.'}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) 0', background: 'var(--beige)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 'clamp(24px, 4vw, 48px)',
            alignItems: 'start'
          }}
          className="content-grid">
            
            {/* Sommaire */}
            <div style={{
              position: 'sticky',
              top: 'calc(var(--header-h) + 24px)',
              background: 'white',
              borderRadius: 16,
              padding: 'clamp(20px, 2.5vw, 28px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              display: 'block'
            }}
            className="sidebar-desktop">
              <h3 style={{
                fontSize: 'clamp(13px, 1vw, 14px)',
                fontWeight: 700,
                color: 'var(--bleu-nuit)',
                marginBottom: 16,
                letterSpacing: '0.04em'
              }}>
                {isEnglish ? 'Table of contents' : 'Sommaire'}
              </h3>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {[
                  { label: isEnglish ? 'Introduction' : 'Introduction', id: 'introduction' },
                  { label: isEnglish ? 'Collected data' : 'Données collectées', id: 'donnees' },
                  { label: isEnglish ? 'Use of data' : 'Utilisation des données', id: 'utilisation' },
                  { label: isEnglish ? 'Legal basis' : 'Base légale', id: 'base' },
                  { label: isEnglish ? 'Retention period' : 'Durée de conservation', id: 'conservation' },
                  { label: isEnglish ? 'Data security' : 'Sécurité des données', id: 'securite' },
                  { label: isEnglish ? 'Your rights' : 'Vos droits', id: 'droits' },
                  { label: 'Cookies', id: 'cookies' },
                  { label: isEnglish ? 'Data transfer' : 'Transfert de données', id: 'transfert' },
                  { label: isEnglish ? 'Changes' : 'Modifications', id: 'modifications' },
                  { label: isEnglish ? 'DPO contact' : 'Contact DPO', id: 'contact' },
                ].map(item => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        fontSize: 'clamp(12px, 0.85vw, 13px)',
                        color: 'var(--texte-muted)',
                        display: 'block',
                        padding: '6px 12px',
                        borderRadius: 8,
                        transition: 'all 0.2s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--beige)';
                        e.currentTarget.style.color = 'var(--bleu-nuit)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--texte-muted)';
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div style={{ 
                marginTop: 24, 
                paddingTop: 16, 
                borderTop: '1px solid var(--border)',
                display: 'none' 
              }}
              className="sidebar-back-btn">
                <Link 
                  to="/" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--or)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Home size={16} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}
                </Link>
              </div>
            </div>

            {/* Contenu principal */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 'clamp(20px, 3vw, 48px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ 
                fontSize: 'clamp(14px, 0.95vw, 15px)', 
                lineHeight: 1.8, 
                color: 'var(--texte)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <div id="introduction" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <p style={{ marginBottom: 16, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'This privacy policy aims to inform you about how the Central University Library of Yaoundé I collects, uses, protects and stores your personal data when you use our website and services.'
                      : 'La présente politique de confidentialité a pour objectif de vous informer sur la manière dont la Bibliothèque Centrale Universitaire de Yaoundé I collecte, utilise, protège et conserve vos données personnelles lorsque vous utilisez notre site web et nos services.'}
                  </p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'We are committed to complying with Cameroonian law and the general principles of data protection.'
                      : 'Nous nous engageons à respecter les dispositions de la loi camerounaise et les principes généraux de protection des données.'}
                  </p>
                </div>

                <div id="donnees" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Database size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Personal data collected' : 'Données personnelles collectées'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'We collect the following categories of data:' : 'Nous collectons les catégories de données suivantes :'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(12px, 1.5vw, 16px)' }}>
                    {[
                      { title: isEnglish ? 'Identification data' : 'Données d\'identification', items: isEnglish ? ['Name', 'First name', 'Email address', 'Phone number'] : ['Nom', 'Prénom', 'Adresse email', 'Numéro de téléphone'] },
                      { title: isEnglish ? 'Academic data' : 'Données académiques', items: isEnglish ? ['Study level', 'Specialty', 'Student number', 'Faculty'] : ['Niveau d\'étude', 'Spécialité', 'Numéro d\'étudiant', 'Faculté'] },
                      { title: isEnglish ? 'Connection data' : 'Données de connexion', items: isEnglish ? ['IP address', 'Date and time of connection', 'Visited pages', 'Browser type'] : ['Adresse IP', 'Date et heure de connexion', 'Pages visitées', 'Type de navigateur'] },
                      { title: isEnglish ? 'Submission data' : 'Données de dépôt', items: isEnglish ? ['Thesis title', 'Summary', 'Keywords', 'Submitted file'] : ['Titre du mémoire/thèse', 'Résumé', 'Mots-clés', 'Fichier soumis'] },
                    ].map((cat, idx) => (
                      <div key={idx} style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)' }}>
                        <h4 style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8 }}>{cat.title}</h4>
                        <ul style={{ listStyle: 'none', fontSize: 'clamp(12px, 0.8vw, 13px)', color: 'var(--texte-muted)' }}>
                          {cat.items.map((item, i) => (
                            <li key={i} style={{ padding: '2px 0', display: 'flex', alignItems: 'center', gap: 6, wordBreak: 'break-word' }}><span style={{ color: 'var(--or)', flexShrink: 0 }}>•</span> {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="utilisation" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Eye size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Use of data' : 'Utilisation des données'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Your personal data is used for:' : 'Vos données personnelles sont utilisées pour :'}</p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li><strong>{isEnglish ? 'Manage your registration' : 'Gérer votre inscription'}</strong>{isEnglish ? ' and access to library services' : ' et votre accès aux services de la bibliothèque'}</li>
                    <li><strong>{isEnglish ? 'Process your requests' : 'Traiter vos demandes'}</strong>{isEnglish ? ' for loans, consultation or document submission' : ' de prêt, de consultation ou de dépôt de documents'}</li>
                    <li><strong>{isEnglish ? 'Inform you' : 'Vous informer'}</strong>{isEnglish ? ' about news, events and library services' : ' des actualités, des événements et des services de la bibliothèque'}</li>
                    <li><strong>{isEnglish ? 'Improve' : 'Améliorer'}</strong>{isEnglish ? ' our services and website through usage analysis' : ' nos services et notre site web grâce à l\'analyse des usages'}</li>
                    <li><strong>{isEnglish ? 'Respond to you' : 'Répondre'}</strong>{isEnglish ? ' to your requests (contact forms, information requests)' : ' à vos sollicitations (formulaires de contact, demandes d\'information)'}</li>
                  </ul>
                </div>

                <div id="base" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <FileText size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Legal basis for processing' : 'Base légale du traitement'}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Processing is based on the following legal grounds:' : 'Le traitement de vos données personnelles repose sur les bases légales suivantes :'}</p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li><strong>{isEnglish ? 'Your consent' : 'Votre consentement'}</strong>{isEnglish ? ' (for data not necessary for the website to function)' : ' (pour les données non nécessaires au fonctionnement du site)'}</li>
                    <li><strong>{isEnglish ? 'Contract performance' : 'L\'exécution d\'un contrat'}</strong>{isEnglish ? ' (for library services)' : ' (pour les services de la bibliothèque)'}</li>
                    <li><strong>{isEnglish ? 'Legal obligation' : 'Une obligation légale'}</strong>{isEnglish ? ' (archive retention)' : ' (conservation des documents archivés)'}</li>
                    <li><strong>{isEnglish ? 'Legitimate interest' : 'L\'intérêt légitime'}</strong>{isEnglish ? ' (service improvement)' : ' (amélioration de nos services)'}</li>
                  </ul>
                </div>

                <div id="conservation" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Trash2 size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Retention period' : 'Durée de conservation'}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Personal data is kept only as long as required for the purposes for which it was collected:' : 'Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont collectées :'}</p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li><strong>{isEnglish ? 'Thesis submission data:' : 'Données de dépôt de mémoire/thèse :'}</strong>{isEnglish ? ' Permanently stored in the institutional repository' : ' Conservation permanente dans le répertoire institutionnel'}</li>
                    <li><strong>{isEnglish ? 'Registration data:' : 'Données d\'inscription :'}</strong>{isEnglish ? ' During your studies at the University of Yaoundé I' : ' Pendant la durée de votre scolarité à l\'Université de Yaoundé I'}</li>
                    <li><strong>{isEnglish ? 'Connection data:' : 'Données de connexion :'}</strong>{isEnglish ? ' Maximum 12 months for analysis purposes' : ' 12 mois maximum à des fins d\'analyse'}</li>
                    <li><strong>{isEnglish ? 'Contact data:' : 'Données de contact :'}</strong>{isEnglish ? ' 3 years from the last contact' : ' 3 ans à compter du dernier contact'}</li>
                  </ul>
                </div>

                <div id="securite" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Server size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Data security' : 'Sécurité des données'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure or destruction:' : 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, toute modification, divulgation ou destruction :'}</p>
                </div>

                <div id="droits" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <UserCheck size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Your rights' : 'Vos droits'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Under Cameroonian law, you have the following rights regarding your personal data:' : 'Conformément à la loi camerounaise, vous bénéficiez des droits suivants sur vos données personnelles :'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(10px, 1.2vw, 12px)' }}>
                    {[
                      { icon: '👁️', label: isEnglish ? 'Right of access' : 'Droit d\'accès', desc: isEnglish ? 'Confirmation and access to data' : 'Confirmation et accès aux données' },
                      { icon: '✏️', label: isEnglish ? 'Right to rectification' : 'Droit de rectification', desc: isEnglish ? 'Correct inaccurate data' : 'Rectification des données inexactes' },
                      { icon: '🗑️', label: isEnglish ? 'Right to erasure' : 'Droit d\'effacement', desc: isEnglish ? 'Delete your data' : 'Suppression des données' },
                      { icon: '⛔', label: isEnglish ? 'Right to object' : 'Droit d\'opposition', desc: isEnglish ? 'Oppose the processing' : 'Opposition au traitement' },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: 'var(--beige)', borderRadius: 10, padding: 'clamp(10px, 1.2vw, 16px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', flexShrink: 0 }}>{item.icon}</span><div style={{ fontWeight: 600, fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'var(--bleu-nuit)' }}>{item.label}</div></div>
                        <div style={{ fontSize: 'clamp(10px, 0.7vw, 12px)', color: 'var(--texte-muted)', paddingLeft: 'clamp(28px, 2.5vw, 34px)' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="cookies" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Shield size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    Cookies
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Our site uses cookies to improve navigation and analyze traffic.' : 'Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic.'}</p>
                </div>

                <div id="transfert" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <RefreshCw size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Data transfer' : 'Transfert de données'}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Your personal data is not transferred outside Cameroon unless using online services whose privacy policies apply.' : 'Vos données personnelles ne sont pas transférées hors du Cameroun, sauf dans le cadre de l\'utilisation de services en ligne où les données sont traitées conformément à leurs politiques de confidentialité respectives.'}</p>
                </div>

                <div id="modifications" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <FileText size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Policy changes' : 'Modifications de la politique'}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'We reserve the right to modify this privacy policy at any time. Changes are published on this page with the update date.' : 'Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour.'}</p>
                </div>

                <div id="contact" style={{ scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Mail size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Data Protection Officer contact' : 'Contact du Délégué à la Protection des Données'}
                  </h2>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)' }}>
                    <p style={{ marginBottom: 8, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Data Protection Officer (DPO)' : 'Délégué à la Protection des Données (DPO)'} :</strong> {isEnglish ? 'Director of the Central Library' : 'Directeur de la Bibliothèque Centrale'}</p>
                    <p style={{ marginBottom: 8, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>Email :</strong>{' '}<a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>biblio.Bibliotheque@uy1.uninet.cm</a></p>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Address' : 'Adresse'} :</strong> Campus de l'Université de Yaoundé I, BP 337 Yaoundé, Cameroun</p>
                  </div>
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'none', justifyContent: 'center' }} className="mobile-back-btn">
                  <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, var(--or), var(--or-dark))', color: 'white', padding: '14px 28px', borderRadius: 50, fontSize: 'clamp(14px, 1vw, 15px)', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', width: 'auto', minWidth: '200px', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'; }}><Home size={18} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}</Link>
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'var(--texte-muted)' }}>
                  <p>{isEnglish ? 'Last updated:' : 'Dernière mise à jour :'} {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles responsifs */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .mobile-back-btn { display: flex !important; }
          .content-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
        }
        @media (max-width: 768px) {
          .container { padding: 0 16px !important; }
          section { padding: 32px 0 !important; }
        }
        @media (max-width: 480px) {
          .container { padding: 0 12px !important; }
          section { padding: 24px 0 !important; }
          .mobile-back-btn a { width: 100% !important; min-width: unset !important; padding: 12px 20px !important; font-size: 14px !important; }
          ul { padding-left: 16px !important; }
          li { word-break: break-word !important; }
        }
        @media (max-width: 360px) {
          .container { padding: 0 8px !important; }
          .mobile-back-btn a { padding: 10px 16px !important; font-size: 13px !important; }
        }
      `}</style>
    </Layout>
  );
}
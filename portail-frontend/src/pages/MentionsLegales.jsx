// pages/MentionsLegales.jsx - VERSION REFACTORISÉE
import Layout from '../components/layout/Layout';
import { Scale, Shield, FileText, Building, User, Mail, MapPin, ExternalLink, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function MentionsLegales() {
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
            <Scale size={14} /> {isEnglish ? 'LEGAL INFORMATION' : 'INFORMATIONS LÉGALES'}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            color: 'white',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 'clamp(8px, 1vw, 16px)'
          }}>
            {isEnglish ? 'Legal Notice' : 'Mentions Légales'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(14px, 1.2vw, 18px)',
            maxWidth: 640,
            marginTop: 0,
            lineHeight: 1.6
          }}>
            {isEnglish
              ? 'In accordance with current legal provisions in Cameroon, we inform you of the key legal information concerning the website of the Central University Library of Yaoundé I.'
              : 'Conformément aux dispositions légales en vigueur au Cameroun, nous vous informons des éléments constitutifs du site de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
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
            
            {/* Sommaire - caché sur tablette et mobile */}
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
                  { label: isEnglish ? 'Website editor' : 'Édition du site', id: 'edition' },
                  { label: isEnglish ? 'Publishing director' : 'Directeur de publication', id: 'directeur' },
                  { label: isEnglish ? 'Hosting' : 'Hébergement', id: 'hebergement' },
                  { label: isEnglish ? 'Intellectual property' : 'Propriété intellectuelle', id: 'propriete' },
                  { label: isEnglish ? 'Personal data' : 'Données personnelles', id: 'donnees' },
                  { label: 'Cookies', id: 'cookies' },
                  { label: isEnglish ? 'Hyperlinks' : 'Liens hypertextes', id: 'liens' },
                  { label: isEnglish ? 'Liability limitation' : 'Limitation de responsabilité', id: 'responsabilite' },
                  { label: isEnglish ? 'Applicable law' : 'Droit applicable', id: 'droit' },
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
                <p style={{ marginBottom: 24 }}>
                  {isEnglish
                    ? 'In accordance with Cameroonian law on personal data protection and electronic communications, we provide the legal information concerning the website of the Central University Library of Yaoundé I.'
                    : 'Conformément à la loi camerounaise relative à la protection des données à caractère personnel et à la communication électronique, nous vous présentons les informations légales concernant le site internet de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
                </p>

                <div id="edition" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Building size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Website editor' : 'Édition du site'}
                  </h2>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)', marginBottom: 12, overflow: 'hidden' }}>
                    <p style={{ marginBottom: 4, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Website :' : 'Site :'}</strong> {isEnglish ? 'Central University Library of Yaoundé I' : 'Bibliothèque Centrale Universitaire de Yaoundé I'}</p>
                    <p style={{ marginBottom: 4, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Address :' : 'Adresse :'}</strong> Campus de l'Université de Yaoundé I, BP 337 Yaoundé, Cameroun</p>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Contact :' : 'Contact :'}</strong>{' '}<a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>biblio.Bibliotheque@uy1.uninet.cm</a></p>
                  </div>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)' }}>
                    {isEnglish
                      ? 'The website is published by the Central University Library of Yaoundé I, a service of the University of Yaoundé I.'
                      : 'Le site est édité par la Bibliothèque Centrale Universitaire de Yaoundé I, service administratif de l\'Université de Yaoundé I.'}
                  </p>
                </div>

                <div id="directeur" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <User size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Publishing director' : 'Directeur de publication'}
                  </h2>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)', marginBottom: 12 }}>
                    <p style={{ marginBottom: 4, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Publishing director :' : 'Directeur de publication :'}</strong> {isEnglish ? 'Coordinator head  of the Central University Library' : 'Conservateur en chef de la Bibliothèque Centrale Universitaire'}</p>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Contact :' : 'Contact :'}</strong>{' '}<a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>biblio.Bibliotheque@uy1.uninet.cm</a></p>
                  </div>
                </div>

                <div id="hebergement" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Shield size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Hosting' : 'Hébergement'}
                  </h2>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)', marginBottom: 12 }}>
                    <p style={{ marginBottom: 4, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Host :' : 'Hébergeur :'}</strong> {isEnglish ? 'University of Yaoundé I – Information documentary Systems Department' : 'Université de Yaoundé I — Direction des Systèmes d\'Information Documetaire'}</p>
                    <p style={{ marginBottom: 4, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Address :' : 'Adresse :'}</strong> Campus de l'Université de Yaoundé I, BP 337 Yaoundé, Cameroun</p>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Contact :' : 'Contact :'}</strong>{' '}<a href="mailto:tangmo.bcuyi@gmail.com" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>tangmo.bcuyi@gmail.com</a></p>
                  </div>
                </div>

                <div id="propriete" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <FileText size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Intellectual property' : 'Propriété intellectuelle'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'All content published on the website of the Central University Library of Yaoundé I (texts, images, graphics, logos, icons, videos, databases, etc.) is protected by the provisions of the Cameroonian intellectual property code.'
                      : 'L\'ensemble des contenus présents sur le site de la Bibliothèque Centrale Universitaire de Yaoundé I (textes, images, graphismes, logos, icônes, vidéos, bases de données, etc.) est protégé par les dispositions du Code camerounais de la propriété intellectuelle.'}
                  </p>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'Any reproduction, representation, modification, publication, adaptation or distribution, in whole or in part, of the website content, by any means whatsoever, is prohibited without prior written authorization from the Central University Library of Yaoundé I.'
                      : 'Toute reproduction, représentation, modification, publication, adaptation ou distribution, totale ou partielle, des contenus du site, par quelque procédé que ce soit, est interdite sans l\'autorisation préalable écrite de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
                  </p>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)', borderLeft: '4px solid var(--or)' }}>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)' }}>
                      <strong>{isEnglish ? '⚠️ Exception :' : '⚠️ Exception :'}</strong> {isEnglish ? 'Research documents (theses, dissertations, articles) deposited on the institutional platform remain the property of their authors, in accordance with the deposit conditions.' : 'Les documents de recherche (thèses, mémoires, articles) déposés sur la plateforme institutionnelle restent la propriété de leurs auteurs, conformément aux conditions de dépôt.'}
                    </p>
                  </div>
                </div>

                <div id="donnees" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Mail size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Personal data' : 'Données personnelles'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'In accordance with Cameroonian law no. 2010/012 of 21 December 2010 on cybersecurity and personal data protection, we inform you that:'
                      : 'Conformément à la loi camerounaise n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et la protection des données à caractère personnel, nous vous informons que :'}
                  </p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li>{isEnglish ? 'Personal data is collected only for website purposes (request management, registration, etc.).' : 'Les données personnelles collectées sont utilisées uniquement pour les finalités du site (gestion des demandes, inscription, etc.).'}</li>
                    <li>{isEnglish ? 'You have a right of access, rectification and deletion of your personal data.' : 'Vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles.'}</li>
                    <li>{isEnglish ? 'Your data is not transferred to third parties without your explicit consent.' : 'Vos données ne sont pas transmises à des tiers sans votre consentement explicite.'}</li>
                  </ul>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)', borderLeft: '4px solid var(--green)' }}>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', wordBreak: 'break-word' }}><strong>{isEnglish ? '📧 DPO contact :' : '📧 Contact DPO :'}</strong>{' '}<a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>biblio.Bibliotheque@uy1.uninet.cm</a></p>
                  </div>
                </div>

                <div id="cookies" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Shield size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    Cookies
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'The website uses cookies to improve the user experience and analyze traffic. You can configure your browser to reject cookies, although some features may be limited.'
                      : 'Le site utilise des cookies pour améliorer l\'expérience utilisateur et analyser le trafic. Vous pouvez paramétrer votre navigateur pour refuser les cookies, mais certaines fonctionnalités pourraient être limitées.'}
                  </p>
                </div>

                <div id="liens" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <ExternalLink size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Hyperlinks' : 'Liens hypertextes'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'The site may contain links to external websites. The Central University Library of Yaoundé I is not responsible for the content of these sites and does not guarantee their accuracy or availability.'
                      : 'Le site peut contenir des liens vers des sites externes. La Bibliothèque Centrale Universitaire de Yaoundé I n\'est pas responsable du contenu de ces sites et ne garantit pas leur exactitude ou leur disponibilité.'}
                  </p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'Creating hyperlinks to the site of the Central University Library of Yaoundé I is authorized, provided the source is clearly indicated and the institutional image is not harmed.'
                      : 'La création de liens hypertextes vers le site de la Bibliothèque Centrale Universitaire de Yaoundé I est autorisée sous réserve de mentionner clairement la source et de ne pas nuire à l\'image de l\'institution.'}
                  </p>
                </div>

                <div id="responsabilite" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Scale size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Liability limitation' : 'Limitation de responsabilité'}
                  </h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'The Central University Library of Yaoundé I makes every effort to ensure the accuracy and regular updating of the information disseminated on this website. However, it cannot guarantee its completeness or the absence of errors.'
                      : 'La Bibliothèque Centrale Universitaire de Yaoundé I s\'efforce d\'assurer l\'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne peut garantir l\'exhaustivité ou l\'absence d\'erreur des informations.'}
                  </p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'The user is responsible for the way they use the information consulted on the site. The Central University Library of Yaoundé I cannot be held liable for direct or indirect damages arising from the use of this site.'
                      : 'L\'utilisateur est responsable de l\'utilisation qu\'il fait des informations consultées sur le site. La Bibliothèque Centrale Universitaire de Yaoundé I ne pourra être tenue responsable des dommages directs ou indirects résultant de l\'utilisation de ce site.'}
                  </p>
                </div>

                <div id="droit" style={{ scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <MapPin size={22} color="var(--or)" style={{ flexShrink: 0 }} />
                    {isEnglish ? 'Applicable law' : 'Droit applicable'}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {isEnglish
                      ? 'These legal notices are governed by Cameroonian law. Any dispute relating to the use of the site falls under the jurisdiction of the courts of Yaoundé.'
                      : 'Les présentes mentions légales sont régies par le droit camerounais. Tout litige relatif à l\'utilisation du site est soumis à la compétence des tribunaux de Yaoundé.'}
                  </p>
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'none', justifyContent: 'center' }} className="mobile-back-btn">
                  <Link 
                    to="/" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'linear-gradient(135deg, var(--or), var(--or-dark))',
                      color: 'white',
                      padding: '14px 28px',
                      borderRadius: 50,
                      fontSize: 'clamp(14px, 1vw, 15px)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                      width: 'auto',
                      minWidth: '200px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'; }}
                  >
                    <Home size={18} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}
                  </Link>
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
        /* Cache le sommaire sur tablette et mobile */
        @media (max-width: 1024px) {
          .sidebar-desktop {
            display: none !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
          .content-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }

        /* Ajustements pour tablettes */
        @media (max-width: 768px) {
          .container {
            padding: 0 16px !important;
          }
          section {
            padding: 32px 0 !important;
          }
          .sidebar-desktop {
            display: none !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
        }

        /* Ajustements pour mobiles */
        @media (max-width: 480px) {
          .container {
            padding: 0 12px !important;
          }
          section {
            padding: 24px 0 !important;
          }
          .mobile-back-btn a {
            width: 100% !important;
            min-width: unset !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          /* Ajustement des listes sur mobile */
          ul {
            padding-left: 16px !important;
          }
          li {
            word-break: break-word !important;
          }
        }

        /* Très petits écrans */
        @media (max-width: 360px) {
          .container {
            padding: 0 8px !important;
          }
          .mobile-back-btn a {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
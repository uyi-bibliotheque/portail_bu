// pages/CGV.jsx - VERSION REFACTORISÉE
import Layout from '../components/layout/Layout';
import { FileText, Shield, User, BookOpen, Upload, Search, Mail, Scale, Clock, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function CGV() {
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
            <FileText size={14} /> {isEnglish ? 'TERMS AND CONDITIONS' : 'CONDITIONS GÉNÉRALES'}
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            color: 'white',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 'clamp(8px, 1vw, 16px)'
          }}>
            {isEnglish ? 'Terms and Conditions of Use' : 'Conditions Générales d\'Utilisation'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(14px, 1.2vw, 18px)',
            maxWidth: 640,
            marginTop: 0,
            lineHeight: 1.6
          }}>
            {isEnglish
              ? 'These general conditions govern the use of the website and services of the Central University Library of Yaoundé I.'
              : 'Les présentes conditions générales régissent l\'utilisation du site de la Bibliothèque Centrale Universitaire de Yaoundé I et des services qui y sont proposés.'}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) 0', background: 'var(--beige)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'start' }} className="content-grid">
            <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 24px)', background: 'white', borderRadius: 16, padding: 'clamp(20px, 2.5vw, 28px)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'block' }} className="sidebar-desktop">
              <h3 style={{ fontSize: 'clamp(13px, 1vw, 14px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, letterSpacing: '0.04em' }}>{isEnglish ? 'Table of contents' : 'Sommaire'}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: isEnglish ? 'Purpose and scope' : 'Objet et champ d\'application', id: 'objet' },
                  { label: isEnglish ? 'Acceptance of TOS' : 'Acceptation des CGU', id: 'acceptation' },
                  { label: isEnglish ? 'Website access and use' : 'Accès et utilisation du site', id: 'acces' },
                  { label: isEnglish ? 'Offered services' : 'Services proposés', id: 'services' },
                  { label: isEnglish ? 'Registration and account' : 'Inscription et compte utilisateur', id: 'compte' },
                  { label: isEnglish ? 'Document submission' : 'Dépôt de documents', id: 'depot' },
                  { label: isEnglish ? 'Intellectual property' : 'Propriété intellectuelle', id: 'propriete' },
                  { label: isEnglish ? 'Liability' : 'Responsabilité', id: 'responsabilite' },
                  { label: isEnglish ? 'Changes to TOS' : 'Modification des CGU', id: 'modification' },
                  { label: isEnglish ? 'Applicable law' : 'Droit applicable et litiges', id: 'droit' },
                  { label: 'Contact', id: 'contact' },
                ].map(item => (
                  <li key={item.id}><a href={`#${item.id}`} style={{ fontSize: 'clamp(12px, 0.85vw, 13px)', color: 'var(--texte-muted)', display: 'block', padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s', textDecoration: 'none' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.color = 'var(--bleu-nuit)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--texte-muted)'; }}>{item.label}</a></li>
                ))}
              </ul>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'none' }} className="sidebar-back-btn"><Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--or)', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 12px', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--beige)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Home size={16} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}</Link></div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 'clamp(20px, 3vw, 48px)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', width: '100%', overflow: 'hidden' }}>
              <div style={{ fontSize: 'clamp(14px, 0.95vw, 15px)', lineHeight: 1.8, color: 'var(--texte)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                <div id="objet" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><FileText size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 1 – Purpose and scope' : 'Article 1 – Objet et champ d\'application'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'These General Terms and Conditions aim to define the terms and conditions for using the website and services of the Central University Library of Yaoundé I.' : 'Les présentes Conditions Générales d\'Utilisation ont pour objet de définir les modalités et conditions d\'utilisation du site internet de la Bibliothèque Centrale Universitaire de Yaoundé I et des services qu\'il propose.'}</p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'The TOS applies to any user of the site, whether a visitor or a registered user, from the first connection.' : 'Les CGU s\'appliquent à tout utilisateur du Site, qu\'il soit simple visiteur ou utilisateur enregistré, et s\'imposent à lui dès sa première connexion.'}</p>
                </div>

                <div id="acceptation" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Shield size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 2 – Acceptance of the TOS' : 'Article 2 – Acceptation des CGU'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Use of the Site implies full acceptance of these TOS by the user. The user acknowledges having read them and agrees to respect them.' : 'L\'utilisation du Site implique l\'acceptation pleine et entière des présentes CGU par l\'utilisateur.'}</p>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(12px, 1.5vw, 20px)', borderLeft: '4px solid var(--or)' }}><p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)' }}><strong>⚠️ {isEnglish ? 'Important' : 'Important'} :</strong> {isEnglish ? 'If you do not accept these TOS, you may not use the Site or its services.' : 'Si vous n\'acceptez pas les présentes CGU, vous ne pouvez pas utiliser le Site ni ses services.'}</p></div>
                </div>

                <div id="acces" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Search size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 3 – Access and use of the Site' : 'Article 3 – Accès et utilisation du Site'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'The Site is freely accessible to any user with internet access.' : 'Le Site est accessible gratuitement à tout utilisateur disposant d\'un accès à Internet.'}</p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'However, access may be suspended or limited at any time for technical, security or force majeure reasons.' : 'Cependant, l\'accès au Site peut être suspendu ou limité à tout moment pour des raisons de maintenance technique, de sécurité ou de force majeure.'}</p>
                </div>

                <div id="services" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><BookOpen size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 4 – Offered services' : 'Article 4 – Services proposés'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'The Site offers the following services:' : 'Le Site propose les services suivants :'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(10px, 1.2vw, 12px)' }}>
                    {[
                      { icon: '📚', label: 'OPAC Catalog', desc: isEnglish ? 'Online catalog consultation' : 'Consultation du catalogue en ligne' },
                      { icon: '📝', label: isEnglish ? 'Institutional archives' : 'Archives institutionnelles', desc: isEnglish ? 'Submitted theses and dissertations' : 'Thèses et mémoires déposés' },
                      { icon: '📤', label: isEnglish ? 'Document submission' : 'Dépôt de documents', desc: isEnglish ? 'Submit theses and dissertations' : 'Soumission de mémoires et thèses' },
                      { icon: '🌐', label: isEnglish ? 'Electronic resources' : 'Ressources électroniques', desc: isEnglish ? 'Databases and journals' : 'Bases de données et revues' },
                      { icon: '📅', label: isEnglish ? 'News and events' : 'Actualités et événements', desc: isEnglish ? 'Library activities' : 'Activités de la bibliothèque' },
                      { icon: '📧', label: isEnglish ? 'Contact and request' : 'Contact et demande', desc: isEnglish ? 'Contact form' : 'Formulaire de contact' },
                    ].map((item, idx) => (<div key={idx} style={{ background: 'var(--beige)', borderRadius: 10, padding: 'clamp(10px, 1.2vw, 16px)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}><span style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', flexShrink: 0 }}>{item.icon}</span><div style={{ fontWeight: 600, fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'var(--bleu-nuit)' }}>{item.label}</div></div><div style={{ fontSize: 'clamp(10px, 0.7vw, 12px)', color: 'var(--texte-muted)', paddingLeft: 'clamp(28px, 2.5vw, 34px)' }}>{item.desc}</div></div>))}
                  </div>
                </div>

                <div id="compte" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><User size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 5 – Registration and user account' : 'Article 5 – Inscription et compte utilisateur'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Access to certain services requires creating a user account.' : 'L\'accès à certains services nécessite la création d\'un compte utilisateur.'}</p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li><strong>{isEnglish ? 'Validation' : 'Validation'} :</strong> {isEnglish ? 'The registration is validated by the library after checking the information provided.' : 'L\'inscription est validée par la bibliothèque après vérification des informations fournies'}</li>
                    <li><strong>{isEnglish ? 'Access' : 'Accès'} :</strong> {isEnglish ? 'The account grants access to services reserved for the university community.' : 'Le compte donne accès aux services réservés aux membres de la communauté universitaire'}</li>
                    <li><strong>{isEnglish ? 'Deletion' : 'Suppression'} :</strong> {isEnglish ? 'The library may suspend or delete an account in case of violation of the TOS.' : 'La bibliothèque se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des CGU'}</li>
                  </ul>
                </div>

                <div id="depot" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Upload size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 6 – Document submission' : 'Article 6 – Dépôt de documents'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'Users may submit research works (dissertations, theses) through the institutional deposit platform.' : 'Les utilisateurs peuvent déposer leurs travaux de recherche (mémoires, thèses) sur la plateforme de dépôt institutionnel.'}</p>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8 }}>{isEnglish ? 'Submission conditions:' : 'Conditions de dépôt :'}</h4>
                    <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)' }}>
                      <li>{isEnglish ? 'The document must be the result of original research work.' : 'Le document doit être le fruit d\'un travail de recherche original'}</li>
                      <li>{isEnglish ? 'The author must hold rights to the submitted document.' : 'L\'auteur doit détenir les droits sur le document déposé'}</li>
                      <li>{isEnglish ? 'The document is submitted to validation by the library.' : 'Le document est soumis à une validation par la bibliothèque'}</li>
                      <li>{isEnglish ? 'The submission is made under a Creative Commons licence (CC BY-NC-ND).' : 'Le dépôt est effectué sous licence Creative Commons (CC BY-NC-ND)'}</li>
                    </ul>
                  </div>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'By submitting a document, the author authorizes the Central University Library of Yaoundé I to disseminate and preserve it on its platform.' : 'En déposant un document, l\'auteur autorise la Bibliothèque Centrale Universitaire de Yaoundé I à le diffuser sur sa plateforme et à en assurer la conservation.'}</p>
                </div>

                <div id="propriete" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><BookOpen size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 7 – Intellectual property' : 'Article 7 – Propriété intellectuelle'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'All Site content (texts, images, logos, databases, etc.) is protected by copyright and neighboring rights.' : 'L\'ensemble des contenus du Site (textes, images, logos, bases de données, etc.) est protégé par le droit d\'auteur et les droits voisins.'}</p>
                  <ul style={{ paddingLeft: 'clamp(20px, 2vw, 24px)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    <li><strong>{isEnglish ? 'Site content' : 'Contenu du Site'} :</strong> {isEnglish ? 'Exclusive property of the Central University Library of Yaoundé I' : 'Propriété exclusive de la Bibliothèque Centrale Universitaire de Yaoundé I'}</li>
                    <li><strong>{isEnglish ? 'Submitted documents' : 'Documents déposés'} :</strong> {isEnglish ? 'Owned by their authors under a Creative Commons licence' : 'Propriété de leurs auteurs, sous licence Creative Commons'}</li>
                  </ul>
                </div>

                <div id="responsabilite" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Scale size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 8 – Liability' : 'Article 8 – Responsabilité'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'The Central University Library of Yaoundé I strives to ensure the accuracy and updating of information published on the Site.' : 'La Bibliothèque Centrale Universitaire de Yaoundé I s\'efforce d\'assurer l\'exactitude et la mise à jour des informations diffusées sur le Site.'}</p>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'However, it cannot be held responsible for errors, interruptions or external content.' : 'Toutefois, elle ne peut être tenue responsable des erreurs, interruptions ou contenus externes.'}</p>
                </div>

                <div id="modification" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Clock size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 9 – Changes to the TOS' : 'Article 9 – Modification des CGU'}</h2>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'The Central University Library of Yaoundé I reserves the right to modify these TOS at any time.' : 'La Bibliothèque Centrale Universitaire de Yaoundé I se réserve le droit de modifier les présentes CGU à tout moment.'}</p>
                </div>

                <div id="droit" style={{ marginBottom: 40, scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Scale size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 10 – Applicable law and disputes' : 'Article 10 – Droit applicable et litiges'}</h2>
                  <p style={{ marginBottom: 12, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{isEnglish ? 'These TOS are governed by Cameroonian law. Any dispute will be submitted to the courts of Yaoundé.' : 'Les présentes CGU sont régies par le droit camerounais. Tout litige relatif à l\'interprétation ou à l\'exécution des CGU sera soumis à la compétence exclusive des tribunaux de Yaoundé.'}</p>
                </div>

                <div id="contact" style={{ scrollMarginTop: 'calc(var(--header-h) + 24px)' }}>
                  <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Mail size={22} color="var(--or)" style={{ flexShrink: 0 }} /> {isEnglish ? 'Article 11 – Contact' : 'Article 11 – Contact'}</h2>
                  <div style={{ background: 'var(--beige)', borderRadius: 12, padding: 'clamp(14px, 2vw, 24px)' }}>
                    <p style={{ marginBottom: 8, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Central University Library of Yaoundé I' : 'Bibliothèque Centrale Universitaire de Yaoundé I'}</strong></p>
                    <p style={{ marginBottom: 8, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Address' : 'Adresse'} :</strong> Campus de l'Université de Yaoundé I, BP 337 Yaoundé, Cameroun</p>
                    <p style={{ marginBottom: 8, fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>Email :</strong>{' '}<a href="mailto:biblio.Bibliotheque@uy1.uninet.cm" style={{ color: 'var(--or)', wordBreak: 'break-all' }}>biblio.Bibliotheque@uy1.uninet.cm</a></p>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', wordBreak: 'break-word' }}><strong>{isEnglish ? 'Phone' : 'Téléphone'} :</strong> +237 242 06 47 28</p>
                  </div>
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'none', justifyContent: 'center' }} className="mobile-back-btn"><Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, var(--or), var(--or-dark))', color: 'white', padding: '14px 28px', borderRadius: 50, fontSize: 'clamp(14px, 1vw, 15px)', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', width: 'auto', minWidth: '200px', justifyContent: 'center' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'; }}><Home size={18} /> {isEnglish ? 'Back to home' : 'Retour à l\'accueil'}</Link></div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 'clamp(11px, 0.8vw, 13px)', color: 'var(--texte-muted)' }}><p>{isEnglish ? 'Last updated:' : 'Dernière mise à jour :'} {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
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
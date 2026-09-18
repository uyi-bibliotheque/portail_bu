// pages/SectionsPage_final.jsx - VERSION AVEC MODAL CLAIR ET LUMINEUX (CORRIGÉ)

import Layout from '../components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';

// ═══════════════════════════════════════════════════════════════════
// ─── IMPORTS DE TOUTES LES PHOTOS ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// COORDINATION
import imgMarieJoseEssi from '../assets/images/responsable/coordination/PrMarie-JoséEssi.jpg';

// DRA
import imgNancyBilooEkoto from '../assets/images/responsable/dra/MadameNancyEkoto.jpg';
import imgPeguyTassapoPouokamDRA from '../assets/images/responsable/dra/MadamePeguyTassapoPouokam.jpg';
import imgDaoudaWusthitengam from '../assets/images/responsable/dra/MonsieurDaoudaWusthitengam.jpg';
import imgCharlesEkoKotto from '../assets/images/responsable/dra/MonsieurCharlesEkoKotto.jpg';
import imgNdipMaryArrah from '../assets/images/responsable/dra/MadameNdipMaryArrah.jpg';
import imgBertinNdongoEvezo from '../assets/images/responsable/dra/MonsieurBertinNdongoEvezo.jpg';
import imgAnneMarieAkamba from '../assets/images/responsable/dra/MadameAnneMarieAkamba.jpg';
import imgFlammarionNokoEdjeba from '../assets/images/responsable/dra/MonsieurFlammarionNokoEdjeba.jpg';
import imgModesteBaaneAssembe from '../assets/images/responsable/dra/MadameModesteBaaneAssembe.jpg';
import imgReneMinko from '../assets/images/responsable/dra/MonsieurReneMinko.jpg';
import imgMarieRoseKohn from '../assets/images/responsable/dra/MadameMarieRoseKohn.jpg';
import imgDayangHoulibele from '../assets/images/responsable/dra/MadameDayangHoulibele.jpg';
import imgZakariahouLitouot from '../assets/images/responsable/dra/MonsieurZakariahouLitouot.jpg';
import imgAlexanderLyongaNasie from '../assets/images/responsable/dra/MonsieurAlexanderLyongaNasie.jpg';
import imgIgnaceBlaiseOlli from '../assets/images/responsable/dra/MonsieurIgnaceBlaiseOlli.jpg';
import imgMinetteVouffoAwozang from '../assets/images/responsable/dra/MadameMinetteVouffoAwozang.jpg';
import imgIBO from '../assets/images/responsable/dra/MonsieurIBO.jpg';
import imgPierreEmileAbouou from '../assets/images/responsable/dra/MonsieurPierreEmileAbouou.jpg';

// DACA
import imgViragoLeonieKenne from '../assets/images/responsable/daca/MadameViragoLéonieKenne.jpg';
import imgMicheleRosyAnkoumaSob from '../assets/images/responsable/daca/MadameMicheleRosyAnkoumaSob.jpg';
import imgMarcOlivierMindjeme from '../assets/images/responsable/daca/MonsieurMarcOlivierMindjeme.jpg';
import imgVictorineNgueNgougno from '../assets/images/responsable/daca/MadameVictorineNgueNgougno.jpg';
import imgOgenPrudenciaMafor from '../assets/images/responsable/daca/MadameOgenPrudenciaMafor.jpg';

// DACN
import imgAnneMarieAkambaDACN from '../assets/images/responsable/dacn/MadameAnneMarieAkamba.jpg';
import imgNkoloPrudenceNiclaire from '../assets/images/responsable/dacn/MadameNkoloPrudenceNiclaire.jpg';
import imgNancyBilooEkotoDACN from '../assets/images/responsable/dacn/MadameNancyBilooEkoto.jpg';
import imgEstherFloreMoussi from '../assets/images/responsable/dacn/MadameEstherFloreMoussi.jpg';
import imgTNL from '../assets/images/responsable/dacn/MonsieurTNL.jpg';

// DRI
import imgNorbertTangmo from '../assets/images/responsable/dri/MonsieurNorbertTangmo.jpg';
import imgMauriceKiteng from '../assets/images/responsable/dri/MonsieurMauriceKiteng.jpg';

// ═══════════════════════════════════════════════════════════════════
// ─── MODAL POUR AGRANDIR LES PHOTOS - VERSION CLAIRE (PORTAL) ─────
// ═══════════════════════════════════════════════════════════════════

function PhotoModal({ src, name, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
        padding: 'clamp(12px, 3vw, 24px)',
        animation: 'fadeIn 0.3s ease',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        isolation: 'isolate'
      }}
      onClick={handleBackdropClick}
    >
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes scaleIn { 
          from { transform: scale(0.85); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,165,0,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(255,165,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,165,0,0); }
        }
        @media (max-width: 640px) {
          .photo-modal-close {
            top: -12px !important;
            right: -12px !important;
            width: 40px !important;
            height: 40px !important;
          }
          .photo-modal-close svg {
            width: 22px !important;
            height: 22px !important;
          }
        }
      `}</style>
      <div 
        style={{
          position: 'relative',
          maxWidth: 'min(92vw, 900px)',
          maxHeight: '92vh',
          width: 'auto',
          background: 'white',
          borderRadius: 'clamp(12px, 2vw, 20px)',
          padding: 'clamp(12px, 2.5vw, 24px)',
          animation: 'scaleIn 0.4s ease',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          cursor: 'default',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="photo-modal-close"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: -16,
            right: -16,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'white',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1B1464',
            transition: 'all 0.3s ease',
            zIndex: 10,
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.background = '#7C3AED';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#1B1464';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 20px)',
          minHeight: 0,
          flex: 1
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f8f8',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            overflow: 'hidden',
            position: 'relative',
            flex: 1,
            minHeight: 0
          }}>
            <img 
              src={src} 
              alt={name}
              style={{
                maxWidth: '100%',
                maxHeight: 'min(70vh, 600px)',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 'clamp(6px, 1vw, 8px)',
                display: 'block'
              }}
            />
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '0 20px 8px 20px',
            borderBottom: '3px solid #7C3AED',
            paddingBottom: 12,
            width: '100%'
          }}>
            <div style={{
              fontSize: 'clamp(18px, 2.5vw, 32px)',
              fontWeight: 700,
              color: '#1B1464',
              letterSpacing: '0.02em',
              lineHeight: 1.2
            }}>
              {name}
            </div>
            <div style={{
              fontSize: 'clamp(11px, 0.9vw, 14px)',
              color: '#888',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#7C3AED',
                marginRight: 4
              }} />
              Cliquez à l'extérieur ou appuyez sur Échap pour fermer
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANT PHOTO AVEC MODAL ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function ResponsablePhoto({ src, name, size = 'clamp(70px, 8vw, 100px)', showName = true }) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length-1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1
        }}
        onClick={openModal}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(e); } }}
        aria-label={`Voir la photo de ${name}`}
      >
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1B1464, #2D2178)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #7C3AED',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.2)',
          fontSize: typeof size === 'string' ? 'clamp(24px, 2.5vw, 32px)' : `${parseInt(size) * 0.35}px`,
          fontWeight: 700,
          color: 'white',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          {src && !imageError ? (
            <img 
              src={src} 
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <span style={{ fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 700, color: 'white' }}>
              {initials}
            </span>
          )}
          <div style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            background: 'rgba(27,20,100,0.8)',
            borderRadius: '50%',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #7C3AED',
            pointerEvents: 'none'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </div>
        </div>
        {showName && (
          <span style={{
            fontSize: 'clamp(11px, 0.8vw, 13px)',
            fontWeight: 500,
            color: '#1B1464',
            textAlign: 'center',
            maxWidth: typeof size === 'string' ? size : `${size}px`,
            lineHeight: 1.2,
            wordBreak: 'break-word'
          }}>
            {name}
          </span>
        )}
      </div>
      {modalOpen && (
        <PhotoModal 
          src={src} 
          name={name} 
          onClose={closeModal}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── COMPOSANT UNITÉ ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function UnitCard({ unit, color, isEnglish }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 1.2vw, 14px)',
      padding: 'clamp(10px, 1vw, 14px) clamp(12px, 1.5vw, 18px)',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e8e8e8',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      width: '100%',
      minHeight: 'clamp(60px, 6vw, 72px)',
      position: 'relative',
      zIndex: 1
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#f8f8f8';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: 2
      }}>
        <div style={{
          background: color || '#1B1464',
          color: 'white',
          padding: '2px 10px',
          borderRadius: 4,
          fontSize: 'clamp(8px, 0.65vw, 9px)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}>
          {isEnglish ? 'Unit' : 'Unité'}
        </div>
      </div>
      <ResponsablePhoto 
        src={unit.photo} 
        name={unit.responsable} 
        size="clamp(45px, 5vw, 55px)" 
        showName={false}
      />
      <div style={{ 
        flex: 1, 
        minWidth: '80px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 'clamp(12px, 0.9vw, 14px)', 
          color: '#1B1464',
          marginBottom: 2,
          lineHeight: 1.3,
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {unit.name}
        </div>
        <div style={{ 
          fontSize: 'clamp(10px, 0.75vw, 12px)', 
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ wordBreak: 'break-word' }}>{isEnglish ? 'Head:' : 'Responsable :'} {unit.responsable}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── DONNÉES COMPLÈTES ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const departmentsData = [
  {
    id: 'dra',
    name: 'Département des Ressources Administratives (DRA)',
    responsable: 'Madame Nancy Bilo\'o Ekoto',
    responsablePhoto: imgNancyBilooEkoto,
    color: '#1B1464',
    sections: [
      {
        title: 'Ressources Financières',
        responsable: 'Madame Péguy Tassapo Pouokam',
        responsablePhoto: imgPeguyTassapoPouokamDRA,
        units: [
          { name: 'Budget et comptabilité', responsable: 'Pr Marie-José Essi', photo: imgMarieJoseEssi },
          { name: 'États et réception', responsable: 'Madame Anne-Marie Akamba', photo: imgAnneMarieAkamba },
          { name: 'Suivi et reporting', responsable: 'Monsieur Flammarion Noko Edjeba', photo: imgFlammarionNokoEdjeba }
        ]
      },
      {
        title: 'Ressources Matérielles',
        responsable: 'Monsieur Daouda Wusthitengam',
        responsablePhoto: imgDaoudaWusthitengam,
        units: [
          { name: 'Gestion des matières', responsable: 'Monsieur Daouda Wusthitengam', photo: imgDaoudaWusthitengam },
          { name: 'Salubrité', responsable: 'Madame Modeste Ba\'ane Assembe', photo: imgModesteBaaneAssembe },
          { name: 'Maintenance', responsable: 'Monsieur René Minko', photo: imgReneMinko }
        ]
      },
      {
        title: 'Ressources Humaines',
        responsable: 'Monsieur Charles Eko Kotto',
        responsablePhoto: imgCharlesEkoKotto,
        units: [
          { name: 'Carrière', responsable: 'Monsieur Charles Eko Kotto', photo: imgCharlesEkoKotto },
          { name: 'Liaison DAAF', responsable: 'Madame Marie-Rose Kohn', photo: imgMarieRoseKohn },
          { name: 'Performance', responsable: 'Pr Marie-José Essi', photo: imgMarieJoseEssi }
        ]
      },
      {
        title: 'Gestion des Usagers',
        responsable: 'Madame Ndip Mary Arrah',
        responsablePhoto: imgNdipMaryArrah,
        units: [
          { name: 'Accueil', responsable: 'Monsieur Dayang Houlibele', photo: imgDayangHoulibele },
          { name: 'Salles de lecture', responsable: 'Monsieur Zakariahou Litouot', photo: imgZakariahouLitouot },
          { name: 'Renseignements', responsable: 'Monsieur Alexander Lyonga Nasie', photo: imgAlexanderLyongaNasie },
          { name: 'Cartes d\'accès', responsable: 'Monsieur Ignace Blaise Olli', photo: imgIgnaceBlaiseOlli }
        ]
      },
      {
        title: 'Gestion de l\'Effectivité au Poste',
        responsable: 'Monsieur Bertin Ndongo Evezo\'o',
        responsablePhoto: imgBertinNdongoEvezo,
        units: [
          { name: 'Permanence travail spécial', responsable: 'Monsieur Bertin Ndongo Evezo\'o', photo: imgBertinNdongoEvezo },
          { name: 'Suivi de la régularité', responsable: 'Madame Minette Vouffo Awozang', photo: imgMinetteVouffoAwozang },
          { name: 'Liaison Secrétariat général', responsable: 'Monsieur IBO', photo: imgIBO }
        ]
      }
    ]
  },
  {
    id: 'daca',
    name: 'Département Accès aux Collections Analogiques (DACA)',
    responsable: 'Madame Virago Léonie Kenne',
    responsablePhoto: imgViragoLeonieKenne, // 
    color: '#3184a5',
    sections: [
      {
        title: 'Acquisition et Conservation',
        responsable: 'Madame Michele Rosy Ankouma Sob',
        responsablePhoto: imgMicheleRosyAnkoumaSob,
        units: [
          { name: 'Acquisition et enregistrement', responsable: 'Madame Ndip Mary Arrah', photo: imgNdipMaryArrah },
          { name: 'Gestion des rayons', responsable: 'Monsieur Zakariahou Litouot et Monsieur Pierre Emile Abou\'ou', photo: imgPierreEmileAbouou },
          { name: 'Reliure et restauration', responsable: 'Monsieur Bertin Ndongo Evezo\'o', photo: imgBertinNdongoEvezo }
        ]
      },
      {
        title: 'Traitement Intellectuel',
        responsable: 'Monsieur Marc Olivier Mindjeme',
        responsablePhoto: imgMarcOlivierMindjeme,
        units: [
          { name: 'Indexation', responsable: 'Monsieur Marc Olivier Mindjeme', photo: imgMarcOlivierMindjeme },
          { name: 'Classification', responsable: 'Monsieur Maurice Kiteng', photo: imgMauriceKiteng },
          { name: 'Catalogage', responsable: 'Madame Virago Léonie Kenne', photo: imgViragoLeonieKenne } // ✅ CORRIGÉ
        ]
      },
      {
        title: 'Catalogues',
        responsable: 'Madame Victorine Ngue Ngougno',
        responsablePhoto: imgVictorineNgueNgougno,
        units: [
          { name: 'Conception', responsable: 'Madame Victorine Ngue Ngougno', photo: imgVictorineNgueNgougno },
          { name: 'Fiches normalisées', responsable: 'Madame Modeste Ba\'ane Assembe', photo: imgModesteBaaneAssembe },
          { name: 'Saisie', responsable: 'Madame Ogen Prudencia Mafor', photo: imgOgenPrudenciaMafor }
        ]
      }
    ]
  },
  {
    id: 'dacn',
    name: 'Département Accès aux Collections Numériques (DACN)',
    responsable: 'Madame Anne-Marie Akamba Ngwba',
    responsablePhoto: imgAnneMarieAkambaDACN,
    color: '#059669',
    sections: [
      {
        title: 'Monographies Numériques',
        responsable: 'Docteur Nkolo Prudence Niclaire',
        responsablePhoto: imgNkoloPrudenceNiclaire,
        units: [
          { name: 'Acquisition', responsable: 'Docteur Nkolo Prudence Niclaire', photo: imgNkoloPrudenceNiclaire },
          { name: 'Traitement', responsable: 'Madame Anne-Marie Akamba Ngwba', photo: imgAnneMarieAkambaDACN },
          { name: 'Valorisation', responsable: 'Monsieur TNL', photo: imgTNL }
        ]
      },
      {
        title: 'Connaissances Numériques',
        responsable: 'Madame Nancy Bilo\'o Ekoto',
        responsablePhoto: imgNancyBilooEkotoDACN,
        units: [
          { name: 'Acquisition', responsable: 'Madame Minette Vouffo Awozang', photo: imgMinetteVouffoAwozang },
          { name: 'Traitement', responsable: 'Madame Anne-Marie Akamba Ngwba', photo: imgAnneMarieAkambaDACN },
          { name: 'Valorisation', responsable: 'Pr Marie-José Essi', photo: imgMarieJoseEssi }
        ]
      },
      {
        title: 'Périodiques',
        responsable: 'Madame Esther Flore Moussi',
        responsablePhoto: imgEstherFloreMoussi,
        units: [
          { name: 'Sélection', responsable: 'Madame Victorine Ngue Ngougno', photo: imgVictorineNgueNgougno },
          { name: 'Abonnement', responsable: 'Pr Marie-José Essi', photo: imgMarieJoseEssi },
          { name: 'Promotion', responsable: 'Madame Esther Flore Moussi', photo: imgEstherFloreMoussi }
        ]
      }
    ]
  },
  {
    id: 'dri',
    name: 'Département des Ressources Informatiques (DRI)',
    responsable: 'Monsieur Norbert Tangmo',
    responsablePhoto: imgNorbertTangmo,
    color: '#6366f1',
    sections: [
      {
        title: 'Système Intégré de Gestion de Bibliothèque',
        responsable: 'Monsieur Norbert Tangmo',
        responsablePhoto: imgNorbertTangmo,
        units: [
          { name: 'Catalogage', responsable: 'Madame Michele Rosy Ankouma Sob', photo: imgMicheleRosyAnkoumaSob },
          { name: 'Web, Réseaux et Sécurité', responsable: 'Monsieur Norbert Tangmo', photo: imgNorbertTangmo },
          { name: 'OPAC', responsable: 'Pr Marie-José Essi', photo: imgMarieJoseEssi }
        ]
      },
      {
        title: 'Services Documentaires',
        responsable: 'Monsieur Maurice Kiteng',
        responsablePhoto: imgMauriceKiteng,
        units: [
          { name: 'Bibliothèque numérique', responsable: 'Madame Anne-Marie Akamba Ngwba', photo: imgAnneMarieAkambaDACN },
          { name: 'Veille informationnelle', responsable: 'Madame Victorine Ngue Ngougno', photo: imgVictorineNgueNgougno },
          { name: 'Accès aux ressources', responsable: 'Monsieur Alexander Lyonga Nasie', photo: imgAlexanderLyongaNasie }
        ]
      },
      {
        title: 'Sciences Ouvertes et Formation',
        responsable: 'Pr Marie-José Essi',
        responsablePhoto: imgMarieJoseEssi,
        units: [
          { name: 'Réseaux documentaires', responsable: 'Madame Nancy Bilo\'o Ekoto', photo: imgNancyBilooEkoto },
          { name: 'Licences numériques', responsable: 'Madame Virago Léonie Kenne', photo: imgViragoLeonieKenne }, // ✅ CORRIGÉ
          { name: 'Transfert de compétences', responsable: 'Monsieur Norbert Tangmo', photo: imgNorbertTangmo }
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════
// ─── SECTIONSPAGE ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export function SectionsPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  console.log("✅ SectionsPage FINAL avec Layout");

  const totalDepartments = departmentsData.length;
  const totalSections = departmentsData.reduce((acc, d) => acc + d.sections.length, 0);
  const totalUnits = departmentsData.reduce((acc, d) => acc + d.sections.reduce((a, s) => a + (s.units ? s.units.length : 0), 0), 0);

  return (
    <Layout noReveal={true}>
      <Helmet>
        <title>Organisation de la Bibliothèque Centrale - BCU UYI</title>
        <meta name="description" content="Découvrez l'organisation de la Bibliothèque Centrale de l'Université de Yaoundé I." />
      </Helmet>

      <div style={{ padding: 'clamp(20px, 3vw, 40px)', background: '#f5f5f5', minHeight: '100vh' }}>
        {/* HEADER */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1B1464 0%, #2D2178 100%)',
          padding: 'clamp(30px, 4vw, 50px) clamp(20px, 3vw, 40px)',
          borderRadius: '12px',
          marginBottom: 'clamp(30px, 4vw, 50px)'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(28px, 4vw, 42px)',
            color: 'white',
            fontWeight: 400,
            marginBottom: 8
          }}>
            {isEnglish ? 'Organization of the ' : 'Organisation '}<span style={{ color: '#9028b9' }}>{isEnglish ? 'BC-UYI' : 'de la BC-UYI'}</span>
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)',
            fontSize: 'clamp(14px, 1vw, 16px)'
          }}>
            {isEnglish
              ? `${totalDepartments} departments · ${totalSections} sections · ${totalUnits} units`
              : `${totalDepartments} départements · ${totalSections} sections · ${totalUnits} unités`}
          </p>
        </div>

        {/* CARTES DES DÉPARTEMENTS */}
        {departmentsData.map((dept) => (
          <div key={dept.id} style={{
            marginBottom: 'clamp(30px, 4vw, 50px)',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            {/* En-tête département */}
            <div style={{
              padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 32px)',
              background: dept.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(16px, 2vw, 24px)',
              flexWrap: 'wrap'
            }}>
              <ResponsablePhoto 
                src={dept.responsablePhoto} 
                name={dept.responsable} 
                size="clamp(80px, 10vw, 120px)" 
              />
              <div style={{ flex: 1, minWidth: '150px' }}>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 1.6vw, 24px)', 
                  fontWeight: 700, 
                  marginBottom: 2
                }}>
                  {dept.name}
                </h3>
                <p style={{ 
                  fontSize: 'clamp(13px, 0.95vw, 15px)', 
                  opacity: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {isEnglish ? 'Head:' : 'Responsable :'} {dept.responsable}
                </p>
              </div>
              <span style={{
                fontSize: 'clamp(12px, 0.85vw, 14px)',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 16px',
                borderRadius: 50,
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {isEnglish ? `${dept.sections.length} sections` : `${dept.sections.length} sections`}
              </span>
            </div>

            {/* Sections */}
            <div style={{ padding: 'clamp(16px, 2vw, 24px) clamp(20px, 3vw, 32px)' }}>
              {dept.sections.map((section, secIdx) => (
                <div key={secIdx} style={{
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  borderRadius: '10px',
                  padding: 'clamp(16px, 2vw, 24px)',
                  marginBottom: secIdx < dept.sections.length - 1 ? 'clamp(16px, 2vw, 20px)' : 0,
                  borderLeft: `4px solid ${dept.color}`
                }}>
                  {/* Section - avec badge "SECTION" */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(12px, 1.5vw, 20px)',
                    marginBottom: 'clamp(12px, 1.5vw, 16px)',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: dept.color,
                      color: 'white',
                      padding: '2px 14px',
                      borderRadius: 4,
                      fontSize: 'clamp(10px, 0.8vw, 12px)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      {isEnglish ? 'Section' : 'Section'}
                    </div>
                    <ResponsablePhoto 
                      src={section.responsablePhoto} 
                      name={section.responsable} 
                      size="clamp(60px, 7vw, 80px)" 
                    />
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <h4 style={{ 
                        fontWeight: 700, 
                        fontSize: 'clamp(16px, 1.2vw, 19px)', 
                        color: '#1B1464',
                        marginBottom: 2
                      }}>
                        {section.title}
                      </h4>
                      <p style={{ 
                        fontSize: 'clamp(13px, 0.95vw, 15px)', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexWrap: 'wrap'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dept.color} strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <strong>{isEnglish ? 'Head:' : 'Responsable :'}</strong> <span style={{ wordBreak: 'break-word' }}>{section.responsable}</span>
                      </p>
                    </div>
                    <span style={{
                      fontSize: 'clamp(11px, 0.8vw, 12px)',
                      background: '#f0f0f0',
                      padding: '2px 12px',
                      borderRadius: 50,
                      color: '#666',
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      {isEnglish ? `${section.units.length} units` : `${section.units.length} unités`}
                    </span>
                  </div>

                  {/* Unités - avec grille responsive */}
                  {section.units && section.units.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: 'clamp(10px, 1.2vw, 14px)',
                      marginTop: 'clamp(12px, 1.5vw, 16px)',
                      paddingTop: 'clamp(12px, 1.5vw, 16px)',
                      borderTop: '1px dashed #e0e0e0'
                    }}>
                      {section.units.map((unit, uIdx) => (
                        <UnitCard key={uIdx} unit={unit} color={dept.color} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* STATISTIQUES */}
        <div style={{
          padding: 'clamp(24px, 3vw, 36px)',
          background: 'linear-gradient(135deg, #1B1464 0%, #2D2178 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)'
          }}>
            <div>
              <div style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800, color: '#7C3AED' }}>{totalDepartments}</div>
              <div style={{ fontSize: 'clamp(13px, 0.95vw, 15px)', opacity: 0.8 }}>{isEnglish ? 'Departments' : 'Départements'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800, color: '#7C3AED' }}>{totalSections}</div>
              <div style={{ fontSize: 'clamp(13px, 0.95vw, 15px)', opacity: 0.8 }}>{isEnglish ? 'Sections' : 'Sections'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 800, color: '#7C3AED' }}>{totalUnits}</div>
              <div style={{ fontSize: 'clamp(13px, 0.95vw, 15px)', opacity: 0.8 }}>{isEnglish ? 'Units' : 'Unités'}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
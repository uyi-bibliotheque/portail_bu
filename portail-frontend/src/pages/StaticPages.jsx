// pages/StaticPages.jsx - VERSION COMPLÈTE BILINGUE (FR + EN) - MISE À JOUR FINALE

import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import Reveal from '../components/Reveal';
import { useLanguage } from '../contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { createPortal } from 'react-dom';
import {
  ArrowRight, Clock, MapPin, Phone, Mail, ExternalLink,
  ChevronRight, Users, BookOpen, GraduationCap, Wifi,
  Award, Sparkles, Building2, Calendar, CheckCircle,
  Globe, Database, Server, Shield, Zap, Heart, Search,
  FileText, AlertCircle, Download, FileDown, Share2, Copy,
  Target, Eye, Menu, X, User, UserCheck, UserCircle,
  Layers, FolderOpen, Network, Library, Archive, Cloud,
  LayoutGrid, PenTool, BarChart, Briefcase, CreditCard,
  Home, Bookmark, Award as AwardIcon, ClipboardList, UserPlus,
  Maximize2, XCircle, ChevronLeft, BookmarkCheck, BookMarked,
  Scissors, FileCheck, FileSignature, Newspaper, BookCopy
} from 'lucide-react';

import bienvenue from '../assets/images/Bienvenue.jpg';
import salleLect from '../assets/images/Salle_lecture_N2.jpg';
import photo14 from '../assets/images/Photo14.jpg';
import wifiImage from '../assets/images/wifi.jpg';
import wifiImage2 from '../assets/images/wifi1.png';
import salleLect1 from '../assets/salle lecture-1.webp';
import salleLect2 from '../assets/salle lecture-2.webp';
import salleLect3 from '../assets/salle lecture-3.webp';
import salleLect4 from '../assets/salle lecture-4.webp';
import salleConference from '../assets/salle de conference.webp';
import salleLecturePMR from '../assets/salle lecture personne a mobilite reduite.webp';
import reglementInterieurPDF from '../assets/reglement_intérieur_bc.pdf';
import publicationImage from '../assets/images/Publication1.jpg';
import memoiresImage from '../assets/images/memoires1.jpg';
import journalImage from '../assets/images/image_journal.jpg';
import basesImage from '../assets/images/Image_sauvegarde.jpg';
import pmbImage from '../assets/images/pmb.jpg';
import memoiresCatalogImage from '../assets/images/memoires.jpg';
import politiquePDF from '../assets/Politique_documentaire_BC-UYI.pdf';

// Images pour la reliure
import reluireImage from '../assets/images/reluire.jpg';
import reliureManuelleImage from '../assets/images/Reliure-manuelle-sans-machine.jpg';
import reliureAnneauImage from '../assets/images/Dossier-reliure-anneaux-plastiques2.jpg';
import reliureThermiqueImage from '../assets/images/Dossier-reliure-thermique.jpg';

import { useState, useEffect } from 'react';

// ============================================================
// IMPORTS DES PHOTOS RESPONSABLES
// ============================================================

// COORDINATION
import imgMarieJoseEssi from '../assets/images/responsable/coordination/PrMarie-JoséEssi.jpg';
import imgIsaacChristianIlouga from '../assets/images/responsable/coordination/MonsieurIsaacChristianIlouga.jpg';
import imgPeguyTassapoPouokam from '../assets/images/responsable/coordination/MadamePeguyTassapoPouokam.jpg';
import imgIgnaceBlaiseOlli from '../assets/images/responsable/coordination/MonsieurIgnaceBlaiseOlli.jpg';

// DRA
import imgNancyBilooEkoto from '../assets/images/responsable/dra/MadameNancyEkoto.jpg';
import imgAnneMarieAkamba from '../assets/images/responsable/dra/MadameAnneMarieAkamba.jpg';
import imgFlammarionNokoEdjeba from '../assets/images/responsable/dra/MonsieurFlammarionNokoEdjeba.jpg';
import imgDaoudaWusthitengam from '../assets/images/responsable/dra/MonsieurDaoudaWusthitengam.jpg';
import imgModesteBaaneAssembe from '../assets/images/responsable/dra/MonsieurModesteBaaneAssembe.jpg';
import imgReneMinko from '../assets/images/responsable/dra/MonsieurReneMinko.jpg';
import imgCharlesEkoKotto from '../assets/images/responsable/dra/MonsieurCharlesEkoKotto.jpg';
import imgMarieRoseKohn from '../assets/images/responsable/dra/MadameMarieRoseKohn.jpg';
import imgNdipMaryArrah from '../assets/images/responsable/dra/MadameNdipMaryArrah.jpg';
import imgDayangHoulibele from '../assets/images/responsable/dra/MadameDayangHoulibele.jpg';
import imgZakariahouLitouot from '../assets/images/responsable/dra/MonsieurZakariahouLitouot.jpg';
import imgAlexanderLyongaNasie from '../assets/images/responsable/dra/MonsieurAlexanderLyongaNasie.jpg';
import imgBertinNdongoEvezo from '../assets/images/responsable/dra/MonsieurBertinNdongoEvezo.jpg';
import imgMinetteVouffoAwozang from '../assets/images/responsable/dra/MadameMinetteVouffoAwozang.jpg';
import imgIBO from '../assets/images/responsable/dra/MonsieurIBO.jpg';
import imgPierreEmileAbouou from '../assets/images/responsable/dra/MonsieurPierreEmileAbouou.jpg';

// DACA
import imgViragoLeonieKenne from '../assets/images/responsable/daca/MadameViragoLéonieKenne.jpg';
import imgMicheleRosyAnkoumaSob from '../assets/images/responsable/daca/MadameMicheleRosyAnkoumaSob.jpg';
import imgMarcOlivierMindjeme from '../assets/images/responsable/daca/MonsieurMarcOlivierMindjeme.jpg';
import imgVictorineNgueNgougno from '../assets/images/responsable/daca/MadameVictorineNgueNgougno.jpg';
import imgOgenPrudenciaMafor from '../assets/images/responsable/daca/MadameOgenPrudenciaMafor.jpg';
import imgMauriceKiteng from '../assets/images/responsable/dri/MonsieurMauriceKiteng.jpg';

// DACN
import imgAnneMarieAkambaDACN from '../assets/images/responsable/dacn/MadameAnneMarieAkamba.jpg';
import imgNkoloPrudenceNiclaire from '../assets/images/responsable/dacn/MadameNkoloPrudenceNiclaire.jpg';
import imgNancyBilooEkotoDACN from '../assets/images/responsable/dacn/MadameNancyBilooEkoto.jpg';
import imgEstherFloreMoussi from '../assets/images/responsable/dacn/MadameEstherFloreMoussi.jpg';
import imgTNL from '../assets/images/responsable/dacn/MonsieurTNL.jpg';

// DRI
import imgNorbertTangmo from '../assets/images/responsable/dri/MonsieurNorbertTangmo.jpg';

// ============================================================
// PHOTO MODAL
// ============================================================

function PhotoModal({ src, name, onClose }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
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
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,165,0,0.4); } 70% { box-shadow: 0 0 0 20px rgba(255,165,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,165,0,0); } }
        @media (max-width: 640px) {
          .photo-modal-close { top: -12px !important; right: -12px !important; width: 40px !important; height: 40px !important; }
          .photo-modal-close svg { width: 22px !important; height: 22px !important; }
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
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="photo-modal-close"
          onClick={onClose}
          aria-label={isEnglish ? 'Close' : 'Fermer'}
          style={{
            position: 'absolute', top: -16, right: -16, width: 48, height: 48,
            borderRadius: '50%', background: 'white', border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1B1464', transition: 'all 0.3s ease', zIndex: 10,
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.background = '#FFA500';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#1B1464';
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(12px, 2vw, 20px)', minHeight: 0, flex: 1 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: 'clamp(8px, 1.5vw, 12px)', overflow: 'hidden', position: 'relative', flex: 1, minHeight: 0 }}>
            <img src={src} alt={name} style={{ maxWidth: '100%', maxHeight: 'min(70vh, 600px)', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 'clamp(6px, 1vw, 8px)', display: 'block' }} />
          </div>

          <div style={{ textAlign: 'center', padding: '0 20px 8px 20px', borderBottom: '3px solid #FFA500', paddingBottom: 12, width: '100%' }}>
            <div style={{ fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: 700, color: '#1B1464', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              {name}
            </div>
            <div style={{ fontSize: 'clamp(11px, 0.9vw, 14px)', color: '#888', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FFA500', marginRight: 4 }} />
              {isEnglish ? 'Click outside or press Escape to close' : "Cliquez à l'extérieur ou appuyez sur Échap pour fermer"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ============================================================
// RESPONSABLE PHOTO
// ============================================================

function ResponsablePhoto({ src, name, size = 'clamp(90px, 12vw, 160px)', showName = true }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, cursor: 'pointer', transition: 'transform 0.3s ease',
          position: 'relative', zIndex: 1
        }}
        onClick={openModal}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(e); } }}
        aria-label={isEnglish ? `View photo of ${name}` : `Voir la photo de ${name}`}
      >
        <div style={{
          width: size, height: size, borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--bleu-nuit), #2D2178)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '4px solid var(--or)',
          boxShadow: '0 6px 30px rgba(27,20,100,0.25)',
          fontSize: typeof size === 'string' ? 'clamp(28px, 3vw, 40px)' : `${parseInt(size) * 0.35}px`,
          fontWeight: 700, color: 'white', textTransform: 'uppercase',
          transition: 'all 0.3s ease', position: 'relative'
        }}>
          {src && !imageError ? (
            <img src={src} alt={name || (isEnglish ? 'Photo of the head' : 'Photo du responsable')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageError(true)} />
          ) : (
            <span style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: 'white' }}>{initials}</span>
          )}
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            background: 'rgba(27,20,100,0.85)', borderRadius: '50%', padding: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--or)', pointerEvents: 'none'
          }}>
            <Maximize2 size={18} color="var(--or)" />
          </div>
        </div>
        {showName && (
          <span style={{ fontSize: 'clamp(14px, 1vw, 16px)', fontWeight: 600, color: 'var(--bleu-nuit)', textAlign: 'center', maxWidth: size, lineHeight: 1.3 }}>
            {name}
          </span>
        )}
      </div>
      {modalOpen && <PhotoModal src={src} name={name} onClose={closeModal} />}
    </>
  );
}

// ============================================================
// CAROUSEL
// ============================================================

function ImageCarousel({ images }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const slides = images.map((item) => {
    if (typeof item === 'string') return { src: item, label: isEnglish ? 'Reading Room' : 'Salle de lecture' };
    return item;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 40vw, 450px)', overflow: 'hidden', borderRadius: 'var(--radius)', marginTop: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', background: '#1B1464' }}>
      {slides.map(({ src, label }, index) => (
        <div
          key={`${label}-${index}`}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out, transform 6s ease-in-out',
            transform: index === currentIndex ? 'scale(1.08)' : 'scale(1)',
            backgroundImage: `url("${src}")`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,11,38,0.06) 0%, rgba(5,11,38,0.75) 100%)' }} />
          <div style={{ position: 'absolute', left: 'clamp(12px, 2vw, 24px)', right: 'clamp(12px, 2vw, 24px)', bottom: 'clamp(34px, 5vw, 56px)', zIndex: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', background: 'rgba(11, 16, 51, 0.72)', color: '#fff', padding: 'clamp(6px, 1vw, 10px) clamp(12px, 2vw, 18px)', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.18)', fontSize: 'clamp(11px, 1.1vw, 15px)', fontWeight: 700, letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
              {label}
            </span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: 'clamp(12px, 3vw, 22px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 'clamp(6px, 1vw, 12px)', zIndex: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} style={{ width: 'clamp(8px, 1.2vw, 10px)', height: 'clamp(8px, 1.2vw, 10px)', borderRadius: '50%', background: index === currentIndex ? 'var(--or)' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s', border: 'none', padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// BREADCRUMB
// ============================================================

function Breadcrumb({ items }) {
  return (
    <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(4px, 0.6vw, 8px)', color: 'rgba(255,255,255,0.6)', marginBottom: 'clamp(12px, 2vw, 20px)', fontSize: 'clamp(11px, 0.9vw, 13px)', alignItems: 'center' }}>
      {items.map((item, index) => (
        <span key={index} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.6vw, 8px)' }}>
          {index > 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>}
          {item.href ? (
            <Link to={item.href} style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>{item.label}</Link>
          ) : (
            <span style={{ color: 'var(--or)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

const responsiveStyles = `
  @media (max-width: 1200px) { .container { padding: 0 24px !important; } }
  @media (max-width: 992px) { .container { padding: 0 20px !important; } .section { padding: 48px 0 !important; } }
  @media (max-width: 768px) { 
    .container { padding: 0 16px !important; } 
    .section { padding: 32px 0 !important; } 
    .hide-mobile { display: none !important; } 
    .show-mobile { display: block !important; } 
    .text-center-mobile { text-align: center !important; } 
    .flex-column-mobile { flex-direction: column !important; align-items: stretch !important; }
    .grid-1-mobile { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) { 
    .container { padding: 0 12px !important; } 
    .section { padding: 24px 0 !important; } 
    .grid-2-mobile { grid-template-columns: 1fr !important; }
    .text-sm-center { text-align: center !important; }
  }
  @media (max-width: 360px) { .container { padding: 0 8px !important; } }
`;

// ============================================================
// PRESENTATION PAGE
// ============================================================

export function PresentationPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const isDepartments = location.pathname === '/bibliotheque/departements';

  const departments = [
    {
      titleFr: 'Département des Ressources Administratives (DRA)',
      titleEn: 'Administrative Resources Department (DRA)',
      subtitleFr: 'Département', subtitleEn: 'Department',
      leader: 'Madame Nancy Bilo\'o Ekoto',
      leaderPhoto: imgNancyBilooEkoto,
      color: '#1B1464',
      icon: <Briefcase size={18} />,
      descFr: 'Gère les ressources financières, matérielles et humaines de la bibliothèque, ainsi que la gestion des usagers et le suivi de l\'effectivité au poste.',
      descEn: 'Manages the financial, material and human resources of the library, as well as user management and staff attendance tracking.'
    },
    {
      titleFr: 'Département Accès aux Collections Analogiques (DACA)',
      titleEn: 'Analog Collections Access Department (DACA)',
      subtitleFr: 'Département', subtitleEn: 'Department',
      leader: 'Madame Virago Léonie Kenne',
      leaderPhoto: imgViragoLeonieKenne,
      color: '#7C3AED',
      icon: <BookOpen size={18} />,
      descFr: 'Assure l\'acquisition, la conservation, le traitement intellectuel et la gestion des catalogues des collections physiques.',
      descEn: 'Handles the acquisition, preservation, intellectual processing and catalog management of physical collections.'
    },
    {
      titleFr: 'Département Accès aux Collections Numériques (DACN)',
      titleEn: 'Digital Collections Access Department (DACN)',
      subtitleFr: 'Département', subtitleEn: 'Department',
      leader: 'Madame Anne-Marie Akamba Ngwba',
      leaderPhoto: imgAnneMarieAkambaDACN,
      color: '#059669',
      icon: <Cloud size={18} />,
      descFr: 'Gère les monographies numériques, les connaissances numériques et les périodiques électroniques.',
      descEn: 'Manages digital monographs, digital knowledge and electronic journals.'
    },
    {
      titleFr: 'Département des Ressources Informatiques (DRI)',
      titleEn: 'IT Resources Department (DRI)',
      subtitleFr: 'Département', subtitleEn: 'Department',
      leader: 'Monsieur Norbert Tangmo',
      leaderPhoto: imgNorbertTangmo,
      color: '#6366f1',
      icon: <Server size={18} />,
      descFr: 'Assure la maintenance du système intégré de gestion de bibliothèque, des services documentaires et des sciences ouvertes.',
      descEn: 'Maintains the integrated library management system, documentary services and open science.'
    }
  ];

  if (isDepartments) {
    return (
      <Layout>
        <Helmet>
          <title>{isEnglish ? 'Departments of the BC-UYI | Central University Library' : 'Départements de la BC-UYI | Bibliothèque Centrale Universitaire'}</title>
          <meta name="description" content={isEnglish ? "Discover the 4 departments of the Central Library of the University of Yaoundé I." : "Découvrez les 4 départements de la Bibliothèque Centrale de l'Université de Yaoundé I."} />
        </Helmet>
        <style>{responsiveStyles}</style>
        <div style={{ background: 'var(--bleu-nuit)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
          <div className="container">
            <Breadcrumb items={[
              { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
              { label: isEnglish ? 'Library' : 'Bibliothèque', href: '/bibliotheque/presentation' },
              { label: isEnglish ? 'Departments' : 'Départements' }
            ]} />
            <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
              {isEnglish ? 'The BC-UYI ' : 'Les Départements de la '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Departments' : 'BC-UYI'}</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 760, fontSize: 'clamp(14px, 1vw, 15px)', lineHeight: 1.8 }}>
              {isEnglish
                ? 'The Central Library of the University of Yaoundé I has been reorganized into four departments to better structure documentary services and support users according to their specific needs.'
                : 'La Bibliothèque Centrale de l\'Université de Yaoundé I a été réorganisée en quatre (04) Départements pour mieux structurer les services documentaires et accompagner les usagers selon leurs besoins spécifiques.'}
            </p>
          </div>
        </div>
        <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
          <div style={{ display: 'grid', gap: 'clamp(16px, 1.8vw, 24px)' }}>
            {departments.map((dept, index) => (
              <Reveal key={dept.titleFr} className="reveal-up" delay={index * 80}>
                <div className="card" style={{
                  padding: 'clamp(24px, 3vw, 36px)',
                  minHeight: 'clamp(200px, 22vw, 260px)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'all 0.4s ease',
                  borderLeft: `6px solid ${dept.color || 'var(--or)'}`,
                  cursor: 'default', background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 2.5vw, 32px)', marginBottom: 14, flexWrap: 'wrap' }}>
                      <ResponsablePhoto src={dept.leaderPhoto} name={dept.leader} size="clamp(100px, 14vw, 160px)" />
                      <div>
                        <div style={{ fontSize: 'clamp(11px, 0.8vw, 12px)', fontWeight: 700, textTransform: 'uppercase', color: dept.color || 'var(--or)', letterSpacing: '0.08em' }}>
                          {isEnglish ? dept.subtitleEn : dept.subtitleFr}
                        </div>
                        <h3 style={{ fontSize: 'clamp(18px, 1.4vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginTop: 2 }}>
                          {isEnglish ? dept.titleEn : dept.titleFr}
                        </h3>
                      </div>
                    </div>
                    <p style={{ fontSize: 'clamp(14px, 0.95vw, 15px)', color: 'var(--texte-muted)', lineHeight: 1.8, marginLeft: 'clamp(16px, 2vw, 24px)' }}>
                      {isEnglish ? dept.descEn : dept.descFr}
                    </p>
                  </div>
                  <div style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', paddingTop: 16, borderTop: '1px solid var(--border-light)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 'clamp(16px, 2vw, 24px)' }}>
                    <UserCircle size={18} color={dept.color || 'var(--or)'} />
                    <strong>{isEnglish ? 'Head:' : 'Responsable :'}</strong> {dept.leader}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Presentation of the Central University Library - BCU UYI' : 'Présentation de la Bibliothèque Centrale Universitaire - BCU UYI'}</title>
        <meta name="description" content={isEnglish ? "Discover the history, mission and values of the Central Library of the University of Yaoundé I, founded in 1962." : "Découvrez l'histoire, la mission et les valeurs de la Bibliothèque Centrale de l'Université de Yaoundé I, fondée en 1962."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Presentation' : 'Présentation' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Presentation ' : 'Présentation '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'of the BCU' : 'de la BCU'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Discover the history, mission and values of the Central University Library' : 'Découvrez l\'histoire, la mission et les valeurs de la Bibliothèque Centrale Universitaire'}
          </p>
        </div>
      </div>
      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(24px, 3vw, 36px)', alignItems: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          <div>
            <Reveal className="reveal-up">
              <div style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(124,58,237,0.12)', borderRadius: 50, marginBottom: 16 }}>
                <span style={{ fontSize: 'clamp(10px, 0.8vw, 11px)', fontWeight: 700, color: 'var(--or)', letterSpacing: '0.06em' }}>📖 {isEnglish ? 'SINCE 1962' : 'DEPUIS 1962'}</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 400, color: 'var(--bleu-nuit)', marginBottom: 20 }}>
                {isEnglish ? 'Serving knowledge since 1962' : 'Au service de la connaissance depuis 1962'}
              </h2>
              <p style={{ fontSize: 'clamp(14px, 0.95vw, 15px)', lineHeight: 1.9, color: 'var(--texte-muted)', marginBottom: 16 }}>
                {isEnglish
                  ? 'The Central University Library (BCU) of the University of Yaoundé I is the main documentary structure of the University. Its mission is to collect, process, preserve and disseminate scientific and technical information in service of the university community.'
                  : 'La Bibliothèque Centrale Universitaire (BCU) de l\'Université de Yaoundé I est la principale structure documentaire de l\'Université. Elle a pour mission de collecter, traiter, conserver et diffuser l\'information scientifique et technique au service de la communauté universitaire.'}
              </p>
              <p style={{ fontSize: 'clamp(14px, 0.95vw, 15px)', lineHeight: 1.9, color: 'var(--texte-muted)' }}>
                {isEnglish
                  ? 'With a collection of more than 85,000 books and 12,400 digitized theses and dissertations, it welcomes hundreds of students, lecturers and researchers from the University each day.'
                  : 'Forte d\'un fonds de plus de 85 000 ouvrages, de 12 400 thèses et mémoires numérisés, elle accueille chaque jour des centaines d\'étudiants, enseignants et chercheurs des différentes facultés de l\'Université.'}
              </p>
            </Reveal>
          </div>
          <Reveal className="reveal-scale">
            <img src={bienvenue} alt={isEnglish ? 'BCU University Library' : 'Bibliothèque BCU UYI'} style={{ borderRadius: 'var(--radius)', width: '100%', objectFit: 'cover', height: 'clamp(200px, 30vw, 340px)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
          </Reveal>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
          {[
            { title: isEnglish ? 'Mission' : 'Mission', icon: '🎯', color: '#1B1464', desc: isEnglish ? 'Collect, process and disseminate scientific and technical information for the benefit of the university community.' : 'Collecter, traiter et diffuser l\'information scientifique et technique au profit de la communauté universitaire.', details: isEnglish ? ['Heritage preservation', 'Access to information', 'Research support'] : ['Préservation du patrimoine', 'Accès à l\'information', 'Soutien à la recherche'] },
            { title: isEnglish ? 'Vision' : 'Vision', icon: '🔭', color: '#6366f1', desc: isEnglish ? 'Become a reference university library in Central Africa, integrated into global information networks.' : 'Devenir une bibliothèque universitaire de référence en Afrique centrale, intégrée aux réseaux mondiaux de l\'information.', details: isEnglish ? ['Academic excellence', 'Digital innovation', 'International reach'] : ['Excellence académique', 'Innovation numérique', 'Rayonnement international'] },
            { title: isEnglish ? 'Values' : 'Valeurs', icon: '💎', color: '#7C3AED', desc: isEnglish ? 'Excellence, accessibility, neutrality and service to users at the heart of all our activities.' : 'Excellence, accessibilité, neutralité et service à l\'usager au cœur de toutes nos activités.', details: isEnglish ? ['Integrity', 'Equity', 'Innovation'] : ['Intégrité', 'Équité', 'Innovation'] },
          ].map(c => (
            <Reveal key={c.title} className="reveal-up">
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'clamp(20px, 2.5vw, 28px)', borderTop: `4px solid ${c.color}`, transition: 'all 0.3s ease', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ fontSize: 'clamp(28px, 3vw, 36px)', marginBottom: 12 }}>{c.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 'clamp(16px, 1.1vw, 17px)', marginBottom: 10, color: 'var(--bleu-nuit)' }}>{c.title}</h3>
                <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', lineHeight: 1.7, marginBottom: 14 }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.details.map(d => (<span key={d} style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', padding: '2px 10px', borderRadius: 50, background: `${c.color}12`, color: c.color, fontWeight: 600 }}>{d}</span>))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// COORDINATION PAGE
// ============================================================

export function CoordinationPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const coordinationData = {
    conservateur: 'Pr Marie-José Essi',
    conservateurPhoto: imgMarieJoseEssi,
    sections: [
      { titleFr: 'Planification, M&E et Formation', titleEn: 'Planning, M&E and Training', responsable: 'Pr Marie-José Essi', responsablePhoto: imgMarieJoseEssi, color: '#1B1464' },
      { titleFr: 'Responsable des Collections Analogiques', titleEn: 'Head of Analog Collections', responsable: 'Monsieur Isaac Christian Ilouga', responsablePhoto: imgIsaacChristianIlouga, color: '#7C3AED' },
      { titleFr: 'Suivi du Programme', titleEn: 'Program Monitoring', responsable: 'Madame Péguy Tassapo Pouokam', responsablePhoto: imgPeguyTassapoPouokam, color: '#059669' },
      { titleFr: 'Suivi des Opérations', titleEn: 'Operations Monitoring', responsable: 'Monsieur Ignace Blaise Olli', responsablePhoto: imgIgnaceBlaiseOlli, color: '#6366f1' }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Coordination of the Central Library - BCU UYI' : 'Coordination de la Bibliothèque Centrale - BCU UYI'}</title>
        <meta name="description" content={isEnglish ? "Discover the organization of the Coordination of the Central Library of the University of Yaoundé I." : "Découvrez l'organisation de la Coordination de la Bibliothèque Centrale de l'Université de Yaoundé I."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Coordination' : 'Coordination' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'The ' : 'La '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Coordination' : 'Coordination'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Organization and governance of the Central University Library' : 'Organisation et gouvernance de la Bibliothèque Centrale Universitaire'}
          </p>
        </div>
      </div>
      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 'clamp(28px, 3.5vw, 44px)', borderTop: '4px solid var(--or)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(30px, 4vw, 50px)', marginBottom: 28, flexWrap: 'wrap' }}>
              <ResponsablePhoto src={coordinationData.conservateurPhoto} name={coordinationData.conservateur} size="clamp(130px, 18vw, 200px)" />
              <div>
                <div style={{ fontSize: 'clamp(11px, 0.8vw, 12px)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--or)', letterSpacing: '0.08em' }}>
                  {isEnglish ? 'Chief Curator' : 'Conservateur en Chef'}
                </div>
                <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginTop: 2 }}>{coordinationData.conservateur}</h2>
              </div>
            </div>
            <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(15px, 1vw, 16px)', marginBottom: 28 }}>
              {isEnglish
                ? 'The Coordination ensures the strategic management of the library, project planning, monitoring and evaluation, and supervision of all departments. It comprises four (04) main sections with specific responsibilities.'
                : "La Coordination assure la direction stratégique de la bibliothèque, la planification des projets, le suivi-évaluation et la supervision de l'ensemble des départements. Elle compte quatre (04) sections principales avec des responsabilités spécifiques."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 1.8vw, 20px)' }}>
              {coordinationData.sections.map((section) => (
                <div key={section.titleFr} style={{ padding: 'clamp(18px, 2vw, 24px)', background: 'var(--beige)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', borderLeft: `6px solid ${section.color}`, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 'clamp(16px, 1.8vw, 24px)', flexWrap: 'wrap' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <ResponsablePhoto src={section.responsablePhoto} name={section.responsable} size="clamp(70px, 8vw, 90px)" showName={false} />
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ fontWeight: 700, fontSize: 'clamp(14px, 1vw, 16px)', color: 'var(--bleu-nuit)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Users size={16} color={section.color} /> {isEnglish ? section.titleEn : section.titleFr}
                    </div>
                    <span style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} color={section.color} /> <strong>{isEnglish ? 'Head:' : 'Responsable :'}</strong> {section.responsable}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// SECTIONS PAGE
// ============================================================

import { SectionsPage as SectionsPageFinal } from './SectionsPage_final';

export function SectionsPage() {
  return <SectionsPageFinal />;
}

// ============================================================
// HORAIRES PAGE
// ============================================================

export function HorairesPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const hours = isEnglish
  ? [
      { day: 'Monday', hours: '12:00 – 22:00', open: true },
      { day: 'Tuesday', hours: '09:00 – 22:00', open: true },
      { day: 'Wednesday', hours: '09:00 – 22:00', open: true },
      { day: 'Thursday', hours: '09:00 – 22:00', open: true },
      { day: 'Friday', hours: '09:00 – 22:00', open: true },
      { day: 'Saturday', hours: '10:00 – 16:00', open: true },
      { day: 'Sunday', hours: 'Closed', open: false },
    ]
  : [
      { day: 'Lundi', hours: '12h00 – 22h00', open: true },
      { day: 'Mardi', hours: '09h00 – 22h00', open: true },
      { day: 'Mercredi', hours: '09h00 – 22h00', open: true },
      { day: 'Jeudi', hours: '09h00 – 22h00', open: true },
      { day: 'Vendredi', hours: '09h00 – 22h00', open: true },
      { day: 'Samedi', hours: '10h00 – 16h00', open: true },
      { day: 'Dimanche', hours: 'Fermé', open: false },
    ];

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Opening Hours - Central Library UYI' : "Horaires d'ouverture de la Bibliothèque Centrale - BCU UYI"}</title>
        <meta name="description" content={isEnglish ? 'Check the opening hours of the Central University Library of Yaoundé I.' : "Consultez les horaires d'ouverture de la Bibliothèque Centrale Universitaire de Yaoundé I."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Opening Hours' : 'Horaires' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400 }}>
            {isEnglish ? 'Opening ' : 'Horaires '}
            <span style={{ color: 'var(--or)' }}>{isEnglish ? 'Hours' : "d'ouverture"}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Check the opening hours of the Central Library' : "Consultez les horaires d'ouverture de la Bibliothèque Centrale"}
          </p>
        </div>
      </div>
      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(16px, 2vw, 20px) clamp(20px, 3vw, 28px)', color: 'var(--or)', fontWeight: 700, fontSize: 'clamp(14px, 1vw, 15px)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} /> {isEnglish ? 'Weekly Schedule' : 'Horaires hebdomadaires'}
            </div>
            {hours.map((h, index) => {
              const isToday = index === todayIndex;
              return (
                <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', padding: 'clamp(12px, 1.5vw, 16px) clamp(20px, 3vw, 28px)', borderBottom: index < 6 ? '1px solid var(--border)' : 'none', background: isToday ? 'rgba(124,58,237,0.08)' : 'transparent', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontWeight: isToday ? 700 : 600, display: 'flex', alignItems: 'center', gap: 'clamp(6px, 0.8vw, 8px)', fontSize: 'clamp(13px, 0.9vw, 14px)' }}>
                    {h.day}
                    {isToday && (<span style={{ fontSize: 'clamp(8px, 0.6vw, 10px)', background: 'var(--or)', color: 'white', padding: '2px 10px', borderRadius: 50, fontWeight: 700 }}>{isEnglish ? 'Today' : "Aujourd'hui"}</span>)}
                  </span>
                  <span style={{ color: h.open ? 'var(--green)' : 'var(--red)', fontWeight: isToday ? 700 : 600, fontSize: 'clamp(13px, 0.9vw, 14px)' }}>{h.hours}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal className="reveal-up" delay={150}>
          <div style={{ background: 'var(--beige)', borderRadius: 'var(--radius-sm)', padding: 'clamp(16px, 2vw, 20px) clamp(20px, 3vw, 24px)', fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={20} color="var(--or)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>{isEnglish ? 'Information:' : 'Informations :'}</strong> {isEnglish ? 'Hours may be modified during exam periods and public holidays. Check the News section for special announcements.' : "Les horaires peuvent être modifiés pendant les périodes d'examens et les jours fériés. Consultez la section Actualités pour les annonces spéciales."}
            </div>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// SERVICES DATA
// ============================================================

const SERVICES_DATA = {
  consultation: {
    titleFr: 'Espace consultation', titleEn: 'Consultation Area',
    icon: '📖',
    descFr: 'La bibliothèque dispose de plusieurs salles de lecture climatisées offrant plus de 500 places assises réparties sur 3 niveaux.',
    descEn: 'The library has several air-conditioned reading rooms offering more than 500 seats spread over 3 levels.',
    detailsFr: [
      'Niveau 1 : Accueil, prêt/retour, salle de consultation générale',
      'Niveau 2 : Sciences exactes, Technologies, Médecine',
      'Niveau 3 : Sciences humaines, Lettres, Droit, Sciences sociales',
      'Salle de lecture silencieuse (50 places) — Niveau 2',
      'Accès PMR (Personnes à Mobilité Réduite)'
    ],
    detailsEn: [
      'Level 1: Reception, loans/returns, general consultation room',
      'Level 2: Exact sciences, Technologies, Medicine',
      'Level 3: Humanities, Letters, Law, Social sciences',
      'Silent reading room (50 seats) — Level 2',
      'PRM access (Persons with Reduced Mobility)'
    ],
    hoursFr: '07h30 – 15h30 (Lun–Ven) | 08h00 – 13h00 (Sam)',
    hoursEn: '07:30 – 15:30 (Mon–Fri) | 08:00 – 13:00 (Sat)',
    content: (isEnglish) => (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'clamp(18px, 1.5vw, 22px)', color: 'var(--bleu-nuit)', marginBottom: 12 }}>
          {isEnglish ? 'Reading Spaces of the Central Library of UYI!' : "Espaces de lecture de la Bibliothèque Centrale de l'UYI !"}
        </h3>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 16 }}>
          {isEnglish
            ? 'After major renovation work, the reception capacity of the BC-UYI has been increased to more than 1000 seats. New reading spaces have been fitted out to make students\' work in the library acceptable.'
            : 'Après les gros travaux de rénovation, la capacité d\'accueil de la BC-UYI a été portée à plus de 1000 places assises. Des nouveaux espaces de lecture ont été aménagés pour rendre acceptable le travail des étudiants en bibliothèque.'}
        </p>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 20 }}>
          {isEnglish
            ? 'Only users with an access card can benefit from these spaces and WiFi access.'
            : 'Seuls les usagers munis d\'une carte d\'accès bénéficient de ces espaces et d\'un accès au Wifi.'}
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 10, marginBottom: 12, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'Reading rooms in pictures' : 'Les salles de lecture en image'}
        </h4>

        <ImageCarousel
          images={[
            { src: salleLect1, label: isEnglish ? 'Reading Room - Level 1' : 'Salle de lecture - Niveau 1' },
            { src: salleLect2, label: isEnglish ? 'Reading Room - Level 2' : 'Salle de lecture - Niveau 2' },
            { src: salleLect3, label: isEnglish ? 'General Consultation Room' : 'Salle de consultation générale' },
            { src: salleLect4, label: isEnglish ? 'Silent Reading Room' : 'Salle de lecture silencieuse' },
            { src: salleConference, label: isEnglish ? 'Conference Room' : 'Salle de conférence' },
            { src: salleLecturePMR, label: isEnglish ? 'PRM Reading Room' : 'Salle de lecture PMR' }
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginTop: 18 }}>
          {[
            { src: salleConference, label: isEnglish ? 'Conference Room' : 'Salle de conférence' },
            { src: salleLecturePMR, label: isEnglish ? 'PRM Area' : 'Espace PMR' },
            { src: salleLect4, label: isEnglish ? 'Silent Reading' : 'Lecture silencieuse' },
            { src: salleLect1, label: isEnglish ? 'Level 1' : 'Niveau 1' }
          ].map((item) => (
            <div key={item.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 22px rgba(27,20,100,0.06)' }}>
              <img src={item.src} alt={item.label} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 12, textAlign: 'center' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Consulting Books' : 'Consultation des ouvrages'}
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <img src={publicationImage} alt={isEnglish ? 'Consulting books' : 'Consultation des ouvrages'} style={{ width: '100%', maxWidth: 320, height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'block' }} />
          </div>

          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'The Central Library of UYI has a large documentary collection consisting of monographs, dissertations and theses, newspapers and digital resources available in its computerized catalogue.'
              : 'La Bibliothèque Centrale de l\'UYI dispose d\'un important fonds documentaire constitué de monographies, mémoires et thèses, journaux et ressources numériques disponibles dans son catalogue informatisé.'}
          </p>

          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginTop: 10 }}>
            {isEnglish
              ? 'Newspapers from different countries and printed periodicals (journals & annals) that can be consulted on site in a friendly space. All these resources can be consulted in our computerized catalogue.'
              : 'Des journaux de différents pays et des périodiques imprimés (revues & annales) qu\'il est possible de consulter sur place dans un espace convivial. Toutes ces ressources sont consultables dans notre catalogue informatisé.'}
          </p>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <strong style={{ color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Consult our catalogue' : 'Consulter notre catalogue'}</strong>
            <a href="http://10.4.3.254:8080/pmb/opac_css/" target="_blank" rel="noreferrer">
              <img src={pmbImage} alt="PMB" style={{ width: 110, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </a>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Consulting Dissertations and Theses' : 'Consultation des Mémoires et Thèses'}
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <img src={memoiresImage} alt={isEnglish ? 'Dissertations and theses' : 'Mémoires et thèses'} style={{ width: '100%', maxWidth: 320, height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'block' }} />
          </div>

          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'The Central Library of UYI receives dissertations and theses defended in the various departments and Schools of the University of Yaoundé I. In addition, each major school has a directory of dissertations and theses accessible via their website.'
              : 'La Bibliothèque Centrale de l\'UYI reçoit des mémoires et thèses soutenus dans les différents départements et Écoles de l\'Université de Yaoundé I. Par ailleurs, chaque grande école dispose d\'un répertoire de mémoires et thèses accessibles via leur site web.'}
          </p>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <strong style={{ color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Consult the dissertations and theses available at the BC-UYI' : 'Consulter les mémoires et thèses disponibles à la BC-UYI'}</strong>
            <a href="http://10.4.3.254:8080/pmb/opac_css/" target="_blank" rel="noreferrer">
              <img src={memoiresCatalogImage} alt={isEnglish ? 'BC-UYI Dissertations' : 'Mémoires BC-UYI'} style={{ width: 110, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </a>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Consulting Periodicals' : 'Consultation des périodiques'}
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <img src={journalImage} alt={isEnglish ? 'Periodicals' : 'Périodiques'} style={{ width: '100%', maxWidth: 320, height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'block' }} />
          </div>

          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'The Central Library of UYI receives newspapers from different countries and printed periodicals (journals & annals) that can be consulted on site at the periodicals section in a friendly space. All newspapers, journals and microforms available at the BC-UYI will soon be listed in our computerized catalogue and can be consulted using the PMB search engine.'
              : 'La Bibliothèque Centrale de l\'UYI reçoit les journaux de différents pays et des périodiques imprimés (revues & annales) qu\'il est possible de consulter sur place à la section des périodiques dans un espace convivial. Tous les journaux, revues et microformes disponibles à la BC-UYI seront bientôt répertoriés dans notre catalogue informatisé et pourront être consultés à l\'aide du moteur de recherche de PMB.'}
          </p>

          <p style={{ marginTop: 16, lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            <strong style={{ color: 'var(--bleu-nuit)' }}>{isEnglish ? 'How to find your way?' : 'Comment s\'y retrouver ?'}</strong> {isEnglish ? 'Go directly to the periodicals section on the ground floor.' : 'Se rendre directement à la section des périodiques au rez-de-chaussée.'}
          </p>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Consulting Databases' : 'Consultation des Bases de données'}
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <img src={basesImage} alt={isEnglish ? 'Databases' : 'Bases de données'} style={{ width: '100%', maxWidth: 320, height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'block' }} />
          </div>

          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'The Central Library of UYI provides its users with major databases covering all disciplines taught at the University of Yaoundé I. Thanks to its cooperation with many publishers and partners specializing in the promotion of digital resources, many thematic databases are accessible via the library portal.'
              : 'La Bibliothèque Centrale de l\'UYI met à la disposition de ses usagers d\'importantes bases de données couvrant toutes les disciplines enseignées à l\'Université de Yaoundé I. Grâce à sa coopération avec de nombreux éditeurs et partenaires spécialisés dans la promotion des ressources numériques, de nombreuses bases de données thématiques sont accessibles via le portail de la bibliothèque.'}
          </p>

          <div style={{ marginTop: 18 }}>
            <a href="http://10.4.2.112/pmb/opac_css/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #1B1464 0%, #3b2f8d 100%)', color: '#fff', textDecoration: 'none', padding: '12px 18px', borderRadius: 10, fontWeight: 700, boxShadow: '0 8px 20px rgba(27,20,100,0.25)' }}>
              <ExternalLink size={18} />
              {isEnglish ? 'Access the BC-UYI portal' : 'Accéder au portail de la BC-UYI'}
            </a>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Some rules to observe in the reading rooms' : 'Quelques consignes à observer dans les salles de lecture'}
          </h4>
          <p style={{ fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8, fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'To avoid any inconvenience that could lead to expulsion from the library, users must comply with the following rules:'
              : 'Pour éviter tout désagrément pouvant conduire à une expulsion de la bibliothèque, les usagers doivent respecter les consignes suivantes :'}
          </p>
          <ul style={{ lineHeight: 1.8, paddingLeft: 20, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            <li>{isEnglish ? 'Do not enter with a bag inside the library' : 'Ne pas entrer avec le sac à l\'intérieur de la bibliothèque'}</li>
            <li>{isEnglish ? 'Do not enter with food or drink' : 'Ne pas entrer avec de la nourriture ou de la boisson'}</li>
            <li>{isEnglish ? 'Do not make phone calls' : 'Ne pas téléphoner'}</li>
            <li>{isEnglish ? 'Do not make noise' : 'Ne pas faire de bruit'}</li>
            <li>{isEnglish ? 'Do not access books without authorization' : 'Ne pas accéder aux ouvrages sans autorisation'}</li>
          </ul>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Some advantages inside the library' : 'Quelques avantages à l\'intérieur de la bibliothèque'}
          </h4>
          <p style={{ fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8, fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish ? 'Once inside and if you have a laptop:' : 'Une fois à l\'intérieur et si vous disposez d\'un ordinateur portable :'}
          </p>
          <ul style={{ lineHeight: 1.8, paddingLeft: 20, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            <li>{isEnglish ? 'You can access our WiFi' : 'Vous avez la possibilité d\'accéder à notre Wifi'}</li>
            <li>{isEnglish ? 'You can access digital resources consultable only on site' : 'Vous avez la possibilité d\'accéder aux ressources numériques consultables uniquement sur place'}</li>
            <li>{isEnglish ? 'You can access intranet resources' : 'Vous avez la possibilité d\'accéder aux ressources en intranet'}</li>
            <li>{isEnglish ? 'You can benefit from IT and technical assistance' : 'Vous avez la possibilité de bénéficier d\'une assistance informatique et technique'}</li>
          </ul>
        </div>

        <div style={{ marginTop: 28, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 12 }}>
            {isEnglish ? 'Library Regulations' : 'Règlement de la Bibliothèque'}
          </h4>
          <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
            {isEnglish
              ? 'The Central Library (BC) is a specialized center of the University of Yaoundé I whose purpose is to meet the documentary needs of students, teachers, researchers and staff of the institution as well as external persons, duly authorized by the responsible authorities and whose documentary research justifies frequenting a university library. These internal regulations specify the rights and duties of the aforementioned users.'
              : 'La Bibliothèque Centrale (BC) est un centre spécialisé de l\'Université de Yaoundé I qui a pour vocation de répondre aux besoins documentaires des étudiants, enseignants, chercheurs et personnels de l\'institution ainsi qu\'aux personnes extérieures, dûment autorisées par les autorités responsables et dont la recherche documentaire justifie la fréquentation d\'une bibliothèque universitaire. Le présent règlement intérieur a pour objet de préciser les droits et les devoirs des usagers sus cités.'}
          </p>

          <div style={{ marginTop: 18 }}>
            <a href={reglementInterieurPDF} target="_blank" rel="noreferrer" download style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, var(--or) 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', padding: '12px 18px', borderRadius: 10, fontWeight: 700, boxShadow: '0 8px 20px rgba(217,119,6,0.25)' }}>
              <Download size={18} />
              {isEnglish ? 'Download internal regulations' : 'Télécharger le règlement intérieur'}
            </a>
          </div>
        </div>
      </div>
    )
  },
  wifi: {
    titleFr: 'Accès WiFi Campus', titleEn: 'Campus WiFi Access',
    icon: '📶',
    descFr: "La bibliothèque offre un accès WiFi haut débit de 200 Mbps avec couverture totale sur l'ensemble des 3 niveaux.",
    descEn: 'The library offers high-speed 200 Mbps WiFi access with total coverage across all 3 levels.',
    detailsFr: [
      'Débit : 200 Mbps symétrique',
      'Couverture : 100% des espaces intérieurs',
      'Connexion : Identifiants SIGB ou réseau universitaire',
      'Accès aux bases de données en ligne inclus',
      'Filtrage respectueux de la vie privée'
    ],
    detailsEn: [
      'Speed: 200 Mbps symmetric',
      'Coverage: 100% of indoor spaces',
      'Connection: SIGB credentials or university network',
      'Access to online databases included',
      'Privacy-respecting filtering'
    ],
    hoursFr: 'Disponible 24h/24 dans les zones couvertes',
    hoursEn: 'Available 24/7 in covered areas',
    content: (isEnglish) => (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'clamp(20px, 1.8vw, 24px)', color: 'var(--bleu-nuit)', marginBottom: 16, fontWeight: 700 }}>
          {isEnglish ? 'WiFi Access' : 'Accès au WIFI'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 26 }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 22px rgba(27,20,100,0.06)' }}>
            <img src={wifiImage} alt={isEnglish ? 'WiFi access at the Central Library' : 'Accès WiFi à la Bibliothèque Centrale'} style={{ width: '100%', height: 'clamp(120px, 24vw, 180px)', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 22px rgba(27,20,100,0.06)' }}>
            <img src={wifiImage2} alt={isEnglish ? 'WiFi at the Central Library' : 'WiFi à la Bibliothèque Centrale'} style={{ width: '100%', height: 'clamp(120px, 24vw, 180px)', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'The Central Library of the University of Yaoundé I provides free and secure access to the Web and software (word processing, photo editing) adapted to the user. The workstation reservation service is no longer in effect in the library; usage quotas are applied per user and per day, also according to their level.'
            : 'La Bibliothèque Centrale de l\'Université de Yaoundé I donne un accès gratuit et sécurisé au Web et à des logiciels (traitement de texte, retouche de photographie), adaptés à l\'usager. Le service de réservation des postes n\'a plus cours dans la bibliothèque ; des quotas d\'utilisation sont appliqués par usager et par jour, également en fonction de leur niveau.'}
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'WiFi access is now available at the library' : 'L\'accès au WIFI est désormais disponible à la bibliothèque'}
        </h4>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'Internet consultation is free and open. It is governed by a charter that defines its use. Users must have a reader or consultation card or be accompanied by an adult to access it.'
            : 'La consultation d\'Internet est libre et gratuite. Elle est régie par une charte qui en définit l\'utilisation. Les usagers doivent posséder une carte de lecteur ou de consultation ou être accompagnés d\'un adulte pour y accéder.'}
        </p>

        <h5 style={{ fontWeight: 700, marginTop: 20, color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish ? 'Conditions of access and use' : 'Conditions d\'accès et d\'utilisation'}
        </h5>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'All Internet features are accessible but, in order to respect the missions incumbent on libraries, the use of online chat and messaging is only tolerated. In case of abuse, the library reserves the right to suspend the connection.'
            : 'Toutes les fonctionnalités d\'Internet sont accessibles mais, dans le souci de respecter les missions qui incombent aux bibliothèques, l\'usage de la discussion en ligne (Chat) et de la messagerie est seulement toléré. En cas d\'abus, la bibliothèque se réserve le droit de suspendre la connexion.'}
        </p>

        <ul style={{ lineHeight: 1.8, paddingLeft: 20, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          <li>{isEnglish ? 'Downloading and saving data to a hard drive or floppy disk is not allowed for technical reasons related to network management.' : 'Le téléchargement et l\'enregistrement de données sur disque dur ou disquette ne sont pas autorisés pour des raisons techniques liées à la gestion du réseau.'}</li>
          <li>{isEnglish ? 'It is forbidden to enter systems other than those for which access is provided, to impede the system, to damage data and to attempt to access the hard drive.' : 'Il est interdit de pénétrer dans des systèmes autres que ceux dont l\'accès est prévu, d\'entraver le système, de porter atteinte aux données et de tenter d\'accéder au disque dur.'}</li>
          <li>{isEnglish ? 'The law of 1 July 1992 on intellectual property punishes software counterfeiting.' : 'La loi du 1er juillet 1992 relative à la propriété intellectuelle réprime la contrefaçon de logiciels.'}</li>
          <li>{isEnglish ? 'For those under 18, Internet consultation is reserved for holders of a Library subscription card.' : 'Pour les moins de 18 ans, la consultation d\'Internet est réservée aux détenteurs d\'une carte d\'abonnement à la Bibliothèque.'}</li>
        </ul>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'The Central Library of the University of Yaoundé 1 now offers Wi-Fi (wireless Internet) access. In areas covered by this network, you can work on your laptop while having Internet access, provided your laptop has a Wi-Fi connection.'
            : 'La Bibliothèque Centrale de l\'Université de Yaoundé 1 propose à présent un accès Wi-Fi (Internet sans fil). Dans les zones couvertes par ce réseau, vous pouvez donc travailler sur votre ordinateur portable tout en disposant d\'un accès à Internet, à condition que votre portable dispose d\'une connexion Wi-Fi.'}
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'Connecting to the Wi-Fi network' : 'Se connecter au réseau Wi-Fi'}
        </h4>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'In order for your laptop to connect to the Internet via the Wi-Fi network, it must have the necessary connections (built-in Wi-Fi support or additional Wi-Fi card). Laptops without Wi-Fi connection will not be able to connect to the network in the Libraries.'
            : 'Afin que votre portable puisse se connecter à Internet via le réseau Wi-Fi, il doit disposer des connexions nécessaires (support Wi-Fi intégré ou carte Wi-Fi supplémentaire). Les portables ne disposant pas de connexion Wi-Fi ne pourront se connecter au réseau dans les Bibliothèques.'}
        </p>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'If your laptop\'s Wi-Fi support is activated, it will automatically detect the wireless network "NETWORK_UY1" available at the library and on campus. Note: authentication is required to access the Internet. This authentication is done based on login and password.'
            : 'Si le support Wi-Fi de votre portable est activé, celui-ci détectera automatiquement le réseau sans fil "NETWORK_UY1" disponible à la bibliothèque et dans le campus. Attention : une authentification est nécessaire pour accéder à Internet. Cette authentification se fait sur base des login et mot de passe.'}
        </p>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'The WiFi connection available at the Library and on the University campus in general is managed by the University network service (Resbcuy1) and CUTI. In case of problems, please contact Resbcuy1 or Cuti directly by email or phone.'
            : 'La connexion WiFi disponible à la Bibliothèque et sur le campus de l\'Université en général est gérée par le service réseau de l\'Université (Resbcuy1) et le CUTI. En cas de problème, veuillez contacter directement Resbcuy1 ou le Cuti par e-mail ou par téléphone.'}
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'Computer security' : 'Sécurité informatique'}
        </h4>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'The computer security of your equipment rests entirely with you. We therefore strongly advise you to equip your computer with the necessary protections against viruses, intrusions and other spyware.'
            : 'La sécurité informatique de votre matériel repose entièrement sur vous. Nous vous conseillons donc vivement d\'équiper votre ordinateur des protections nécessaires contre les virus, intrusions et autres programmes espions.'}
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'Charter of the user of the Library network and website' : 'Charte de l\'utilisateur du réseau et du site web de la Bibliothèque'}
        </h4>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'The members of the university community wish to reaffirm, through this document, their concern to use the new information techniques...'
            : 'Les membres de la communauté universitaire entendent réaffirmer, par le présent document, leur souci de n\'utiliser les nouvelles techniques de l\'information...'}
          <Link to="/charte" style={{ color: 'var(--or)', fontWeight: 700, marginLeft: 6 }}>{isEnglish ? 'Read more' : 'Lire la suite'}</Link>
        </p>

        <h4 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
          {isEnglish ? 'Power supply' : 'Alimentation électrique'}
        </h4>

        <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
          {isEnglish
            ? 'You are allowed to connect your PC to the power supply, within the limits of available outlets. This must not, however, be a source of nuisance or danger to other library users. It is therefore forbidden to unplug public computers or other devices, to run cables across passages and in all places where they would be inconvenient or dangerous. Please respect the instructions that staff members may give you.'
            : 'Vous êtes autorisés à raccorder votre PC à l\'alimentation électrique, dans la mesure des prises disponibles. Ceci ne doit cependant pas être une source de gêne ou de danger pour les autres utilisateurs de la bibliothèque. Il est ainsi interdit de débrancher les ordinateurs publics ou d\'autres appareils, de tendre des câbles en travers des passages et dans tous les endroits où ils seraient incommodés ou dangereux. Merci de respecter les instructions que pourraient vous donner les membres du personnel.'}
        </p>
      </div>
    )
  },
  reliure: {
    titleFr: 'Atelier de reliure', titleEn: 'Binding Workshop',
    icon: '📋',
    descFr: "La section reliure est équipée d'un atelier en charge de protéger le livre, d'augmenter sa stabilité et sa durée de vie.",
    descEn: 'The binding section is equipped with a workshop responsible for protecting books, increasing their stability and lifespan.',
    detailsFr: [
      'Reliure courante (toile, carton ou cuir) — accessible à tous',
      "Reliure d'art ou de création — pour bibliophiles et collectionneurs",
      'Reliure manuelle sans machine (baguettes Relido)',
      'Reliure mécanique (anneaux plastiques / métalliques, spirales)',
      'Reliure thermique (thermoreliure)',
      'Délai standard : 24 à 72h ouvrées selon le type de reliure',
    ],
    detailsEn: [
      'Standard binding (cloth, cardboard or leather) — for everyone',
      'Art or creative binding — for bibliophiles and collectors',
      'Manual binding without machine (Relido rods)',
      'Mechanical binding (plastic/metal rings, spirals)',
      'Thermal binding (thermobinding)',
      'Standard delay: 24 to 72 working hours depending on the type',
    ],
    hoursFr: '08h00 – 17h00 (Lun–Ven)',
    hoursEn: '08:00 – 17:00 (Mon–Fri)',
    content: (isEnglish) => (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', color: 'var(--bleu-nuit)', marginBottom: 20, fontWeight: 700 }}>
          🛠️ {isEnglish ? 'Binding Workshop at the Central Library of UYI!' : "Atelier de reliure à la Bibliothèque Centrale de l'UYI !"}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
          <img src={reluireImage} alt={isEnglish ? 'Binding workshop' : 'Atelier de reliure'} style={{ width: 'clamp(150px, 20vw, 200px)', height: 'clamp(150px, 20vw, 200px)', objectFit: 'cover', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', flexShrink: 0 }} />
          <p style={{ flex: 1, minWidth: 240, lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', margin: 0 }}>
            {isEnglish ? <><strong>The binding</strong> section is equipped with a workshop responsible for <strong>protecting books</strong>, <strong>increasing their stability</strong> and their <strong>lifespan</strong>.</> : <>La section <strong>reliure</strong> est équipée d'un atelier en charge de <strong>protéger le livre</strong>, d'<strong>augmenter sa stabilité</strong> et sa <strong>durée de vie</strong>.</>}
          </p>
        </div>

        <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 14 }}>
          {isEnglish ? 'There are two types of binding:' : 'Il existe deux types de reliure :'}
        </h4>

        <div style={{ display: 'grid', gap: 14, marginBottom: 28 }}>
          <div style={{ padding: 18, background: 'var(--beige)', borderRadius: 12, borderLeft: '4px solid var(--or)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>📚</span>
              <strong style={{ color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
                {isEnglish ? 'Standard binding' : 'La reliure courante'}
              </strong>
            </div>
            <p style={{ margin: 0, color: 'var(--texte-muted)', fontSize: 'clamp(13px, 0.9vw, 14px)', lineHeight: 1.8 }}>
              {isEnglish ? <>Sober work in cloth, cardboard or leather, which does not require creativity. This type of binding <strong>is for everyone</strong>.</> : <>Travail sobre en toile, en carton ou en cuir, qui ne fait pas appel à la créativité. Ce type de reliure <strong>s'adresse à tous</strong>.</>}
            </p>
          </div>

          <div style={{ padding: 18, background: 'var(--beige)', borderRadius: 12, borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🎨</span>
              <strong style={{ color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
                {isEnglish ? 'Art or creative binding' : "La reliure d'art ou de création"}
              </strong>
            </div>
            <p style={{ margin: 0, color: 'var(--texte-muted)', fontSize: 'clamp(13px, 0.9vw, 14px)', lineHeight: 1.8 }}>
              {isEnglish ? <>For <strong>individuals, bibliophiles and collectors</strong>. Art binding is part of artisanal binding; it applies to precious works and most often to <strong>unique copies</strong>.</> : <>S'adresse essentiellement aux <strong>particuliers, bibliophiles et collectionneurs</strong>. La reliure d'art représente une partie de la reliure artisanale, elle s'applique à des ouvrages précieux et le plus souvent à des <strong>exemplaires uniques</strong>.</>}
            </p>
          </div>
        </div>

        <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 32 }}>
          {isEnglish ? <>If you have documents to bind, several options are available depending on the type of document and its destination. <strong>Our mission is to help you sort</strong> between the different binding methods and the different binding machines usable according to your needs.</> : <>Si vous avez des documents à relier, plusieurs possibilités s'offrent à vous selon le type de document et sa destination. <strong>Notre vocation est de vous aider à faire le tri</strong> entre les différentes méthodes de reliure et les différentes machines à relier utilisables en fonction de vos besoins.</>}
        </p>

        {/* SECTION 1 */}
        <section style={{ marginBottom: 40 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(16px, 1.2vw, 19px)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 22 }}>✋</span>
            {isEnglish ? 'Manual binding without machine' : 'La reliure manuelle sans machine'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={reliureManuelleImage} alt={isEnglish ? 'Manual binding' : 'Reliure manuelle'} style={{ width: 'clamp(180px, 25vw, 240px)', height: 'auto', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
                {isEnglish ? <>You can already bind A4 documents <strong>without perforation or machine</strong>: thanks to <strong>Relido</strong> binding rods. It is the simplest, fastest and cheapest system for binding documents from <strong>2 to 130 sheets</strong>.</> : <>Vous pouvez déjà relier des documents au format A4 <strong>sans perforation ni machine</strong> : grâce aux baguettes à relier <strong>Relido</strong>. On n'y pense pas forcément, mais c'est le système le plus simple, le plus rapide et le moins cher pour relier des documents de <strong>2 à 130 feuilles</strong>.</>}
              </p>
              <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', margin: 0 }}>
                {isEnglish ? <>These sliding rods have a rounded corner that makes it easier to insert sheets. This method is perfect for files that should not be handled too often, this type of binding being slightly less solid than mechanical or thermal binding.</> : <>Ces baguettes coulissantes sont équipées d'un coin arrondi qui facilite l'insertion des feuilles. Cette méthode convient parfaitement aux dossiers qui ne doivent pas être manipulés trop souvent, ce type de reliure étant un peu moins solide que la reliure mécanique ou thermique.</>}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section style={{ marginBottom: 40 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(16px, 1.2vw, 19px)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 22 }}>⚙️</span>
            {isEnglish ? 'Mechanical binding with machine' : 'La reliure mécanique avec machine'}
          </h4>
          <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 16 }}>
            {isEnglish ? 'Then you can bind your documents using the mechanical binding principle (a perforation followed by mounting a binding) by choosing:' : 'Ensuite vous pouvez relier vos documents selon le principe de la reliure mécanique (une perforation suivie du montage d\'une reliure) en choisissant :'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
            {[
              { icon: '🔗', labelFr: 'La reliure par anneaux plastique', labelEn: 'Plastic ring binding' },
              { icon: '⭕', labelFr: 'La reliure par anneau métallique', labelEn: 'Metal ring binding' },
              { icon: '🌀', labelFr: 'La reliure par spirale plastique', labelEn: 'Plastic spiral binding' },
              { icon: '🧵', labelFr: 'La reliure par spirale métallique', labelEn: 'Metal spiral binding' },
            ].map((item) => (
              <div key={item.labelFr} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--beige)', borderRadius: 10, border: '1px solid var(--border-light)', fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte)', fontWeight: 500 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {isEnglish ? item.labelEn : item.labelFr}
              </div>
            ))}
          </div>
          <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 24 }}>
            {isEnglish ? <>Plastic and metal ring bindings can be made either by a <strong>specific punching machine</strong> or by a <strong>multifunction punch</strong> (which combines both binding systems).</> : <>Les reliures par anneaux plastiques et métalliques peuvent être réalisées soit par une <strong>perforelieuse spécifique</strong>, soit par un <strong>perforelieur multifonctions</strong> (qui combine les deux systèmes de reliure).</>}
          </p>

          <div style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', padding: 20, background: 'white', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: 20 }}>
            <img src={reliureAnneauImage} alt={isEnglish ? 'Plastic ring binding' : 'Reliure anneaux plastique'} style={{ width: 'clamp(160px, 22vw, 220px)', height: 'auto', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.1)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <h5 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 1vw, 16px)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                🔗 {isEnglish ? 'Plastic ring binding' : 'La reliure par anneau plastique'}
              </h5>
              <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(13px, 0.9vw, 14px)', margin: 0 }}>
                {isEnglish ? <><strong>21-hole plastic ring binding (American pitch)</strong> is undoubtedly the most used, both for its simplicity and its excellent value for money. This mechanical binding method requires using a <strong>plastic ring punching machine</strong> (or multifunction) to perforate the sheets before binding them with plastic ring rods (combs) of different diameters (depending on thickness) and colors.</> : <>La reliure par anneau plastique <strong>21 trous (Pas américain)</strong> est incontestablement la plus utilisée, tant pour sa simplicité que pour son excellent rapport qualité/prix. Cette méthode de reliure mécanique nécessite d'utiliser une <strong>perforelieuse anneau plastique</strong> (ou multifonctions) pour perforer les feuilles avant de les relier avec des baguettes (peignes) anneaux plastiques de différents diamètres (selon l'épaisseur) et couleurs.</>}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section style={{ marginBottom: 24 }}>
          <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(16px, 1.2vw, 19px)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '2px solid var(--border-light)' }}>
            <span style={{ fontSize: 22 }}>🔥</span>
            {isEnglish ? 'Thermal binding (thermobinding)' : 'La reliure thermique (thermoreliure)'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={reliureThermiqueImage} alt={isEnglish ? 'Thermal binding' : 'Reliure thermique'} style={{ width: 'clamp(180px, 25vw, 240px)', height: 'auto', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', flexShrink: 0 }} />
            <p style={{ flex: 1, minWidth: 240, lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', margin: 0 }}>
              {isEnglish ? <>The <strong>thermo-binding</strong> system (also called thermal binding) consists of hot-gluing paper into folders whose cardboard spine is pre-glued. This produces <strong>high-quality folders, dissertations and theses</strong>, which look like softcover books, all impeccably bound in seconds.</> : <>Le système de <strong>thermo-reliure</strong> (appelé aussi reliure thermique), consiste à coller à chaud du papier dans des chemises dont le dos cartonné est pré-collé. On obtient ainsi des <strong>dossiers, des mémoires et des thèses de haute qualité</strong>, qui ont l'apparence d'un livre à couverture souple, le tout impeccablement relié en quelques secondes.</>}
            </p>
          </div>
        </section>

        <div style={{ marginTop: 32, padding: 20, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(27,20,100,0.05))', borderRadius: 14, border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>📞</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
                {isEnglish ? 'Need a binding service?' : "Besoin d'un service de reliure ?"}
              </strong>
              <span style={{ fontSize: 'clamp(12px, 0.85vw, 13px)', color: 'var(--texte-muted)' }}>
                {isEnglish ? 'Contact us for a personalized quote' : 'Contactez-nous pour un devis personnalisé'}
              </span>
            </div>
          </div>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: 'clamp(13px, 0.9vw, 14px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Mail size={16} /> {isEnglish ? 'Contact us' : 'Nous contacter'}
          </Link>
        </div>
      </div>
    )
  },
  mediation: {
    titleFr: 'Médiation documentaire', titleEn: 'Documentary Mediation',
    icon: '🤝',
    descFr: 'Le service de médiation aide les usagers à optimiser leur recherche documentaire.',
    descEn: 'The mediation service helps users optimize their documentary research.',
    detailsFr: [
      'Assistance à la recherche bibliographique',
      "Aide à l'utilisation du catalogue PMB",
      'Initiation aux bases de données en ligne',
      'Rédaction de bibliographies',
      'Rendez-vous individuels sur réservation'
    ],
    detailsEn: [
      'Bibliographic research assistance',
      'Help using the PMB catalog',
      'Introduction to online databases',
      'Bibliography writing',
      'Individual appointments by reservation'
    ],
    hoursFr: '10h00 – 22h00 (Lun–Ven) — Sur rendez-vous',
    hoursEn: '10:00 – 22:00 (Mon–Fri) — By appointment',
    content: null
  },
  formation: {
    titleFr: 'Formation documentaire & Produits documentaires',
    titleEn: 'Documentary Training & Documentary Products',
    icon: '🎓',
    descFr: "Formations à la maîtrise de l'information scientifique et élaboration de produits documentaires adaptés aux besoins des usagers.",
    descEn: "Training in mastering scientific information and developing documentary products adapted to users' needs.",
    detailsFr: [
      'Formation L1-L2 : Introduction à la bibliothèque (2h)',
      'Formation Master : Méthodologie de la recherche (4h)',
      'Atelier : Rédiger une bibliographie normalisée',
      'Atelier : Utiliser Research4Life et les bases de données',
      'Dossier documentaire, bibliographie, bulletin de sommaires…',
      'Chaque jeudi à 14h00 — Salle B12',
    ],
    detailsEn: [
      'Training L1-L2: Introduction to the library (2h)',
      'Master training: Research methodology (4h)',
      'Workshop: Writing a standardized bibliography',
      'Workshop: Using Research4Life and databases',
      'Documentary file, bibliography, abstracts bulletin…',
      'Every Thursday at 14:00 — Room B12',
    ],
    hoursFr: 'Jeudi 14h00 (session libre) + sessions programmées',
    hoursEn: 'Thursday 14:00 (open session) + scheduled sessions',
    content: (isEnglish) => (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 'clamp(20px, 1.8vw, 26px)', color: 'var(--bleu-nuit)', marginBottom: 20, fontWeight: 700 }}>
          📚 {isEnglish ? 'Documentary Products of the Central Library of UYI!' : "Produits documentaires de la Bibliothèque Centrale de l'UYI !"}
        </h3>

        <div style={{ padding: 20, background: 'var(--beige)', borderRadius: 14, borderLeft: '4px solid var(--or)', marginBottom: 28 }}>
          <p style={{ lineHeight: 1.9, color: 'var(--texte)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
            {isEnglish ? <>To best meet your information needs, the Central Library of the University of Yaoundé I develops <strong>documentary products</strong> for you.</> : <>Afin de répondre au mieux à vos besoins d'information, la Bibliothèque Centrale de l'Université de Yaoundé I élabore pour vous, des <strong>produits documentaires</strong>.</>}
          </p>
          <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
            {isEnglish ? <>This information need can be expressed directly by the public to the library or identified by itself. By producing documentary products, the BC-UYI also aligns with this logic of responding to the informational needs of its users and the community, applying a <strong>rigorous quality approach</strong>.</> : <>Ce besoin d'information peut être exprimé directement par le public auprès de la bibliothèque ou repéré par elle-même. En réalisant des produits documentaires, la BC-UYI s'inscrit aussi dans cette logique de répondre aux besoins informationnels de ses usagers et de la communauté en s'imposant une <strong>démarche qualité rigoureuse</strong>.</>}
          </p>
          <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', margin: 0 }}>
            {isEnglish ? <>A documentary product can be understood as a <strong>Secondary or tertiary document</strong>, designed to meet information needs, in various forms: bibliography, bibliographic or liaison bulletin, abstracts bulletin, documentary file, press file, SDI, press review, state of the question, documentary synthesis, etc.</> : <>Un produit documentaire peut s'entendre comme un <strong>Document secondaire ou tertiaire</strong>, conçu pour répondre à des besoins d'information, sous des formes diverses : bibliographie, bulletin bibliographique ou de liaison, bulletin de sommaires, dossier documentaire, dossier de presse, DSI, revue de presse, état de la question, synthèse documentaire, etc.</>}
          </p>
        </div>

        <h4 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(16px, 1.2vw, 19px)', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          {isEnglish ? 'Some documentary products made at the BC-UYI' : 'Quelques produits documentaires réalisés à la BC-UYI'}
        </h4>

        <div style={{ display: 'grid', gap: 20 }}>
          {[
            { icon: '📁', color: '#3b82f6', titleFr: 'Dossier documentaire', titleEn: 'Documentary file', descFr: "« Produit documentaire constitué d'un ensemble de documents de sources diverses, choisis et réunis sur une question donnée, et organisé de façon à faciliter l'accès à l'information rassemblée. Les éléments qui le composent peuvent être de nature et de support très variés : photographies, articles de revues, brochures, etc. Il peut donner lieu à des mises à jour régulières au fur et à mesure de la parution de nouvelles informations ; sa durée de vie est limitée dans le temps. Il peut être constitué ponctuellement à la demande ou systématiquement sur des thèmes précis. Un dossier documentaire peut être sur support papier ou électronique. »", descEn: "« A documentary product consisting of a set of documents from various sources, chosen and gathered on a given question, and organized to facilitate access to the gathered information. Its components can be of very varied nature and medium: photographs, journal articles, brochures, etc. It may be regularly updated as new information appears; its lifespan is limited in time. It can be created occasionally on request or systematically on specific themes. A documentary file can be on paper or electronic medium. »" },
            { icon: '📚', color: '#059669', titleFr: 'Bibliographie', titleEn: 'Bibliography', descFr: "« Liste de notices bibliographiques classées selon certains critères pour en permettre le repérage. Elle peut parfois indiquer la localisation des documents recensés. Elle peut être : signalétique (titre, auteurs, etc.) ou analytique (avec un résumé) ; actuelle ou rétrospective ; exhaustive ou sélective. »", descEn: "« A list of bibliographic records classified according to certain criteria to allow their location. It may sometimes indicate the location of the listed documents. It can be: descriptive (title, authors, etc.) or analytical (with a summary); current or retrospective; exhaustive or selective. »" },
            { icon: '📧', color: '#8b5cf6', titleFr: "Lettre d'information électronique", titleEn: 'Electronic newsletter', descFr: "« Publication périodique, sur tout support, de faible volume, diffusant en primeur des informations à des abonnés ou à un public préférentiel [par voie internet]. »", descEn: "« A periodic publication, on any medium, of small volume, broadcasting information in first release to subscribers or a preferential audience [via the internet]. »" },
            { icon: '📰', color: '#f59e0b', titleFr: "Bulletin / lettre d'information", titleEn: 'Bulletin / newsletter', descFr: "« Revue éditée par une association, une administration ou un organisme. »", descEn: "« A journal published by an association, an administration or an organization. »" },
            { icon: '📖', color: '#0891b2', titleFr: 'Répertoire', titleEn: 'Directory', descFr: "« Liste présentant des informations, quel qu'en soit le support, classées par ordre alphabétique, numérique, chronologique ou systématique pour l'identification, la description ou la localisation de personnes, de documents, d'organismes, de lieux, de ressources Internet ou d'objets. »", descEn: "« A list presenting information, whatever the medium, classified by alphabetical, numerical, chronological or systematic order for the identification, description or location of persons, documents, organizations, places, Internet resources or objects. »" },
            { icon: '✍️', color: '#dc2626', titleFr: 'Produit de veille : blog', titleEn: 'Monitoring product: blog', descFr: "« Espace individuel d'expression, créé pour délivrer des informations diverses et/ou donner la parole à tous les internautes sur une thématique particulière (la veille documentaire par exemple). »", descEn: "« An individual expression space, created to deliver various information and/or give voice to all internet users on a particular theme (documentary monitoring for example). »" },
            { icon: '📊', color: '#10B981', titleFr: 'Panorama de presse', titleEn: 'Press review', descFr: "« Produit documentaire à parution périodique (quotidien, hebdomadaire) constitué d'un ensemble d'extraits de presse, sur support papier ou électronique. »", descEn: "« A documentary product published periodically (daily, weekly) consisting of a set of press extracts, on paper or electronic medium. »" },
            { icon: '🗂️', color: '#6366f1', titleFr: 'Catalogue', titleEn: 'Catalog', descFr: "« Liste ordonnée de notices d'objets ou de documents (notice bibliographique, notice catalographique) d'une collection permanente ou temporaire, réelle ou fictive, constituant un instrument de recherche. »", descEn: "« An ordered list of records of objects or documents (bibliographic record, catalog record) of a permanent or temporary, real or fictional collection, constituting a research tool. »" },
            { icon: '📥', color: '#a16207', titleFr: "Bulletin d'acquisition", titleEn: 'Acquisition bulletin', descFr: "« Bulletin à parution périodique contenant une bibliographie signalétique ou analytique des dernières acquisitions d'un centre documentaire ou du dépouillement des dernières revues reçues. »", descEn: "« A periodically published bulletin containing a descriptive or analytical bibliography of the latest acquisitions of a documentation center or of the analysis of the latest journals received. »" },
            { icon: '📝', color: '#7C3AED', titleFr: 'Synthèse documentaire', titleEn: 'Documentary synthesis', descFr: "« Produit documentaire se présentant sous différentes formes (texte, exposé oral, image, panneaux d'exposition, etc.) et nécessitant la constitution d'un corpus d'informations écrites, orales ou audiovisuelles, l'analyse, la condensation et la reformulation des informations contenues dans ce corpus. »", descEn: "« A documentary product presented in different forms (text, oral presentation, image, exhibition panels, etc.) and requiring the constitution of a corpus of written, oral or audiovisual information, the analysis, condensation and reformulation of the information contained in this corpus. »" },
          ].map((item) => (
            <div key={item.titleFr} style={{ padding: 20, background: 'white', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', borderTop: `4px solid ${item.color}` }}>
              <h5 style={{ fontWeight: 700, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                {isEnglish ? item.titleEn : item.titleFr}
              </h5>
              <p style={{ lineHeight: 1.9, color: 'var(--texte-muted)', fontSize: 'clamp(13px, 0.9vw, 14px)', margin: 0, fontStyle: 'italic' }}>
                {isEnglish ? item.descEn : item.descFr}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 24, background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(27,20,100,0.05))', borderRadius: 14, border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <div>
              <strong style={{ display: 'block', color: 'var(--bleu-nuit)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
                {isEnglish ? 'Interested in training or a documentary product?' : 'Intéressé par une formation ou un produit documentaire ?'}
              </strong>
              <span style={{ fontSize: 'clamp(12px, 0.85vw, 13px)', color: 'var(--texte-muted)' }}>
                {isEnglish ? 'Contact us for personalized support' : 'Contactez-nous pour un accompagnement personnalisé'}
              </span>
            </div>
          </div>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: 'clamp(13px, 0.9vw, 14px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Mail size={16} /> {isEnglish ? 'Contact us' : 'Nous contacter'}
          </Link>
        </div>
      </div>
    )
  }
};

// ============================================================
// SERVICES PAGE
// ============================================================

export function ServicesPage({ type = 'general' }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const s = SERVICES_DATA[type] || SERVICES_DATA.consultation;

  if (type === 'general') {
    return (
      <>
        <Seo
          title={isEnglish ? 'Our services' : 'Nos services'}
          path="/services"
          description={isEnglish ? 'Discover the services of the Central Library of the University of Yaoundé I.' : 'Découvrez les services de la Bibliothèque Centrale Universitaire de Yaoundé I.'}
          keywords="services bibliothèque UYI"
          canonical="https://bcu-uyi.cm/services"
        />
        <Layout>
          <Helmet><title>{isEnglish ? 'Our Services' : 'Nos Services'} - Bibliothèque Centrale UYI</title></Helmet>
          <style>{responsiveStyles}</style>
          <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
            <div className="container">
              <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Services' : 'Services' }]} />
              <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400 }}>
                {isEnglish ? 'Our ' : 'Nos '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Services' : 'Services'}</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
                {isEnglish ? 'Discover the full range of services offered by the Central Library' : "Découvrez l'ensemble des services proposés par la Bibliothèque Centrale"}
              </p>
            </div>
          </div>
          <div className="container" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(16px, 2vw, 24px)' }}>
              {[
                { titleFr: 'Espace consultation', titleEn: 'Consultation Area', icon: '📖', descFr: 'Salles de lecture climatisées', descEn: 'Air-conditioned reading rooms', link: '/services/consultation' },
                { titleFr: 'Accès WiFi Campus', titleEn: 'Campus WiFi Access', icon: '📶', descFr: 'WiFi haut débit 200 Mbps', descEn: 'High-speed 200 Mbps WiFi', link: '/services/wifi' },
                { titleFr: 'Atelier de reliure', titleEn: 'Binding Workshop', icon: '📋', descFr: 'Reliure thermique, spirale, anneaux', descEn: 'Thermal, spiral, ring binding', link: '/services/reliure' },
                { titleFr: 'Médiation documentaire', titleEn: 'Documentary Mediation', icon: '🤝', descFr: 'Assistance à la recherche', descEn: 'Research assistance', link: '/services/mediation' },
                { titleFr: 'Formation & Produits documentaires', titleEn: 'Training & Documentary Products', icon: '🎓', descFr: 'Formations et produits documentaires', descEn: 'Training and documentary products', link: '/services/formation' },
              ].map((service, index) => (
                <Reveal key={service.titleFr} className="reveal-up" delay={index * 80}>
                  <Link to={service.link} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'clamp(20px, 2.5vw, 28px)', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.3s ease', textAlign: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--or)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ fontSize: 'clamp(32px, 3.5vw, 40px)', marginBottom: 12 }}>{service.icon}</div>
                    <h3 style={{ fontWeight: 700, fontSize: 'clamp(15px, 1.1vw, 17px)', color: 'var(--bleu-nuit)', marginBottom: 8 }}>{isEnglish ? service.titleEn : service.titleFr}</h3>
                    <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', lineHeight: 1.6 }}>{isEnglish ? service.descEn : service.descFr}</p>
                    <div style={{ marginTop: 14, color: 'var(--or)', fontSize: 'clamp(12px, 0.8vw, 13px)', fontWeight: 600 }}>{isEnglish ? 'Learn more →' : 'En savoir plus →'}</div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Layout>
      </>
    );
  }

  const title = isEnglish ? (s.titleEn || s.titleFr) : s.titleFr;
  const desc = isEnglish ? (s.descEn || s.descFr) : s.descFr;
  const details = isEnglish ? (s.detailsEn || s.detailsFr) : s.detailsFr;
  const hours = isEnglish ? (s.hoursEn || s.hoursFr) : s.hoursFr;
  const content = typeof s.content === 'function' ? s.content(isEnglish) : s.content;

  return (
    <>
      <Seo title={title} path={`/services/${type}`} description={desc} />
      <Layout>
        <Helmet><title>{title} - Bibliothèque Centrale UYI</title></Helmet>
        <style>{responsiveStyles}</style>
        <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
          <div className="container">
            <Breadcrumb items={[
              { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
              { label: isEnglish ? 'Services' : 'Services', href: '/services' },
              { label: title }
            ]} />
            <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'white', fontWeight: 400 }}>{title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>{desc}</p>
          </div>
        </div>
        <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
          <Reveal className="reveal-up">
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 32px)', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 'clamp(16px, 1.1vw, 17px)', color: 'var(--bleu-nuit)' }}>
                {isEnglish ? 'What we offer' : 'Ce que nous offrons'}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {details.map(d => (
                  <li key={d} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'clamp(14px, 0.95vw, 15px)', color: 'var(--texte-muted)' }}>
                    <CheckCircle size={18} color="var(--or)" style={{ flexShrink: 0, marginTop: 1 }} /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal className="reveal-up" delay={100}>
            <div style={{ background: 'var(--beige)', borderRadius: 'var(--radius-sm)', padding: 'clamp(14px, 1.5vw, 16px) clamp(20px, 3vw, 24px)', border: '1px solid var(--border)', fontSize: 'clamp(13px, 0.9vw, 14px)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Clock size={18} color="var(--or)" /> <strong>{isEnglish ? 'Hours:' : 'Horaires :'}</strong> {hours}
            </div>
          </Reveal>
          <div style={{ marginTop: 32, display: 'flex', gap: 'clamp(8px, 1vw, 12px)', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-bleu" style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', padding: 'clamp(9px, 1vw, 11px) clamp(16px, 2vw, 24px)' }}>
              {isEnglish ? 'Contact us' : 'Nous contacter'}
            </Link>
            <Link to="/catalogue" className="btn btn-ghost" style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', padding: 'clamp(9px, 1vw, 11px) clamp(16px, 2vw, 24px)' }}>
              <Search size={16} /> {isEnglish ? 'Explore the catalog' : 'Explorer le catalogue'}
            </Link>
          </div>
          {content && (
            <Reveal className="reveal-up" delay={150}>
              <div style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
                {content}
              </div>
            </Reveal>
          )}
        </div>
      </Layout>
    </>
  );
}

// ============================================================
// E-RESSOURCES PAGE
// ============================================================

const E_RESSOURCES_DISCIPLINES = [
  { slug: '1', labelFr: 'Chimie et bois', labelEn: 'Chemistry and Wood', shortLabelFr: 'Chimie & Bois', shortLabelEn: 'Chem. & Wood', color: '#059669', icon: '🧪' },
  { slug: '2', labelFr: "Sciences de l'éducation", labelEn: 'Educational Sciences', shortLabelFr: 'Sciences éduc.', shortLabelEn: 'Educ. Sciences', color: '#7C3AED', icon: '🎓' },
  { slug: '3', labelFr: 'Sports et Jeunesse', labelEn: 'Sports and Youth', shortLabelFr: 'Sports & Jeunesse', shortLabelEn: 'Sports & Youth', color: '#dc2626', icon: '⚽' },
  { slug: '4', labelFr: 'Sciences Humaines', labelEn: 'Human Sciences', shortLabelFr: 'Sciences humaines', shortLabelEn: 'Human Sciences', color: '#1B1464', icon: '📚' },
  { slug: '5', labelFr: 'Sciences polytechniques', labelEn: 'Polytechnic Sciences', shortLabelFr: 'Sciences polytech.', shortLabelEn: 'Polytech. Sci.', color: '#f59e0b', icon: '⚙️' },
  { slug: '6', labelFr: 'Biologie', labelEn: 'Biology', shortLabelFr: 'Biologie', shortLabelEn: 'Biology', color: '#10B981', icon: '🧬' },
  { slug: '7', labelFr: 'Arts et lettres', labelEn: 'Arts and Letters', shortLabelFr: 'Arts & Lettres', shortLabelEn: 'Arts & Letters', color: '#8b5cf6', icon: '🎨' },
  { slug: '8', labelFr: 'Environnement et Agriculture', labelEn: 'Environment and Agriculture', shortLabelFr: 'Environnement', shortLabelEn: 'Environment', color: '#0891b2', icon: '🌿' },
];

const E_RESSOURCES_CONTENT = {
  '1': {
    titleFr: 'Ressources électroniques en Chimie et Bois',
    titleEn: 'Electronic Resources in Chemistry and Wood',
    subtitleFr: 'Chimie, Bois et Métiers associés', subtitleEn: 'Chemistry, Wood and Related Trades',
    introFr: 'Quelques ressources électroniques disponibles via le portail de la Bibliothèque Centrale.',
    introEn: 'Some electronic resources available through the Central Library portal.',
    groups: [
      {
        disciplineFr: 'Chimie', disciplineEn: 'Chemistry', color: '#059669',
        items: [
          { url: 'http://link.springer.com/journal/volumesAndIssues/40679', label: 'Advanced Structural and Chemical Imaging' },
          { url: 'http://www.hindawi.com/journals/ac/contents/', label: 'Advances in Chemistry' },
          { url: 'http://www.chem-soc.si/acta-chimica-slovenica', label: 'Acta Chimica Slovenica' },
          { url: 'http://www.sciencedirect.com/science/journal/22141812', label: 'Analytical Chemistry Research' },
          { url: 'http://link.springer.com/journal/volumesAndIssues/13203', label: 'Applied Petrochemical Research' },
          { url: 'http://www.hindawi.com/journals/bca/contents/', label: 'Bioinorganic Chemistry and Applications' },
          { url: 'http://link.springer.com/journal/volumesAndIssues/40538', label: 'Chemical and Biological Technologies in Agriculture' },
          { url: 'https://www.jstage.jst.go.jp/browse/cbij', label: 'Chem-Bio Informatic Journal' },
          { url: 'http://astonjournals.com/cs', label: 'Chemical Sciences Journal' },
          { url: 'http://www.hindawi.com/journals/apc/contents/', label: 'Advances in Physical Chemistry' },
        ],
      },
      {
        disciplineFr: 'Bois et métiers', disciplineEn: 'Wood and Trades', color: '#a16207',
        items: [
          { url: 'http://link.springer.com/journal/volumesAndIssues/40663', label: 'Forest Ecosystems' },
          { url: 'http://www.scirp.org/journal/ojf/', label: 'Open Journal of Forestry' },
          { url: 'http://www.lesmetiers.net/orientation/p1_193836/menuisier', label: 'Menuisier / menuisière : Métier - Salaire - Débouchés' },
          { url: 'http://www.metiersdart-artisanat.com/files/sema/boutiques/EXE_parqueteur_A4.pdf', label: "Métiers d'art (infos parqueteur)" },
          { url: 'http://www.cmpbois.com/articles/20090105arbocentre.html', label: 'Tous les métiers du bois en image' },
          { url: 'http://www.l-atelier-bois.com/archives/4708', label: 'Métiers et passions' },
          { url: 'http://www.cadre-dirigeant-magazine.com/dossiers/nomencalture-metiers-cadres/metiersdelindustrieduboisducartonetdupapier/', label: "Métiers de l'industrie du bois, du carton et du papier" },
          { url: 'http://www.preventica.com/actu-enbref-prevenir-risques-professionnels-metiers-bois-1310314.php', label: 'Prévenir les risques professionnels dans les métiers du bois' },
          { url: 'http://www.interencheres.com/fr/materiels-professionnels/menuiserie-scierie-metiers-du-bois-ie_s247.html', label: 'Menuiserie - Scierie - Métiers du bois' },
          { url: 'http://www.site-en-bois.net/fr/guide.phtml', label: 'Le guide du site en bois' },
        ],
      },
    ],
  },
  '2': {
    titleFr: "Ressources électroniques en Sciences de l'éducation",
    titleEn: 'Electronic Resources in Educational Sciences',
    subtitleFr: "Sciences de l'éducation", subtitleEn: 'Educational Sciences',
    introFr: "Périodiques et ressources en sciences de l'éducation accessibles à la BC-UYI.",
    introEn: 'Journals and resources in educational sciences available at the BC-UYI.',
    groups: [],
    emptyMessageFr: "Les ressources en sciences de l'éducation sont en cours de mise à jour. Revenez bientôt pour consulter les nouvelles revues disponibles.",
    emptyMessageEn: 'Resources in educational sciences are being updated. Check back soon to consult new available journals.',
  },
  '3': {
    titleFr: 'Ressources électroniques - Sports et Jeunesse',
    titleEn: 'Electronic Resources - Sports and Youth',
    subtitleFr: 'Sports, Jeunesse, Droit, Économie et Gestion',
    subtitleEn: 'Sports, Youth, Law, Economics and Management',
    introFr: "Revues et publications dans le domaine des sports, de la jeunesse, du droit et de l'économie.",
    introEn: 'Journals and publications in the field of sports, youth, law, and economics.',
    groups: [
      {
        disciplineFr: 'Revues de Sport et Jeunesse', disciplineEn: 'Sports and Youth Journals', color: '#dc2626',
        items: [
          { url: 'http://planetesport.dz/', label: 'Les revues et journaux de Sport' },
          { url: 'http://www.lapressedz.com', label: 'Le Buteur' },
          { url: 'https://www.openedition.org', label: 'Corps et culture' },
        ],
      },
      {
        disciplineFr: 'Publications en Droit, Économie et Gestion', disciplineEn: 'Publications in Law, Economics and Management', color: '#1B1464',
        items: [
          { url: 'http://revdh.revues.org', label: "Imprécision des droits de l'Homme" },
          { url: 'http://droitcultures.revues.org', label: 'Mariage pour tous et filiation pour certains' },
          { url: 'http://cdst.revues.org/348', label: 'Valorisation de la recherche publique, innovation, propriété intellectuelle' },
          { url: 'http://cdst.revues.org', label: 'Le droit du dispositif médical. Entre gouvernement des corps et normes de gouvernance' },
          { url: 'http://www.right2water.eu/fr', label: 'Responsabilité' },
          { url: 'http://economiepublique.revues.org', label: 'Améliorer la santé dans les pays en développement' },
          { url: 'http://cdst.revues.org', label: 'Raison statistique et catégories du droit de la santé' },
          { url: 'http://revdh.revues.org', label: "Les juges ordinaires et les lois reconnaissant les droits de l'homme" },
          { url: 'http://cdst.revues.org', label: "L'imputation de la responsabilité civile en contexte d'incertitude scientifique et technologique" },
          { url: 'http://droitcultures.revues.org', label: 'Ce que le droit fait au genre : les femmes migrantes dans la législation européenne' },
          { url: 'http://revdh.revues.org', label: "L'égalité entre (toutes) les femmes et les hommes" },
          { url: 'http://cdst.revues.org', label: "Pour une réhabilitation des seuils en droit de la santé et de l'environnement" },
        ],
      },
    ],
  },
  '4': {
    titleFr: 'Ressources électroniques en Sciences Humaines',
    titleEn: 'Electronic Resources in Human Sciences',
    subtitleFr: 'Sciences Humaines', subtitleEn: 'Human Sciences',
    introFr: 'Ressources électroniques en sciences humaines et sociales.',
    introEn: 'Electronic resources in humanities and social sciences.',
    groups: [],
    emptyMessageFr: 'Les ressources en sciences humaines sont en cours de mise à jour.',
    emptyMessageEn: 'Resources in human sciences are being updated.',
  },
  '5': {
    titleFr: 'Ressources électroniques - Sciences Polytechniques',
    titleEn: 'Electronic Resources - Polytechnic Sciences',
    subtitleFr: 'Sciences polytechniques', subtitleEn: 'Polytechnic Sciences',
    introFr: 'Ressources électroniques dans le domaine des sciences polytechniques.',
    introEn: 'Electronic resources in the field of polytechnic sciences.',
    groups: [],
    emptyMessageFr: 'Les ressources en sciences polytechniques sont en cours de mise à jour.',
    emptyMessageEn: 'Resources in polytechnic sciences are being updated.',
  },
  '6': {
    titleFr: 'Ressources électroniques - Biologie',
    titleEn: 'Electronic Resources - Biology',
    subtitleFr: 'Biologie', subtitleEn: 'Biology',
    introFr: 'Ressources électroniques en biologie et sciences de la vie.',
    introEn: 'Electronic resources in biology and life sciences.',
    groups: [],
    emptyMessageFr: 'Les ressources en biologie sont en cours de mise à jour.',
    emptyMessageEn: 'Biology resources are being updated.',
  },
  '7': {
    titleFr: 'Ressources électroniques - Arts et Lettres',
    titleEn: 'Electronic Resources - Arts and Letters',
    subtitleFr: 'Arts et Lettres', subtitleEn: 'Arts and Letters',
    introFr: 'Ressources électroniques en arts et lettres.',
    introEn: 'Electronic resources in arts and letters.',
    groups: [],
    emptyMessageFr: 'Les ressources en arts et lettres sont en cours de mise à jour.',
    emptyMessageEn: 'Resources in arts and letters are being updated.',
  },
  '8': {
    titleFr: 'Ressources électroniques - Environnement et Agriculture',
    titleEn: 'Electronic Resources - Environment and Agriculture',
    subtitleFr: 'Environnement et Agriculture', subtitleEn: 'Environment and Agriculture',
    introFr: 'Ressources électroniques en environnement et agriculture.',
    introEn: 'Electronic resources in environment and agriculture.',
    groups: [],
    emptyMessageFr: "Les ressources en environnement et agriculture sont en cours de mise à jour.",
    emptyMessageEn: 'Environment and agriculture resources are being updated.',
  },
};

export function ERessourcesPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Electronic Resources - Central Library UYI' : 'Ressources électroniques - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'Discover all electronic resources accessible at the Central Library of the University of Yaoundé I, classified by discipline.' : "Découvrez l'ensemble des ressources électroniques accessibles à la Bibliothèque Centrale de l'Université de Yaoundé I, classées par discipline."} />
      </Helmet>
      <style>{responsiveStyles}</style>

      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[
            { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
            { label: isEnglish ? 'Resources' : 'Ressources', href: '/ressources/electroniques' },
            { label: isEnglish ? 'E-Resources' : 'E-Ressources' },
          ]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Electronic ' : 'Ressources '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Resources' : 'électroniques'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)', maxWidth: 760 }}>
            {isEnglish ? 'Discover all electronic resources accessible at the BC-UYI, classified by discipline.' : "Découvrez l'ensemble des ressources électroniques accessibles à la BC-UYI, classées par discipline."}
          </p>
        </div>
      </div>

      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', border: '1px solid var(--border)', borderLeft: '6px solid var(--or)', borderRadius: 'var(--radius-sm)', padding: 'clamp(18px, 2.5vw, 24px)', marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', flexShrink: 0 }}>
              <BookOpen size={22} />
            </div>
            <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
              {isEnglish ? 'The Central Library provides access to a selection of electronic resources covering all scientific disciplines. Choose a subject area below to see the available journals and platforms.' : "La Bibliothèque Centrale vous donne accès à une sélection de ressources électroniques couvrant toutes les disciplines scientifiques. Choisissez un domaine ci-dessous pour consulter les revues et plateformes disponibles."}
            </p>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={80}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', color: 'var(--bleu-nuit)', fontWeight: 400, marginBottom: 20 }}>
            📂 {isEnglish ? 'Browse by discipline' : 'Parcourir par discipline'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(14px, 1.8vw, 20px)', marginBottom: 40 }}>
            {E_RESSOURCES_DISCIPLINES.map((d, i) => (
              <Reveal key={d.slug} className="reveal-up" delay={i * 40}>
                <Link to={`/E_ressources${d.slug}`} className="card" style={{ padding: 'clamp(18px, 2.5vw, 24px)', borderTop: `4px solid ${d.color}`, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = d.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div style={{ fontSize: 32 }}>{d.icon}</div>
                  <h3 style={{ fontSize: 'clamp(15px, 1.1vw, 17px)', fontWeight: 700, color: 'var(--bleu-nuit)', margin: 0 }}>
                    {isEnglish ? d.labelEn : d.labelFr}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(12px, 0.85vw, 13px)', fontWeight: 600, color: d.color, marginTop: 'auto' }}>
                    {isEnglish ? 'View resources' : 'Voir les ressources'} <ChevronRight size={14} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={300}>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/ressources/electroniques" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <ChevronLeft size={16} /> {isEnglish ? 'Back to resources' : 'Retour aux ressources'}
            </Link>
            <Link to="/periodiques" className="btn btn-ghost" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <BookOpen size={16} /> {isEnglish ? 'See electronic journals' : 'Voir les périodiques'}
            </Link>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

export function ERessourcesDisciplinePage({ slug = '1' }) {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const content = E_RESSOURCES_CONTENT[slug] || E_RESSOURCES_CONTENT['1'];
  const discipline = E_RESSOURCES_DISCIPLINES.find(d => d.slug === slug);

  return (
    <Layout>
      <Helmet>
        <title>{(isEnglish ? content.titleEn : content.titleFr)} - BCU UYI</title>
        <meta name="description" content={isEnglish ? content.introEn : content.introFr} />
      </Helmet>
      <style>{responsiveStyles}</style>

      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[
            { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
            { label: isEnglish ? 'E-Resources' : 'E-Ressources', href: '/ressources/electroniques' },
            { label: discipline ? (isEnglish ? discipline.shortLabelEn : discipline.shortLabelFr) : 'Discipline' },
          ]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{discipline?.icon || '📚'}</span>
            <div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(26px, 3.8vw, 38px)', color: 'white', fontWeight: 400, marginBottom: 6 }}>
                {isEnglish ? content.titleEn : content.titleFr}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px, 1vw, 15px)', maxWidth: 720 }}>
                {isEnglish ? content.introEn : content.introFr}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        {content.groups && content.groups.length > 0 ? (
          <div style={{ display: 'grid', gap: 24 }}>
            {content.groups.map((group, gi) => (
              <Reveal key={gi} className="reveal-up" delay={gi * 80}>
                <div className="card" style={{ padding: 'clamp(20px, 2.5vw, 28px)', borderTop: `4px solid ${group.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${group.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      📚
                    </div>
                    <h2 style={{ fontSize: 'clamp(16px, 1.3vw, 19px)', fontWeight: 700, color: 'var(--bleu-nuit)', margin: 0 }}>
                      {isEnglish ? group.disciplineEn : group.disciplineFr}
                    </h2>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0 }}>
                    {group.items.map((item, ii) => (
                      <li key={ii}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--beige)', border: '1px solid var(--border-light)', borderRadius: 10, textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${group.color}10`; e.currentTarget.style.borderColor = group.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = ''; }}>
                          <ExternalLink size={15} color={group.color} style={{ flexShrink: 0, marginTop: 3 }} />
                          <span style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', fontWeight: 500, color: 'var(--texte)', lineHeight: 1.5 }}>
                            {item.label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="reveal-up">
            <div className="card" style={{ padding: 'clamp(28px, 4vw, 48px)', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(18px, 2vw, 22px)', color: 'var(--bleu-nuit)', fontWeight: 400, marginBottom: 12 }}>
                {isEnglish ? 'Resources coming soon' : 'Ressources en cours de mise à jour'}
              </h2>
              <p style={{ color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.7 }}>
                {isEnglish ? (content.emptyMessageEn || 'Resources for this discipline will be published soon.') : (content.emptyMessageFr || "Les ressources pour cette discipline seront publiées prochainement.")}
              </p>
              <Link to="/ressources/electroniques" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
                <ChevronLeft size={16} /> {isEnglish ? 'Back to E-Resources' : 'Retour aux E-Ressources'}
              </Link>
            </div>
          </Reveal>
        )}

        <Reveal className="reveal-up" delay={200}>
          <div style={{ marginTop: 40, padding: 'clamp(18px, 2.5vw, 24px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 14 }}>
              {isEnglish ? 'Other disciplines' : 'Autres disciplines'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {E_RESSOURCES_DISCIPLINES.filter(d => d.slug !== slug).map(d => (
                <Link key={d.slug} to={`/E_ressources${d.slug}`} className="btn btn-ghost btn-sm" style={{ fontSize: 'clamp(11.5px, 0.85vw, 13px)', padding: '7px 14px', borderColor: 'var(--border)' }}>
                  <span style={{ fontSize: 14 }}>{d.icon}</span>
                  {isEnglish ? d.shortLabelEn : d.shortLabelFr}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={260}>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/ressources/electroniques" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <ChevronLeft size={16} /> {isEnglish ? 'Back to E-Resources' : 'Retour aux E-Ressources'}
            </Link>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// RESSOURCES PAGE
// ============================================================

export function RessourcesPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  const DATABASES = [
    { nameFr: 'Research4Life', nameEn: 'Research4Life', logo: '🌐', descFr: "Accès aux plus grandes revues scientifiques mondiales pour les pays en développement.", descEn: "Access to the world's largest scientific journals for developing countries.", href: 'https://www.research4life.org', categoriesFr: ['Médecine', 'Agriculture', 'Droit', 'Business'], categoriesEn: ['Medicine', 'Agriculture', 'Law', 'Business'], color: '#059669' },
    { nameFr: 'OpenDOAR', nameEn: 'OpenDOAR', logo: '📂', descFr: 'Répertoire mondial des archives institutionnelles en accès ouvert.', descEn: 'Global directory of open access institutional repositories.', href: 'https://v2.sherpa.ac.uk/opendoar/', categoriesFr: ['Open Access'], categoriesEn: ['Open Access'], color: '#6366f1' },
    { nameFr: 'DOAJ', nameEn: 'DOAJ', logo: '📰', descFr: 'Répertoire de revues en accès libre avec contrôle qualité éditorial.', descEn: 'Directory of open access journals with editorial quality control.', href: 'https://doaj.org', categoriesFr: ['Pluridisciplinaire'], categoriesEn: ['Multidisciplinary'], color: '#1B1464' },
    { nameFr: 'OpenEdition', nameEn: 'OpenEdition', logo: '📚', descFr: 'Portail de ressources numériques en sciences humaines et sociales.', descEn: 'Digital resources portal in humanities and social sciences.', href: 'https://www.openedition.org', categoriesFr: ['SHS', 'Lettres'], categoriesEn: ['HSS', 'Letters'], color: '#8b5cf6' },
    { nameFr: 'Gallica (BNF)', nameEn: 'Gallica (BNF)', logo: '🗺️', descFr: 'Bibliothèque numérique de la Bibliothèque nationale de France.', descEn: 'Digital library of the National Library of France.', href: 'https://gallica.bnf.fr', categoriesFr: ['Patrimoine', 'Archives'], categoriesEn: ['Heritage', 'Archives'], color: '#7C3AED' },
    { nameFr: 'HAL Open Archives', nameEn: 'HAL Open Archives', logo: '📖', descFr: "Archive ouverte pluridisciplinaire pour le dépôt et la diffusion d'articles scientifiques.", descEn: 'Multidisciplinary open archive for depositing and disseminating scientific articles.', href: 'https://hal.archives-ouvertes.fr', categoriesFr: ['Recherche', 'Open Access'], categoriesEn: ['Research', 'Open Access'], color: '#10B981' },
    { nameFr: 'E-Ressources', nameEn: 'E-Resources', logo: '📡', descFr: 'Ressources électroniques classées par discipline (8 domaines : chimie, biologie, arts, environnement...).', descEn: 'Electronic resources classified by discipline (8 areas: chemistry, biology, arts, environment...).', href: '/ressources/electroniques', categoriesFr: ['Pluridisciplinaire', 'Revues'], categoriesEn: ['Multidisciplinary', 'Journals'], color: '#0d9488', internal: true },
    { nameFr: 'Périodiques électroniques', nameEn: 'Electronic Journals', logo: '📔', descFr: 'Liste complète des périodiques électroniques accessibles à la BC-UYI, classés par discipline.', descEn: 'Complete list of electronic journals accessible at the BC-UYI, classified by discipline.', href: '/periodiques', categoriesFr: ['Revues', 'Journaux'], categoriesEn: ['Journals', 'Newspapers'], color: '#f59e0b', internal: true },
    { nameFr: 'Archives ouvertes (Open Access)', nameEn: 'Open Access Archives', logo: '🌍', descFr: "Répertoire des plateformes en accès libre : HAL, arXiv, OAPEN, Isidore, TEL, Google Books et plus.", descEn: 'Directory of open access platforms: HAL, arXiv, OAPEN, Isidore, TEL, Google Books and more.', href: '/open-access', categoriesFr: ['Archives', 'Revues', 'Thèses'], categoriesEn: ['Archives', 'Journals', 'Theses'], color: '#0891b2', internal: true },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Electronic Resources - Central Library UYI' : 'Ressources électroniques - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'Access databases and online resources available to the University of Yaoundé I community.' : "Accédez aux bases de données et ressources en ligne disponibles pour la communauté de l'Université de Yaoundé I."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Electronic Resources' : 'Ressources électroniques' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Electronic ' : 'Ressources '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Resources' : 'électroniques'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Access databases and online resources available to the UYI community' : 'Accès aux bases de données et ressources en ligne disponibles pour la communauté UYI'}
          </p>
        </div>
      </div>
      <div className="container" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(16px, 2vw, 24px)' }}>
          {DATABASES.map((db, index) => {
            const CardWrapper = db.internal ? Link : 'a';
            const wrapperProps = db.internal
              ? { to: db.href }
              : { href: db.href, target: '_blank', rel: 'noopener noreferrer' };

            return (
              <Reveal key={db.nameFr} className="reveal-up" delay={index * 50}>
                <CardWrapper
                  {...wrapperProps}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    padding: 'clamp(16px, 2vw, 28px)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none', color: 'inherit',
                    borderTop: `4px solid ${db.color || 'var(--or)'}`,
                    background: 'white', borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 'clamp(36px, 4vw, 48px)', marginBottom: 12 }}>{db.logo}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'clamp(15px, 1.1vw, 17px)', color: 'var(--bleu-nuit)' }}>{isEnglish ? db.nameEn : db.nameFr}</h3>
                    <ExternalLink size={14} color="var(--texte-muted)" />
                  </div>
                  <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', lineHeight: 1.7, flex: 1, marginBottom: 14 }}>{isEnglish ? db.descEn : db.descFr}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(isEnglish ? db.categoriesEn : db.categoriesFr).map(c => (<span key={c} style={{ fontSize: 'clamp(9px, 0.7vw, 10px)', padding: '2px 10px', borderRadius: 50, background: `${db.color}12`, color: db.color, fontWeight: 600 }}>{c}</span>))}
                  </div>
                </CardWrapper>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="reveal-up" delay={300}>
          <div style={{ marginTop: 'clamp(40px, 5vw, 60px)', padding: 'clamp(24px, 3vw, 32px)', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Globe size={24} color="var(--or)" /> {isEnglish ? 'Access to resources' : 'Accès aux ressources'}
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
              {isEnglish
                ? 'To access these resources, you must be connected to the University network or use your SIGB credentials. Databases are accessible from the PMB catalog or directly via the links provided.'
                : "Pour accéder à ces ressources, vous devez être connecté au réseau de l'Université ou utiliser vos identifiants SIGB. Les bases de données sont accessibles depuis le catalogue PMB ou directement via les liens fournis."}
            </p>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// PERIODIQUES PAGE
// ============================================================

const PERIODIQUES_DATA = [
  {
    disciplineFr: 'Périodiques de santé et de Médecine',
    disciplineEn: 'Health and Medicine Journals',
    icon: '🩺',
    color: '#059669',
    items: [
      { url: 'http://www.who.int/bulletin', label: 'Bulletin OMS' },
      { url: 'http://www.pathexo.fr/1301-presentation-bulletin.html', label: 'Bulletin de la SPE' },
      { url: 'http://www.hsd-fmsb.org', label: 'Health Sciences and Disease' },
      { url: 'http://www.nejm.org', label: 'The New England Journal of Medicine' },
      { url: 'http://www.panafrican-med-journal.com', label: 'The Pan African Medical Journal' },
    ],
  },
  {
    disciplineFr: "Sciences de l'information, communication et documentation",
    disciplineEn: 'Information Science, Communication and Documentation',
    icon: '📡',
    color: '#1B1464',
    items: [
      { url: 'http://www.archimag.com/', label: "Magazine des professionnels de l'information" },
      { url: 'http://www.asis.org/bulletin.html', label: 'The Bulletin of the Association for Information Science and Technology' },
      { url: 'http://www.adbs.fr/documentaliste-sciences-de%20-l-information-136069.htm', label: "Documentaliste - Sciences de l'information" },
      { url: 'http://communication.revues.org', label: 'Communication' },
      { url: 'http://www.enssib.fr/bibliotheque-numerique/documents/', label: "Revue de l'ENSSIB" },
      { url: 'http://ressi.ch/', label: "RESSI : Revue électronique Suisse des sciences de l'information" },
      { url: 'http://edc.revues.org', label: 'Études de communication : langages, information' },
      { url: 'http://communicationorganisation.revues.org', label: 'La revue Communication et Organisation' },
      { url: 'http://www.livreshebdo.fr', label: 'Livres Hebdo : magazine des professionnels du livre' },
      { url: 'http://www.cairn.info/revue-document-numerique.htm', label: 'Revue Document numérique' },
      { url: 'https://documentation.erudit.org/', label: 'Documentation et bibliothèques' },
    ],
  },
  {
    disciplineFr: 'Mathématiques',
    disciplineEn: 'Mathematics',
    icon: '📐',
    color: '#7C3AED',
    items: [
      { url: 'https://fr.wikipedia.org/wiki/Liste_des_journaux_scientifiques_en_math%C3%A9matiques', label: 'Liste des journaux scientifiques en mathématiques — Wikipédia' },
      { url: 'https://fr.wikipedia.org/wiki/Cat%C3%A9gorie:Revue_de_math%C3%A9matiques', label: 'Catégorie : Revue de mathématiques — Wikipédia' },
      { url: 'http://www.journals.elsevier.com/journal-de-mathematiques-pures-et-appliquees/', label: 'Journal de Mathématiques Pures et Appliquées — Elsevier' },
    ],
  },
];

export function PeriodiquesPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Electronic Journals - Central Library UYI' : 'Périodiques électroniques - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'List of electronic journals accessible at the Central Library of the University of Yaoundé I, classified by discipline.' : 'Liste des périodiques électroniques accessibles à la Bibliothèque Centrale de l\'Université de Yaoundé I, classés par discipline.'} />
      </Helmet>
      <style>{responsiveStyles}</style>

      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[
            { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
            { label: isEnglish ? 'Resources' : 'Ressources', href: '/ressources/electroniques' },
            { label: isEnglish ? 'Electronic Journals' : 'Périodiques' },
          ]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Electronic ' : 'Périodiques '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Journals' : 'électroniques'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)', maxWidth: 720 }}>
            {isEnglish ? 'All electronic journals accessible at the BC-UYI, classified by discipline.' : "L'ensemble des périodiques électroniques accessibles à la BC-UYI, classés par discipline."}
          </p>
        </div>
      </div>

      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', border: '1px solid var(--border)', borderLeft: '6px solid var(--or)', borderRadius: 'var(--radius-sm)', padding: 'clamp(18px, 2.5vw, 24px)', marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', flexShrink: 0 }}>
              <BookOpen size={22} />
            </div>
            <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
              {isEnglish ? 'The Central Library of the University of Yaoundé I provides access to a selection of freely accessible electronic journals. These resources are classified below by discipline.' : "La Bibliothèque Centrale de l'Université de Yaoundé I vous donne accès à une sélection de périodiques électroniques en libre accès. Ces ressources sont classées ci-dessous par discipline."}
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(18px, 2vw, 24px)' }}>
          {PERIODIQUES_DATA.map((group, idx) => (
            <Reveal key={group.disciplineFr} className="reveal-up" delay={idx * 80}>
              <div className="card" style={{ padding: 'clamp(20px, 2.5vw, 28px)', borderTop: `4px solid ${group.color}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${group.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {group.icon}
                  </div>
                  <h2 style={{ fontSize: 'clamp(15px, 1.15vw, 17px)', fontWeight: 700, color: 'var(--bleu-nuit)', lineHeight: 1.35, margin: 0 }}>
                    {isEnglish ? group.disciplineEn : group.disciplineFr}
                  </h2>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, flex: 1 }}>
                  {group.items.map((item) => (
                    <li key={item.url}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--beige)', border: '1px solid var(--border-light)', borderRadius: 10, textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${group.color}10`; e.currentTarget.style.borderColor = group.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = ''; }}>
                        <ExternalLink size={15} color={group.color} style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', fontWeight: 500, color: 'var(--texte)', lineHeight: 1.5 }}>
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="reveal-up" delay={200}>
          <div style={{ marginTop: 'clamp(32px, 5vw, 48px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={22} color="var(--or)" />
              {isEnglish ? 'Other disciplines' : 'Autres disciplines'}
            </h3>
            <p style={{ fontSize: 'clamp(13px, 0.9vw, 14px)', color: 'var(--texte-muted)', marginBottom: 20, lineHeight: 1.7 }}>
              {isEnglish ? 'Browse electronic journals by other subject areas:' : "Parcourez les périodiques électroniques par d'autres domaines :"}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {E_RESSOURCES_DISCIPLINES.map((d) => (
                <Link key={d.slug} to={`/E_ressources${d.slug}`} className="btn btn-ghost btn-sm" style={{ fontSize: 'clamp(12px, 0.85vw, 13px)', padding: '8px 16px' }}>
                  <span style={{ fontSize: 14 }}>{d.icon}</span>
                  {isEnglish ? d.shortLabelEn : d.shortLabelFr}
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={260}>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/ressources/electroniques" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <ChevronLeft size={16} /> {isEnglish ? 'Back to resources' : 'Retour aux ressources'}
            </Link>
            <Link to="/catalogue" className="btn btn-ghost" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <Search size={16} /> {isEnglish ? 'Search the catalog' : 'Rechercher dans le catalogue'}
            </Link>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// OPEN ACCESS PAGE
// ============================================================

const OPEN_ACCESS_DATA = [
  {
    nameFr: 'Portail Open Access (BU Avignon)', nameEn: 'Open Access Portal (BU Avignon)',
    descriptionFr: "Répertoire de ressources en accès libre (archives et revues). Un portail complet qui recense les principales plateformes d'archives ouvertes et de revues en ligne.",
    descriptionEn: "Directory of open access resources (archives and journals). A comprehensive portal that lists the main open archive platforms and online journals.",
    url: 'http://bu.univ-avignon.fr/collections/bibliotheque-electronique/open-access/',
    icon: '🌐', color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    categoryFr: 'Portail', categoryEn: 'Portal', tagsFr: ['Archives', 'Revues', 'Accès libre'], tagsEn: ['Archives', 'Journals', 'Open Access'],
  },
  {
    nameFr: 'Projet Gutenberg', nameEn: 'Gutenberg Project',
    descriptionFr: "Précurseur de la lecture électronique, le projet a été initié en 1971 par Michael Hart à l'université de l'Illinois. Il estima alors que la plus grande valeur créée par les ordinateurs n'était pas le calcul, mais le stockage, la mise à disposition et la recherche de ce qui était entreposé dans les bibliothèques. En guise de preuve de concept, il saisit une copie de la Déclaration d'indépendance des États-Unis et l'envoya à tous les utilisateurs du réseau informatique de l'université. Ce document fut le premier document électronique du projet Gutenberg. Le projet a été hébergé par plusieurs universités jusqu'en 2000, où il a été officiellement organisé sous la forme d'une entité juridique à but non lucratif en droit américain.",
    descriptionEn: "A precursor to electronic reading, the project was initiated in 1971 by Michael Hart at the University of Illinois. He believed that the greatest value created by computers was not calculation, but the storage, availability and searchability of what was stored in libraries. As a proof of concept, he typed a copy of the United States Declaration of Independence and sent it to all users of the university's computer network. This document was the first electronic document of the Gutenberg Project. The project was hosted by several universities until 2000, when it was officially organized as a non-profit legal entity under American law.",
    url: 'http://www.gutenberg.org/wiki/FR_Principal',
    icon: '📚', color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    categoryFr: 'Livres', categoryEn: 'Books', tagsFr: ['Livres numériques', 'Domaine public', 'Depuis 1971'], tagsEn: ['Digital books', 'Public domain', 'Since 1971'],
  },
  {
    nameFr: 'Archive ouverte HAL', nameEn: 'HAL Open Archive',
    descriptionFr: "L'archive ouverte pluridisciplinaire HAL est destinée au dépôt et à la diffusion d'articles scientifiques de niveau recherche, publiés ou non, et de thèses, émanant des établissements d'enseignement et de recherche français ou étrangers, des laboratoires publics ou privés.",
    descriptionEn: "The multidisciplinary open archive HAL is intended for the deposit and dissemination of scientific research articles, published or not, and theses, from French or foreign higher education and research institutions, public or private laboratories.",
    url: 'https://hal.archives-ouvertes.fr/',
    icon: '🏛️', color: '#1B1464',
    gradient: 'linear-gradient(135deg, #1B1464, #2D2178)',
    categoryFr: 'Archive', categoryEn: 'Archive', tagsFr: ['Articles', 'Thèses', 'Pluridisciplinaire'], tagsEn: ['Articles', 'Theses', 'Multidisciplinary'],
  },
  {
    nameFr: 'Archive EduTice', nameEn: 'EduTice Archive',
    descriptionFr: "L'archive ouverte Archive EduTice (2003) se présente comme une bibliothèque numérique recevant et diffusant les productions intellectuelles de la recherche internationale dans le domaine des usages des technologies de l'information et de la communication (TIC) dans l'éducation et la formation.",
    descriptionEn: "The EduTice Open Archive (2003) presents itself as a digital library receiving and disseminating the intellectual productions of international research in the field of uses of information and communication technologies (ICT) in education and training.",
    url: 'https://edutice.archives-ouvertes.fr/browse/doctype',
    icon: '🎓', color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #8b5cf6)',
    categoryFr: 'Archive', categoryEn: 'Archive', tagsFr: ['Éducation', 'TICE', 'Recherche'], tagsEn: ['Education', 'ICT', 'Research'],
  },
  {
    nameFr: 'arXiv.org', nameEn: 'arXiv.org',
    descriptionFr: "Archive ouverte de prépublication d'articles scientifiques dans les domaines des mathématiques, physique, informatique, sciences non linéaires et biologie. Accès en texte intégral à plus de 475 000 articles.",
    descriptionEn: "Open preprint archive of scientific articles in the fields of mathematics, physics, computer science, nonlinear sciences and biology. Full-text access to more than 475,000 articles.",
    url: 'http://fr.arxiv.org/',
    icon: '🔬', color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    categoryFr: 'Prépublication', categoryEn: 'Preprint', tagsFr: ['Maths', 'Physique', 'Informatique'], tagsEn: ['Maths', 'Physics', 'Computer Science'],
  },
  {
    nameFr: 'OAPEN', nameEn: 'OAPEN',
    descriptionFr: "OAPEN (Open Access Publishing in European Networks) est une plateforme donnant accès gratuitement au texte complet de près de 800 ouvrages essentiellement parus au cours des dix dernières années et avant tout écrits en anglais, en allemand, en italien ou en néerlandais. La majorité des ouvrages proposés relèvent des disciplines rattachées aux sciences humaines et sociales.",
    descriptionEn: "OAPEN (Open Access Publishing in European Networks) is a platform providing free access to the full text of nearly 800 works, mainly published over the last ten years and primarily written in English, German, Italian or Dutch. The majority of the works offered fall within disciplines related to humanities and social sciences.",
    url: 'http://www.oapen.org/',
    icon: '📖', color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    categoryFr: 'Livres', categoryEn: 'Books', tagsFr: ['SHS', 'Europe', '800+ ouvrages'], tagsEn: ['HSS', 'Europe', '800+ works'],
  },
  {
    nameFr: 'Isidore', nameEn: 'Isidore',
    descriptionFr: "ISIDORE est une plateforme de recherche permettant l'accès aux données numériques des sciences humaines et sociales (SHS). Ouverte à tous et en particulier aux enseignants, chercheurs, doctorants et étudiants, elle s'appuie sur les principes du web de données et donne accès à des données en accès libre (open access).",
    descriptionEn: "ISIDORE is a research platform providing access to digital data in humanities and social sciences (HSS). Open to all and particularly to teachers, researchers, doctoral students and students, it is based on the principles of the web of data and provides access to open access data.",
    url: 'http://www.rechercheisidore.fr/index',
    icon: '🔍', color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    categoryFr: 'Moteur', categoryEn: 'Search Engine', tagsFr: ['SHS', 'Web de données', 'Open Access'], tagsEn: ['HSS', 'Web of Data', 'Open Access'],
  },
  {
    nameFr: 'TEL — Thèses en ligne', nameEn: 'TEL — Online Theses',
    descriptionFr: "Le serveur TEL (thèses-en-ligne) a pour objectif de promouvoir l'auto-archivage en ligne des thèses de doctorat et habilitations à diriger des recherches (HDR).",
    descriptionEn: "The TEL server (thèses-en-ligne / online theses) aims to promote online self-archiving of doctoral theses and habilitations to supervise research (HDR).",
    url: 'https://tel.archives-ouvertes.fr/browse/domain',
    icon: '🎯', color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    categoryFr: 'Thèses', categoryEn: 'Theses', tagsFr: ['Doctorat', 'HDR', 'Auto-archivage'], tagsEn: ['Doctorate', 'HDR', 'Self-archiving'],
  },
  {
    nameFr: 'Sciencesconf.org', nameEn: 'Sciencesconf.org',
    descriptionFr: "Sciencesconf.org est une plateforme Web s'adressant aux organisateurs de colloques, workshops ou réunions scientifiques. Cette application est réservée aux établissements de l'enseignement et de la recherche.",
    descriptionEn: "Sciencesconf.org is a Web platform for organizers of conferences, workshops or scientific meetings. This application is reserved for higher education and research institutions.",
    url: 'http://www.sciencesconf.org/',
    icon: '🗣️', color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #34d399)',
    categoryFr: 'Colloques', categoryEn: 'Conferences', tagsFr: ['Conférences', 'Workshops', 'Recherche'], tagsEn: ['Conferences', 'Workshops', 'Research'],
  },
  {
    nameFr: 'Google Books', nameEn: 'Google Books',
    descriptionFr: "Projet mastodonte, source de polémiques infinies, lancé en 2004, Google Books donne accès à plus de sept millions d'ouvrages, tant libres que protégés par le droit d'auteur, dans de nombreuses langues (toutefois en majorité en anglais). Les documents disponibles en texte intégral sont téléchargeables en PDF. Attention : consultez toujours l'interface en anglais qui comprend bien plus de références que son homologue francophone.",
    descriptionEn: "A massive project, source of endless controversy, launched in 2004, Google Books provides access to more than seven million works, both free and copyrighted, in many languages (though mostly in English). Documents available in full text can be downloaded in PDF. Note: always consult the English interface, which includes far more references than its French counterpart.",
    url: 'https://books.google.fr/',
    icon: '📗', color: '#4285f4',
    gradient: 'linear-gradient(135deg, #4285f4, #34a853)',
    categoryFr: 'Livres', categoryEn: 'Books', tagsFr: ['7M+ ouvrages', 'PDF', 'Multilingue'], tagsEn: ['7M+ works', 'PDF', 'Multilingual'],
  },
];

export function OpenAccessPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Open Access - Central Library UYI' : 'Archives ouvertes - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'Directory of open access resources (archives and journals) accessible at the Central Library of the University of Yaoundé I.' : "Répertoire de ressources en accès libre (archives et revues) accessibles à la Bibliothèque Centrale de l'Université de Yaoundé I."} />
      </Helmet>
      <style>{responsiveStyles}</style>

      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[
            { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
            { label: isEnglish ? 'Resources' : 'Ressources', href: '/ressources/electroniques' },
            { label: isEnglish ? 'Open Access' : 'Archives ouvertes' },
          ]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Open ' : 'Les archives '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Access' : 'ouvertes'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)', maxWidth: 720 }}>
            {isEnglish ? 'Open Access: archives and online journals — a curated directory of freely accessible resources.' : "Open Access : archives ouvertes et revues en ligne — répertoire de ressources en accès libre."}
          </p>
        </div>
      </div>

      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', border: '1px solid var(--border)', borderLeft: '6px solid var(--or)', borderRadius: 'var(--radius-sm)', padding: 'clamp(18px, 2.5vw, 24px)', marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', flexShrink: 0 }}>
              <Globe size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', fontWeight: 700, color: 'var(--bleu-nuit)', marginBottom: 8, marginTop: 0 }}>
                {isEnglish ? 'Open Access: Archives and Online Journals' : 'Open Access : Archives ouvertes et revues en ligne'}
              </h2>
              <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
                {isEnglish ? 'The Central Library provides access to a wide selection of open access platforms — archives, journals, theses and digital books — freely accessible to the entire university community.' : "La Bibliothèque Centrale vous donne accès à une vaste sélection de plateformes en accès libre — archives, revues, thèses et livres numériques — librement accessibles à toute la communauté universitaire."}
              </p>
            </div>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(18px, 2vw, 24px)' }}>
          {OPEN_ACCESS_DATA.map((resource, idx) => (
            <Reveal key={resource.nameFr} className="reveal-up" delay={idx * 60}>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="card" style={{ padding: 'clamp(20px, 2.5vw, 28px)', borderTop: `4px solid ${resource.color}`, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', textDecoration: 'none', color: 'inherit', transition: 'all 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = resource.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: resource.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: `0 8px 20px ${resource.color}30`, flexShrink: 0 }}>
                  <span>{resource.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: resource.color, marginBottom: 6 }}>
                    {isEnglish ? resource.categoryEn : resource.categoryFr}
                  </div>
                  <h3 style={{ fontSize: 'clamp(16px, 1.15vw, 18px)', fontWeight: 700, color: 'var(--bleu-nuit)', margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {isEnglish ? resource.nameEn : resource.nameFr}
                    <ExternalLink size={14} color="var(--texte-muted)" />
                  </h3>
                </div>
                <p style={{ fontSize: 'clamp(12.5px, 0.88vw, 13.5px)', color: 'var(--texte-muted)', lineHeight: 1.7, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden', textAlign: 'justify' }}>
                  {isEnglish ? resource.descriptionEn : resource.descriptionFr}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                  {(isEnglish ? resource.tagsEn : resource.tagsFr).map((tag) => (
                    <span key={tag} style={{ fontSize: 'clamp(9.5px, 0.7vw, 10.5px)', padding: '3px 10px', borderRadius: 50, background: `${resource.color}12`, color: resource.color, fontWeight: 700, letterSpacing: '0.02em' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(12px, 0.85vw, 13px)', fontWeight: 600, color: resource.color, marginTop: 4 }}>
                  {isEnglish ? 'Access the platform' : 'Accéder à la plateforme'}
                  <ArrowRight size={14} />
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="reveal-up" delay={200}>
          <div style={{ marginTop: 'clamp(32px, 5vw, 48px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(24px, 3vw, 36px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <Sparkles size={22} color="var(--or)" />
              {isEnglish ? 'Why use open access?' : "Pourquoi utiliser l'accès libre ?"}
            </h3>
            <ul style={{ lineHeight: 1.9, paddingLeft: 20, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
              <li><strong>{isEnglish ? 'Free access' : 'Accès gratuit'}</strong> — {isEnglish ? 'to millions of scientific documents without subscription fees.' : 'à des millions de documents scientifiques sans frais d\'abonnement.'}</li>
              <li><strong>{isEnglish ? 'Increased visibility' : 'Visibilité accrue'}</strong> — {isEnglish ? 'your research reaches a global audience.' : 'vos recherches atteignent un public mondial.'}</li>
              <li><strong>{isEnglish ? 'Sustainability' : 'Pérennité'}</strong> — {isEnglish ? 'documents are archived and preserved for the long term.' : 'les documents sont archivés et conservés sur le long terme.'}</li>
              <li><strong>{isEnglish ? 'Interdisciplinarity' : 'Interdisciplinarité'}</strong> — {isEnglish ? 'resources covering all scientific disciplines.' : 'des ressources couvrant toutes les disciplines scientifiques.'}</li>
            </ul>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={280}>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/ressources/electroniques" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <ChevronLeft size={16} /> {isEnglish ? 'Back to resources' : 'Retour aux ressources'}
            </Link>
            <Link to="/periodiques" className="btn btn-ghost" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)' }}>
              <BookOpen size={16} /> {isEnglish ? 'See electronic journals' : 'Voir les périodiques'}
            </Link>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// THESES PAGE
// ============================================================

export function ThesesPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Theses and Dissertations - Institutional Repository UYI' : 'Thèses et Mémoires - Répertoire institutionnel UYI'}</title>
        <meta name="description" content={isEnglish ? 'Directory of theses and dissertations from the University of Yaoundé I. More than 12,400 research works available online.' : "Répertoire des thèses et mémoires de l'Université de Yaoundé I. Plus de 12 400 travaux de recherche consultables en ligne."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Theses & Dissertations' : 'Thèses & Mémoires' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'Theses & ' : 'Thèses & '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Dissertations' : 'Mémoires'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Institutional repository — 12,400+ UY1 research works' : 'Répertoire institutionnel — 12 400+ travaux de recherche UY1'}
          </p>
        </div>
      </div>
      <div className="container" style={{ padding: 'clamp(32px, 5vw, 56px) 16px', textAlign: 'center' }}>
        <Reveal className="reveal-up">
          <div style={{ fontSize: 'clamp(48px, 6vw, 64px)', marginBottom: 24 }}>🎓</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(22px, 2.5vw, 28px)', marginBottom: 16, color: 'var(--bleu-nuit)' }}>
            {isEnglish ? 'Theses & Dissertations Directory' : 'Répertoire des thèses & mémoires'}
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1vw, 16px)', color: 'var(--texte-muted)', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            {isEnglish ? 'Search among the theses and dissertations defended at the University of Yaoundé I since 1970.' : "Recherchez parmi les thèses et mémoires soutenus à l'Université de Yaoundé I depuis 1970."}
          </p>
          <div style={{ display: 'flex', gap: 'clamp(10px, 1.5vw, 16px)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogue?type=these" className="btn btn-bleu btn-lg" style={{ padding: 'clamp(12px, 1.5vw, 14px) clamp(24px, 3vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>
              <Search size={18} /> {isEnglish ? 'Search a thesis' : 'Rechercher une thèse'}
            </Link>
            <Link to="/catalogue?type=memoire" className="btn btn-outline-white btn-lg" style={{ background: 'var(--bleu-nuit)', color: 'white', border: '2px solid var(--or)', padding: 'clamp(12px, 1.5vw, 14px) clamp(24px, 3vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>
              <BookOpen size={18} /> {isEnglish ? 'Browse dissertations' : 'Parcourir les mémoires'}
            </Link>
          </div>
        </Reveal>
        <Reveal className="reveal-up" delay={150}>
          <div style={{ marginTop: 'clamp(40px, 5vw, 60px)', textAlign: 'left', padding: 'clamp(24px, 3vw, 36px)', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', color: 'var(--bleu-nuit)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <GraduationCap size={24} color="var(--or)" /> {isEnglish ? 'Available theses and dissertations' : 'Thèses et mémoires disponibles'}
            </h3>
            <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 'clamp(15px, 1.1vw, 16px)', color: 'var(--bleu-nuit)' }}>
              {isEnglish ? 'Theses and dissertations catalog' : 'Catalogue des thèses et mémoires'}
            </h4>
            <p style={{ lineHeight: 1.7, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
              {isEnglish ? 'Our catalog contains a bibliographic database of dissertations and theses defended in the various faculties of our university.' : 'Notre catalogue comporte une base de données bibliographiques des mémoires et thèses soutenus dans les différentes filières des facultés de notre université.'}
              <br />
              <Link to="/catalogue" style={{ color: 'var(--or)', fontWeight: 600 }}>{isEnglish ? 'Consult theses' : 'Consulter les thèses'}</Link>
            </p>
            <h4 style={{ fontWeight: 700, marginTop: 24, fontSize: 'clamp(15px, 1.1vw, 16px)', color: 'var(--bleu-nuit)' }}>
              {isEnglish ? 'HAL Open Archive' : 'Archive ouverte de HAL'}
            </h4>
            <p style={{ lineHeight: 1.7, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
              {isEnglish ? 'Theses and dissertations are also available in full text on the HAL open archive.' : "Les thèses et mémoires sont aussi disponibles en texte intégral sur l'archive ouverte HAL."}
              <br />
              <a href="https://hal.archives-ouvertes.fr/UNIV-YAOUNDE1" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--or)', fontWeight: 600 }}>
                {isEnglish ? 'Access the UYI HAL archive' : "Accéder à l'archive HAL de l'UYI"}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// CHARTE PAGE
// ============================================================

export function ChartePage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'WiFi Usage Charter - Central Library UYI' : "Charte d'utilisation du WiFi - Bibliothèque Centrale UYI"}</title>
        <meta name="description" content={isEnglish ? 'Consult the WiFi and Internet usage charter of the Central Library of the University of Yaoundé I.' : "Consultez la charte d'utilisation du WiFi et d'Internet à la Bibliothèque Centrale de l'Université de Yaoundé I."} />
      </Helmet>
      <style>{responsiveStyles}</style>

      <div style={{ background: 'linear-gradient(135deg, var(--bleu-nuit) 0%, #2D2178 100%)', padding: 'clamp(32px, 5vw, 48px) 0 clamp(24px, 3vw, 32px) 0' }}>
        <div className="container">
          <Breadcrumb items={[
            { label: isEnglish ? 'Home' : 'Accueil', href: '/' },
            { label: isEnglish ? 'Services' : 'Services', href: '/services' },
            { label: isEnglish ? 'WiFi Access' : 'Accès WiFi', href: '/services/wifi' },
            { label: isEnglish ? 'Charter' : 'Charte' }
          ]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'white', fontWeight: 400, marginBottom: 8 }}>
            {isEnglish ? 'WiFi Usage ' : "Charte d'utilisation du "}<span style={{ color: 'var(--or)' }}>WiFi</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(14px, 1vw, 15px)' }}>
            {isEnglish ? 'Rules for the proper use of the wireless network at the Central Library of UYI.' : "Règles de bon usage du réseau sans fil de la Bibliothèque Centrale de l'UYI."}
          </p>
        </div>
      </div>

      <div className="container-sm" style={{ padding: 'clamp(32px, 5vw, 56px) 16px' }}>
        <Reveal className="reveal-up">
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 30px)', boxShadow: '0 8px 22px rgba(27,20,100,0.05)' }}>
            <h2 style={{ fontSize: 'clamp(20px, 2vw, 28px)', color: 'var(--bleu-nuit)', marginBottom: 18, fontWeight: 700 }}>
              {isEnglish ? 'WiFi is being installed at the Central Library of UYI' : "Le WiFi s'installe à la Bibliothèque Centrale de l'UYI"}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              <img src={wifiImage} alt={isEnglish ? 'WiFi access UYI library' : 'Accès WiFi bibliothèque UYI'} style={{ width: '100%', height: 'clamp(120px, 22vw, 180px)', objectFit: 'cover', borderRadius: 12, display: 'block' }} />
              <img src={wifiImage2} alt={isEnglish ? 'WiFi connection UYI library' : 'Connexion WiFi bibliothèque UYI'} style={{ width: '100%', height: 'clamp(120px, 22vw, 180px)', objectFit: 'cover', borderRadius: 12, display: 'block' }} />
            </div>

            <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
              {isEnglish
                ? 'The Central Library of the University of Yaoundé I provides free and secure access to the Web and software (word processing, photo editing) adapted to the user. The workstation reservation service is no longer in effect in the library; usage quotas are applied per user and per day, also according to their level.'
                : "La Bibliothèque Centrale de l'Université de Yaoundé I donne un accès gratuit et sécurisé au Web et à des logiciels (traitement de texte, retouche de photographie), adaptés à l'usager. Le service de réservation des postes n'a plus cours dans la bibliothèque ; des quotas d'utilisation sont appliqués par usager et par jour, également en fonction de leur niveau."}
            </p>

            <h3 style={{ fontWeight: 700, marginTop: 24, color: 'var(--bleu-nuit)', fontSize: 'clamp(16px, 1.15vw, 18px)' }}>
              {isEnglish ? 'WiFi access is now available at the library' : "L'accès au WiFi est désormais disponible à la bibliothèque"}
            </h3>

            <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
              {isEnglish
                ? 'Internet consultation is free and open. It is governed by a charter that defines its use. Users must have a reader or consultation card or be accompanied by an adult to access it.'
                : "La consultation d'Internet est libre et gratuite. Elle est régie par une charte qui en définit l'utilisation. Les usagers doivent posséder une carte de lecteur ou de consultation ou être accompagnés d'un adulte pour y accéder."}
            </p>

            <h4 style={{ fontWeight: 700, marginTop: 20, color: 'var(--bleu-nuit)', fontSize: 'clamp(15px, 1.1vw, 17px)' }}>
              {isEnglish ? 'Conditions of access and use' : "Conditions d'accès et d'utilisation"}
            </h4>

            <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', marginBottom: 14 }}>
              {isEnglish
                ? 'All Internet features are accessible but, in order to respect the missions incumbent on libraries, the use of online chat and messaging is only tolerated. In case of abuse, the library reserves the right to suspend the connection.'
                : "Toutes les fonctionnalités d'Internet sont accessibles mais, dans le souci de respecter les missions qui incombent aux bibliothèques, l'usage de la discussion en ligne (Chat) et de la messagerie est seulement toléré. En cas d'abus, la bibliothèque se réserve le droit de suspendre la connexion."}
            </p>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={80}>
          <div style={{ marginTop: 28, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(20px, 3vw, 30px)' }}>
            <h3 style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', color: 'var(--bleu-nuit)', marginBottom: 18, fontWeight: 700 }}>
              {isEnglish ? 'Internet Usage Charter' : "Charte d'utilisation d'Internet"}
            </h3>

            <ul style={{ lineHeight: 1.9, paddingLeft: 20, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', margin: 0 }}>
              <li><strong>{isEnglish ? 'to refrain from any consultation or attempted consultation of documents on the Internet whose publication is prohibited by law;' : "de s'abstenir de toute consultation ou tentative de consultation de documents sur Internet dont la publication est prohibée par la loi ;"}</strong></li>
              <li><strong>{isEnglish ? 'to also refrain from any consultation or attempted consultation of information that would not be legally accessible to them;' : "de s'abstenir de même de toute consultation ou tentative de consultation d'informations qui ne leur seraient pas légalement accessibles ;"}</strong></li>
              <li><strong>{isEnglish ? 'to refrain, except with the authorization of rights holders or exceptions provided by law, from any reproduction, redistribution, communication to the public, in any form whatsoever, of documents protected by copyright, database producer rights, image rights, confidentiality of correspondence, etc.;' : "de s'abstenir, sauf autorisation des titulaires de droits ou exceptions prévues par la loi, de toute reproduction, rediffusion, communication au public, sous quelque forme que ce soit, de documents protégés par le droit d'auteur, le droit des producteurs de bases de données, le droit à l'image, le secret des correspondances, etc. ;"}</strong></li>
              <li><strong>{isEnglish ? 'to exercise their freedom of expression, communication and information within the limits set by law and the rights and freedoms of others, in particular respecting rules prohibiting racism, xenophobia and other discriminatory acts;' : "d'user de leur liberté d'expression, de communication et d'information dans les limites formées par la loi et les droits et libertés d'autrui, notamment dans le respect des règles prohibant le racisme, la xénophobie et autres actes discriminatoires ;"}</strong></li>
              <li><strong>{isEnglish ? 'to ensure that they avoid any confusion of persons in the procedures for identifying Internet users and to refrain from any usurpation of identity or title;' : "de veiller à éviter toute confusion de personnes dans les procédures d'identification des utilisateurs d'Internet et de s'abstenir de toute usurpation d'identité ou de titre ;"}</strong></li>
              <li><strong>{isEnglish ? 'to consult and use the Internet and new information technologies only for teaching, research or administration of University services;' : "de ne consulter et de n'utiliser Internet et les nouvelles techniques d'information qu'à des fins d'enseignement, de recherche ou d'administration des services de l'Université ;"}</strong></li>
              <li><strong>{isEnglish ? 'to comply with the rules of good practice for the use of IT resources and the Library network, indicated on the Web;' : "de se conformer aux règles de bonne pratique d'utilisation des moyens informatiques et du réseau de la Bibliothèque, indiquées sur le Web ;"}</strong></li>
              <li><strong>{isEnglish ? 'in case of doubt, to seek the necessary advice and information by contacting the staff on duty or, if necessary, the IT Resources Department.' : "de s'entourer, en cas de doute, des conseils et informations nécessaires, en s'adressant au responsable en service ou, le cas échéant, au Département des Ressources Informatiques."}</strong></li>
            </ul>
          </div>
        </Reveal>

        <Reveal className="reveal-up" delay={120}>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/services/wifi" className="btn btn-bleu" style={{ padding: 'clamp(10px, 1.2vw, 12px) clamp(18px, 2vw, 22px)' }}>
              {isEnglish ? 'Back to WiFi access' : "Retour à l'accès WiFi"}
            </Link>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}

// ============================================================
// POLITIQUE PAGE
// ============================================================

export function PolitiquePage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setShowSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsDownloading(false);
          setShowSuccess(true);
          const link = document.createElement('a');
          link.href = politiquePDF;
          link.download = 'Politique_documentaire_BC-UYI.pdf';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => setShowSuccess(false), 4000);
        }, 400);
      }
      setDownloadProgress(Math.min(progress, 100));
    }, 120);
  };

  const handleViewPDF = () => {
    window.open(politiquePDF, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Documentary Policy - Central Library UYI' : 'Politique Documentaire - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'Consult the documentary policy of the Central University Library of Yaoundé I. Strategic orientations for the constitution, management and dissemination of collections.' : "Consultez la charte documentaire de la Bibliothèque Centrale Universitaire de Yaoundé I. Orientations stratégiques pour la constitution, la gestion et la diffusion des collections."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ background: 'linear-gradient(135deg, #0f0a2a 0%, #1B1464 30%, #2D2178 60%, #4a3a8a 100%)', padding: 'clamp(32px, 5vw, 80px) 0 clamp(24px, 3vw, 60px) 0' }}>
        <div className="container">
          <Breadcrumb items={[{ label: isEnglish ? 'Home' : 'Accueil', href: '/' }, { label: isEnglish ? 'Documentary Policy' : 'Politique documentaire' }]} />
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', color: 'white', fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>
            {isEnglish ? 'Documentary ' : 'Politique '}<span style={{ color: 'var(--or)' }}>{isEnglish ? 'Policy' : 'Documentaire'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(14px, 1.2vw, 18px)', maxWidth: 640, lineHeight: 1.6 }}>
            {isEnglish ? 'The strategic orientations of the Central University Library of Yaoundé I' : 'Les orientations stratégiques de la Bibliothèque Centrale Universitaire de Yaoundé I'}
          </p>
        </div>
      </div>
      <div className="container" style={{ padding: 'clamp(32px, 5vw, 64px) 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'start' }} className="politique-grid">
          <div>
            <Reveal className="reveal-up">
              <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 'clamp(20px, 3vw, 40px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 'clamp(36px, 3.5vw, 40px)', height: 'clamp(36px, 3.5vw, 40px)', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)' }}>
                      <BookOpen size={20} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 700, color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Presentation' : 'Présentation'}</h2>
                  </div>
                  <p style={{ lineHeight: 1.8, color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)' }}>
                    {isEnglish
                      ? "The documentary charter of the BC-UYI aims to guarantee the adequacy of university action, in conformity with academic and research orientations. It defines the fundamental principles that guide the constitution, management and dissemination of collections."
                      : "La charte documentaire de la BC-UYI vise à garantir l'adéquation de l'action universitaire, en conformité avec les orientations académiques et de recherche. Elle définit les principes fondamentaux qui guident la constitution, la gestion et la diffusion des collections."}
                  </p>
                </div>
                <div style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 'clamp(36px, 3.5vw, 40px)', height: 'clamp(36px, 3.5vw, 40px)', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)' }}>
                      <Target size={20} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 700, color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Missions' : 'Missions'}</h2>
                  </div>
                  <ul style={{ lineHeight: 1.8, paddingLeft: 'clamp(20px, 2vw, 24px)', color: 'var(--texte-muted)', fontSize: 'clamp(14px, 0.95vw, 15px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li>{isEnglish ? 'Provide quality documentation adapted to the needs of the university community' : 'Mettre à disposition une documentation de qualité adaptée aux besoins de la communauté universitaire'}</li>
                    <li>{isEnglish ? 'Facilitate access to documentation by training users in documentary research' : "Faciliter l'accès à la documentation en formant les utilisateurs à la recherche documentaire"}</li>
                    <li>{isEnglish ? 'Develop the IT infrastructure and the electronic documentation offer' : "Développer le parc informatique et l'offre en documentation électronique"}</li>
                    <li>{isEnglish ? 'Actively support research at the University of Yaoundé I' : "Soutenir activement la recherche à l'Université de Yaoundé I"}</li>
                    <li>{isEnglish ? 'Develop local, national and international partnerships' : 'Développer des partenariats locaux, nationaux et internationaux'}</li>
                    <li>{isEnglish ? 'Participate in campus life and university cultural action' : "Participer à la vie du campus et à l'action culturelle universitaire"}</li>
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
          <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 24px)' }} className="download-card-wrapper">
            <Reveal className="reveal-up" delay={200}>
              <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderTop: '4px solid var(--or)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 'clamp(40px, 4vw, 48px)', height: 'clamp(40px, 4vw, 48px)', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', flexShrink: 0 }}>
                    <FileDown size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 'clamp(14px, 1.1vw, 16px)', color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Download the PDF' : 'Télécharger le PDF'}</h3>
                    <p style={{ fontSize: 'clamp(11px, 0.8vw, 12px)', color: 'var(--texte-muted)' }}>{isEnglish ? 'Official document • 12 pages' : 'Document officiel • 12 pages'}</p>
                  </div>
                </div>
                <button onClick={handleDownload} disabled={isDownloading} style={{ width: '100%', padding: 'clamp(12px, 1.2vw, 14px) clamp(16px, 2vw, 20px)', background: 'linear-gradient(135deg, var(--or), var(--or-dark))', color: 'white', border: 'none', borderRadius: 12, fontSize: 'clamp(14px, 1vw, 15px)', fontWeight: 600, cursor: isDownloading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s ease', opacity: isDownloading ? 0.7 : 1, position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.3)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  {isDownloading ? (
                    <>
                      <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>{isEnglish ? `Downloading ${Math.round(downloadProgress)}%` : `Téléchargement en cours ${Math.round(downloadProgress)}%`}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} /> <span>{isEnglish ? 'Download the document' : 'Télécharger le document'}</span>
                    </>
                  )}
                </button>
                {isDownloading && (
                  <div style={{ marginTop: 12, width: '100%', height: 4, background: 'var(--beige)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--or), var(--or-light))', borderRadius: 4, transition: 'width 0.3s ease' }} />
                  </div>
                )}
                {showSuccess && (
                  <div style={{ marginTop: 12, padding: 'clamp(8px, 1vw, 10px) clamp(12px, 1.2vw, 14px)', background: '#d1fae5', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(12px, 0.85vw, 13px)', color: '#065f46', animation: 'fadeIn 0.3s ease' }}>
                    <CheckCircle size={16} /> <span>{isEnglish ? 'Download completed successfully!' : 'Téléchargement terminé avec succès !'}</span>
                  </div>
                )}
                <button onClick={handleViewPDF} style={{ width: '100%', marginTop: 12, padding: 'clamp(8px, 1vw, 10px) clamp(12px, 1.2vw, 14px)', background: 'var(--beige)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 'clamp(13px, 0.9vw, 14px)', fontWeight: 500, color: 'var(--bleu-nuit)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'var(--or)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Eye size={16} /> {isEnglish ? 'View the document' : 'Visualiser le document'}
                </button>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(12px, 0.85vw, 13px)', color: 'var(--texte-muted)', padding: '8px 0' }}>
                    <span>📄 {isEnglish ? 'PDF Format' : 'Format PDF'}</span> <span>📏 1.2 Mo</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={handleCopyLink} style={{ padding: 'clamp(6px, 0.8vw, 8px) clamp(10px, 1vw, 12px)', background: 'var(--beige)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 'clamp(11px, 0.8vw, 12px)', fontWeight: 500, color: 'var(--texte-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'var(--or)'; e.currentTarget.style.color = 'var(--or)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--texte-muted)'; }}>
                      <Copy size={14} /> {copied ? (isEnglish ? 'Copied!' : 'Copié !') : (isEnglish ? 'Copy link' : 'Copier le lien')}
                    </button>
                    <button style={{ padding: 'clamp(6px, 0.8vw, 8px) clamp(10px, 1vw, 12px)', background: 'var(--beige)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 'clamp(11px, 0.8vw, 12px)', fontWeight: 500, color: 'var(--texte-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'var(--or)'; e.currentTarget.style.color = 'var(--or)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--beige)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--texte-muted)'; }}>
                      <Share2 size={14} /> {isEnglish ? 'Share' : 'Partager'}
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <style>{`
        ${responsiveStyles}
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 1024px) { .politique-grid { grid-template-columns: 1fr !important; gap: 32px !important; } .download-card-wrapper { position: relative !important; top: 0 !important; } }
      `}</style>
    </Layout>
  );
}

// ============================================================
// NOT FOUND PAGE
// ============================================================

export function NotFoundPage() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <Layout>
      <Helmet>
        <title>{isEnglish ? 'Page not found - Central Library UYI' : 'Page non trouvée - Bibliothèque Centrale UYI'}</title>
        <meta name="description" content={isEnglish ? 'The page you are looking for does not exist or has been moved.' : "La page que vous recherchez n'existe pas ou a été déplacée."} />
      </Helmet>
      <style>{responsiveStyles}</style>
      <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 120px) 16px' }}>
        <div style={{ fontSize: 'clamp(48px, 8vw, 80px)', marginBottom: 24 }}>📭</div>
        <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: 12, color: 'var(--bleu-nuit)' }}>{isEnglish ? 'Page not found' : 'Page introuvable'}</h1>
        <p style={{ color: 'var(--texte-muted)', marginBottom: 32, fontSize: 'clamp(14px, 1vw, 16px)' }}>{isEnglish ? 'The page you are looking for does not exist or has been moved.' : "La page que vous recherchez n'existe pas ou a été déplacée."}</p>
        <Link to="/" className="btn btn-bleu btn-lg" style={{ padding: 'clamp(12px, 1.5vw, 14px) clamp(24px, 3vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>{isEnglish ? '← Back to home' : "← Retour à l'accueil"}</Link>
      </div>
    </Layout>
  );
}

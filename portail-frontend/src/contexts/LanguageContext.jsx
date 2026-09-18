import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'bcu_language';
const DEFAULT_LANGUAGE = 'fr';

const PAGE_TRANSLATIONS = {
  fr: {},
  en: {
    'Accueil': 'Home',
    'Bibliothèque': 'Library',
    'Bibliothèque Centrale': 'Central Library',
    'Présentation': 'Presentation',
    'Coordination': 'Coordination',
    'Départements': 'Departments',
    'Sections & Unités': 'Sections & Units',
    'Politique documentaire': 'Documentary policy',
    'Médiation documentaire': 'Documentary mediation',
    'Espace consultation': 'Consultation area',
    'Reliure': 'Binding',
    'Accès WiFi': 'WiFi access',
    'Formation documentaire': 'Documentary training',
    'Livres électroniques': 'E-books',
    'Catalogue OPAC': 'OPAC catalog',
    'Thèses & Mémoires': 'Theses & Dissertations',
    'E-Ressources': 'E-resources',
    'Open Access': 'Open Access',
    'Déposer un mémoire': 'Submit a dissertation',
    'Répertoire thèses': 'Thesis directory',
    'Actualités': 'News',
    'Contact': 'Contact',
    'Retour à l\'accueil': 'Back to home',
    'Dépôt institutionnel': 'Institutional deposit',
    'Mes dossiers': 'My submissions',
    'Nouveau dépôt': 'New submission',
    'Voir les archives': 'View archives',
    'Dépôt temporairement indisponible': 'Deposit temporarily unavailable',
    'Mon compte': 'My account',
    'Confidentialité': 'Privacy policy',
    'Mentions légales': 'Legal notice',
    'Conditions générales': 'General conditions',
    'Organisation de la BC-UYI': 'BC-UYI organization',
    'Départements de la BC-UYI': 'BC-UYI departments',
    'Ressources électroniques': 'Electronic resources',
    'Thèses et Mémoires': 'Theses and dissertations',
    'Politique de Confidentialité': 'Privacy policy',
    'Mentions Légales': 'Legal notice',
    'Conditions Générales d\'Utilisation': 'Terms and conditions',
    'Ressources Financières': 'Financial resources',
    'Ressources Matérielles': 'Material resources',
    'Ressources Humaines': 'Human resources',
    'Gestion des Usagers': 'User management',
    'Gestion de l\'Effectivité au Poste': 'Work effectiveness management',
    'Acquisition et Conservation': 'Acquisition and conservation',
    'Traitement Intellectuel': 'Intellectual processing',
    'Catalogues': 'Catalogs',
    'Monographies Numériques': 'Digital monographs',
    'Connaissances Numériques': 'Digital knowledge',
    'Périodiques': 'Periodicals',
    'Système Intégré de Gestion de Bibliothèque': 'Integrated library management system',
    'Services Documentaires': 'Documentary services',
    'Sciences Ouvertes et Formation': 'Open science and training',
    'Connexion': 'Login',
    'Se connecter': 'Log in',
    'Mot de passe oublié ?': 'Forgot password?',
    'Se souvenir de moi': 'Remember me',
    'Connexion sécurisée': 'Secure login',
    'Bienvenue': 'Welcome',
    'Portail documentaire de la Bibliothèque Centrale Universitaire': 'Central University Library documentary portal',
    'Identifiant': 'Username',
    'Mot de passe': 'Password',
    'Votre identifiant SIGB ou username': 'Your SIGB username or login',
    '••••••••': '••••••••',
    'Contactez la bibliothèque': 'Contact the library',
    'Archives des Mémoires & Thèses': 'Dissertations & Theses Archive',
    'Rechercher par titre, auteur, faculté, mots-clés...': 'Search by title, author, faculty, keywords...',
    'Filtres': 'Filters',
    'Réinitialiser': 'Reset',
    'Plus récents': 'Most recent',
    'Plus anciens': 'Oldest',
    'Année (récent)': 'Year (newest)',
    'Année (ancien)': 'Year (oldest)',
    'Titre A→Z': 'Title A→Z',
    'Titre Z→A': 'Title Z→A',
    'Auteur A→Z': 'Author A→Z',
    'Auteur Z→A': 'Author Z→A',
    'Toutes facultés': 'All faculties',
    'Toutes années': 'All years',
    'Tous types': 'All types',
    'Aucun document archivé pour le moment': 'No archived documents yet',
    'Voir tous les documents': 'View all documents',
    'Imprimer': 'Print',
    'Partager': 'Share',
    'Retour à l\'accueil': 'Back home',
    'Connexion': 'Login',
    'Déconnexion': 'Logout',
    'Mon compte': 'My account',
    'Mes favoris': 'Favorites',
    'Rechercher': 'Search',
    'Nous contacter': 'Contact us',
    'Adresse': 'Address',
    'Téléphone': 'Phone',
    'Email': 'Email',
    'Horaires d\'ouverture': 'Opening hours',
    'Lundi – Vendredi': 'Monday – Friday',
    'Samedi': 'Saturday',
    'Dimanche': 'Sunday',
    'Fermé': 'Closed',
    'Aucune actualité disponible': 'No news available',
    'Renseignements généraux': 'General information',
    'Catalogue et recherche documentaire': 'Catalog and documentary research',
    'Emprunt et retour d\'ouvrages': 'Book borrowing and return',
    'Dépôt de mémoire / Quitus': 'Dissertation deposit / Quitus',
    'Accès aux ressources numériques': 'Access to digital resources',
    'Signalement d\'erreur sur le portail': 'Portal error report',
    'Autre': 'Other',
    'Le nom est requis.': 'Name is required.',
    'Adresse email invalide.': 'Invalid email address.',
    'Veuillez choisir un sujet.': 'Please choose a subject.',
    'Le message doit contenir au moins 20 caractères.': 'The message must contain at least 20 characters.',
    'Message envoyé avec succès !': 'Message sent successfully!',
    'Message envoyé (mode démo).': 'Message sent (demo mode).',
    'Bibliothèque Centrale Universitaire — Université de Yaoundé I': 'Central University Library — University of Yaoundé I',
    'Déconnexion réussie': 'Logout successful',
    'Connexion réussie ! Bienvenue.': 'Login successful! Welcome.',
    'Recherche': 'Search',
    'Événement': 'Event',
    'Informations': 'Information',
    'Acquisitions': 'Acquisitions',
    'Formation': 'Training',
    'Services': 'Services',
    'Découvrez notre bibliothèque': 'Discover our library',
    'Données actualisées': 'Data updated',
    'Erreur lors du chargement': 'Loading error',
    'Chargement...': 'Loading...',
    'Aucun résultat trouvé pour votre recherche.': 'No results found for your search.',
    'Réserver': 'Reserve',
    'Télécharger': 'Download',
    'Partager': 'Share',
    'Copié !': 'Copied!',
    'Téléchargement du quitus démarré.': 'Quitus download started.',
    'Quitus non disponible ou non encore signé.': 'Quitus unavailable or not yet signed.',
    'Déposé le :': 'Submitted on:',
    'Soumis le :': 'Submitted on:',
    'Vérifié le :': 'Verified on:'
  }
};

function applyPageTranslations(language) {
  if (typeof document === 'undefined' || language !== 'en') return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;
      return node.nodeValue && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const replacements = PAGE_TRANSLATIONS.en;
  const seen = new WeakSet();

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue || seen.has(node)) continue;
    let text = node.nodeValue;
    let changed = false;

    Object.entries(replacements).forEach(([from, to]) => {
      if (text.includes(from)) {
        text = text.replaceAll(from, to);
        changed = true;
      }
    });

    if (changed) {
      node.nodeValue = text;
      seen.add(node);
    }
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && translations[saved] ? saved : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === 'en' ? 'en-US' : 'fr-CM';
    applyPageTranslations(language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (section, key, fallback = '') => translations[language]?.[section]?.[key] ?? fallback,
    isFrench: language === 'fr',
    isEnglish: language === 'en'
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

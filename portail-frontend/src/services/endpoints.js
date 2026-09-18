// services/endpoints.js - VERSION COMPLÈTE AVEC MISE À JOUR PROFIL + MOT DE PASSE + PRÉFÉRENCES

import api from './api';

// ── Auth ────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login/', data);
export const refresh = (data) => api.post('/token/refresh/', data);
export const getMe = () => api.get('/auth/me/');

// ═══════════════════════════════════════════════════════════════════
// ─── MISE À JOUR DU PROFIL (SELF-SERVICE) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════

/**
 * Mettre à jour le profil de l'utilisateur connecté (partiel)
 * @param {Object} data - { first_name, last_name, email, preferences }
 */
export const updateProfile = async (data) => {
  try {
    const response = await api.patch('/auth/me/', data);
    return response;
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    throw error;
  }
};

/**
 * Mettre à jour complètement le profil (PUT)
 */
export const updateFullProfile = async (data) => {
  try {
    const response = await api.put('/auth/me/', data);
    return response;
  } catch (error) {
    console.error('❌ Erreur mise à jour profil (PUT):', error);
    throw error;
  }
};

/**
 * Changer le mot de passe de l'utilisateur connecté
 * @param {Object} data - { old_password, new_password, confirm_password }
 */
export const changePassword = async (data) => {
  try {
    const response = await api.post('/auth/change-password/', data);
    return response;
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    throw error;
  }
};

/**
 * Mettre à jour uniquement les préférences de l'utilisateur
 * @param {Object} preferences - Objet JSON des préférences
 */
export const updatePreferences = async (preferences) => {
  try {
    const response = await api.patch('/auth/preferences/', { preferences });
    return response;
  } catch (error) {
    console.error('❌ Erreur mise à jour préférences:', error);
    throw error;
  }
};

// ─── AIDE-BIBLIOTHÉCAIRE ────────────────────────────────────────
export const getAideBiblioDashboard = async () => {
  try {
    const response = await api.get('/auth/aide-dashboard/');
    return response;
  } catch (error) {
    console.error('Erreur récupération dashboard aide-bibliothécaire:', error);
    return { data: { success: false, dashboard: null } };
  }
};

export const redirectToPMB = async (action = 'new') => {
  try {
    const response = await api.post('/auth/aide-catalog/', { action });
    return response;
  } catch (error) {
    console.error('Erreur redirection PMB:', error);
    return { data: { success: false, redirect_url: null } };
  }
};

export const getAideBiblioStats = async () => {
  try {
    const response = await api.get('/auth/aide-stats/');
    return response;
  } catch (error) {
    console.error('Erreur récupération stats aide-bibliothécaire:', error);
    return { data: { success: false, stats: null } };
  }
};

// ─── INSCRIPTION ────────────────────────────────────────────────
export const register = async (data) => {
  try {
    const response = await api.post('/auth/register/', {
      matricule: data.matricule,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      faculte: data.faculte,
      departement: data.departement,
      niveau: data.niveau,
      password: data.password,
      confirm_password: data.confirm_password
    });
    return response;
  } catch (error) {
    console.error('Erreur inscription:', error);
    throw error;
  }
};

export const checkAvailability = async (type, value) => {
  try {
    const response = await api.get('/auth/check-availability/', {
      params: { type, value }
    });
    return response;
  } catch (error) {
    console.error('Erreur vérification:', error);
    throw error;
  }
};

// ── Catalogue PMB ───────────────────────────────────────────────
export const searchCatalog = async (params) => {
  try {
    const response = await api.get('/catalog/search/', { params });
    return response;
  } catch (error) {
    console.error('Erreur recherche catalogue:', error);
    return {
      data: {
        success: false,
        results: [],
        count: 0,
        message: error.response?.data?.detail || 'Erreur lors de la recherche'
      }
    };
  }
};

export const getNotice = async (id) => {
  try {
    const response = await api.get(`/catalog/notice/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur récupération notice:', error);
    return {
      data: {
        success: false,
        notice: null,
        message: error.response?.data?.detail || 'Notice non trouvée'
      }
    };
  }
};

export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/catalog/suggest/', { params: { q: query } });
    return response;
  } catch (error) {
    console.error('Erreur suggestions recherche:', error);
    return { data: { suggestions: [] } };
  }
};

export const getFacetedSearch = async (params) => {
  try {
    const response = await api.get('/catalog/facets/', { params });
    return response;
  } catch (error) {
    console.error('Erreur recherche facetée:', error);
    return { data: { results: [], facets: {} } };
  }
};

// ─── COMPTE UTILISATEUR PMB ──────────────────────────────────────
export const getUserAccount = async () => {
  try {
    const response = await api.get('/catalog/account/');
    return response;
  } catch (error) {
    console.error('Erreur récupération compte utilisateur:', error);
    return {
      data: {
        success: false,
        account: null,
        detail: error.response?.data?.detail || 'Impossible de récupérer les informations du compte'
      }
    };
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await api.patch('/auth/me/', data);
    return response;
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    throw error;
  }
};

// ─── AVIS SUR LES DOCUMENTS ──────────────────────────────────────
export const addReview = async (noticeId, note, comment) => {
  try {
    const rating = Math.min(Math.max(parseInt(note) || 5, 1), 5);

    const payload = {
      note: rating,
      comment: comment || ''
    };

    console.log('📝 Envoi avis:', { noticeId, payload });

    const response = await api.post(`/catalog/notice/${noticeId}/review/`, payload);

    console.log('✅ Réponse avis:', response.data);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Avis ajouté avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur ajout avis:', error);

    const errorData = error.response?.data;
    let errorMsg = 'Erreur lors de l\'ajout de l\'avis';

    if (errorData) {
      errorMsg = errorData.detail ||
                 errorData.error ||
                 errorData.message ||
                 JSON.stringify(errorData);
    }

    return {
      success: false,
      detail: errorMsg,
      status: error.response?.status || 500
    };
  }
};

export const getReviews = async (noticeId) => {
  try {
    const response = await api.get(`/catalog/notice/${noticeId}/reviews/`);
    return response;
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    return { data: { results: [] } };
  }
};

// ─── SUGGESTION D'ACHAT ──────────────────────────────────────────
export const suggestPurchase = async (data) => {
  try {
    const response = await api.post('/catalog/suggest-purchase/', {
      title: data.title,
      author: data.author || '',
      publisher: data.publisher || '',
      isbn: data.isbn || '',
      year: data.year || '',
      reason: data.reason || '',
      comment: data.comment || ''
    });
    return response.data;
  } catch (error) {
    console.error('Erreur suggestion achat:', error);
    return {
      success: false,
      detail: error.response?.data?.detail || 'Erreur lors de l\'envoi de la suggestion'
    };
  }
};

// ─── PRÊTS ET RÉSERVATIONS ──────────────────────────────────────
export const getMyLoans = async () => {
  try {
    const response = await api.get('/loans/');
    return response;
  } catch (error) {
    console.error('Erreur récupération prêts:', error);
    return { data: { results: [] } };
  }
};

export const renewLoan = async (id) => {
  try {
    const response = await api.post('/loans/renew/', { id });
    return response;
  } catch (error) {
    console.error('Erreur renouvellement prêt:', error);
    throw error;
  }
};

export const getMyReservations = async () => {
  try {
    const response = await api.get('/reservations/');
    return response;
  } catch (error) {
    console.error('Erreur récupération réservations:', error);
    return { data: { results: [] } };
  }
};

export const cancelReservation = async (id) => {
  try {
    const response = await api.post(`/reservations/${id}/cancel/`);
    return response;
  } catch (error) {
    console.error('Erreur annulation réservation:', error);
    throw error;
  }
};

// ─── FAVORIS ──────────────────────────────────────────────────────
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites/');
    return response;
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    return { data: { results: [] } };
  }
};

export const addFavorite = async (data) => {
  try {
    const payload = {
      pmb_notice_id: data.pmb_notice_id || data.notice_id || data.noticeId || data.id,
      note: data.note || data.title || ''
    };
    const response = await api.post('/favorites/', payload);
    return response;
  } catch (error) {
    console.error('Erreur ajout favori:', error);
    throw error;
  }
};

export const removeFavorite = async (id) => {
  try {
    const response = await api.delete(`/favorites/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── MÉMOIRES / DÉPÔT INSTITUTIONNEL ────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getMyMemoires = async () => {
  try {
    const response = await api.get('/memoires/');
    return response;
  } catch (error) {
    console.error('Erreur récupération mémoires:', error);
    return { data: { results: [] } };
  }
};

export const getMemoireDetail = async (id) => {
  try {
    const response = await api.get(`/memoires/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur récupération détail mémoire:', error);
    throw error;
  }
};

export const submitMemoire = async (formData) => {
  try {
    console.log('--- Soumission mémoire ---');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0] + ': ' + pair[1].name + ' (' + pair[1].size + ' bytes)');
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }

    const response = await api.post('/memoires/depot/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  } catch (error) {
    console.error('Erreur soumission mémoire:', error);
    if (error.response) {
      console.error('Réponse erreur:', error.response.data);
    }
    throw error;
  }
};

export const updateMemoire = async (id, formData) => {
  try {
    const response = await api.patch(`/memoires/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  } catch (error) {
    console.error('Erreur mise à jour mémoire:', error);
    throw error;
  }
};

export const uploadMemoireFiles = async (id, formData) => {
  try {
    const response = await api.post(`/memoires/${id}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  } catch (error) {
    console.error('Erreur upload fichiers mémoire:', error);
    if (error.response) {
      console.error('Réponse erreur:', error.response.data);
    }
    throw error;
  }
};

export const updateMemoireStatus = async (id, data) => {
  try {
    console.log('updateMemoireStatus - id:', id, 'data:', data);
    const response = await api.patch(`/memoires/${id}/status/`, data);
    return response;
  } catch (error) {
    console.error('Erreur mise à jour statut mémoire:', error);
    if (error.response) {
      console.error('Réponse erreur:', error.response.data);
    }
    throw error;
  }
};

export const downloadQuitus = async (id) => {
  try {
    const response = await api.get(`/memoires/${id}/quitus-retrieve/`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Erreur téléchargement quitus:', error);
    throw error;
  }
};

export const confirmPhysicalSignature = async (id) => {
  try {
    const response = await api.post(`/memoires/${id}/physical-sign/`);
    return response;
  } catch (error) {
    console.error('Erreur confirmation signature physique:', error);
    throw error;
  }
};

export const uploadScannedDocument = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('scanned_document', file);

    const response = await api.post(`/memoires/${id}/scanned/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  } catch (error) {
    console.error('Erreur upload document scanné:', error);
    throw error;
  }
};

export const verifyMemoire = async (id, data) => {
  try {
    const response = await api.post(`/memoires/${id}/verify/`, data);
    return response;
  } catch (error) {
    console.error('Erreur vérification mémoire:', error);
    throw error;
  }
};

export const searchMemoireByMatricule = async (matricule) => {
  try {
    const response = await api.get('/memoires/recherche/', {
      params: { matricule }
    });
    return response;
  } catch (error) {
    console.error('Erreur recherche par matricule:', error);
    throw error;
  }
};

export const signQuitus = async (id) => {
  try {
    const response = await api.post(`/memoires/${id}/quitus-sign/`);
    return response;
  } catch (error) {
    console.error('Erreur signature quitus:', error);
    throw error;
  }
};

export const confirmQuitusRetire = async (id) => {
  try {
    const response = await api.post(`/memoires/${id}/quitus-retire/`);
    return response;
  } catch (error) {
    console.error('Erreur confirmation retrait quitus:', error);
    throw error;
  }
};

export const listMemoires = async (params) => {
  try {
    const response = await api.get('/memoires/', { params });
    return response;
  } catch (error) {
    console.error('Erreur liste mémoires:', error);
    return { data: { results: [] } };
  }
};

export const getMemoireStats = async () => {
  try {
    const response = await api.get('/memoires/stats/');
    return response;
  } catch (error) {
    console.error('Erreur statistiques mémoires:', error);
    return { data: {} };
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── ACTUALITÉS & ÉVÉNEMENTS (PUBLIC) ────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getArticles = async (params = {}) => {
  try {
    const response = await api.get('/content/articles/', { params });
    return response;
  } catch (error) {
    console.error('❌ Erreur récupération articles:', error);
    return { data: { results: [] } };
  }
};

export const getArticle = async (id) => {
  try {
    const response = await api.get(`/content/articles/${id}/`);
    return response;
  } catch (error) {
    console.error('❌ Erreur récupération article:', error);
    throw error;
  }
};

export const createArticle = async (data) => {
  try {
    let response;
    if (data instanceof FormData) {
      response = await api.post('/content/articles/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await api.post('/content/articles/', data);
    }
    return response;
  } catch (error) {
    console.error('❌ Erreur création article:', error);
    if (error.response) {
      console.error('Réponse erreur:', error.response.data);
    }
    throw error;
  }
};

export const updateArticle = async (id, data) => {
  try {
    let response;
    if (data instanceof FormData) {
      response = await api.patch(`/content/articles/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await api.patch(`/content/articles/${id}/`, data);
    }
    return response;
  } catch (error) {
    console.error('❌ Erreur mise à jour article:', error);
    if (error.response) {
      console.error('Réponse erreur:', error.response.data);
    }
    throw error;
  }
};

export const deleteArticle = async (id) => {
  try {
    const response = await api.delete(`/content/articles/${id}/`);
    return response;
  } catch (error) {
    console.error('❌ Erreur suppression article:', error);
    throw error;
  }
};

export const updateArticleStatus = async (id, data) => {
  try {
    const response = await api.patch(`/content/articles/${id}/status/`, data);
    return response;
  } catch (error) {
    console.error('❌ Erreur mise à jour statut article:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── CONTACT ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// ✅ Formulaire de contact → envoie à biblio.Bibliotheque@uy1.uninet.cm
// Route backend : path('api/contact/', ContactView.as_view(), name='contact')
export const sendContact = (data) => api.post('/contact/', data);

// ✅ Messages de contact reçus (lecture admin via site_content)
export const getContactMessages = async (params) => {
  try {
    const response = await api.get('/content/messages/', { params });
    return response;
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    return { data: { results: [] } };
  }
};

export const getContactMessage = async (id) => {
  try {
    const response = await api.get(`/content/messages/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur récupération message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (id) => {
  try {
    const response = await api.patch(`/content/messages/${id}/read/`);
    return response;
  } catch (error) {
    console.error('Erreur marquage message lu:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── DOCUMENTS NUMÉRIQUES ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getDocuments = (params) => api.get('/documents/', { params });
export const getDocument = (id) => api.get(`/documents/${id}/`);
export const downloadDoc = (id) => api.get(`/documents/${id}/download/`, { responseType: 'blob' });

// ═══════════════════════════════════════════════════════════════════
// ─── DASHBOARD STATS ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats/');
    return response;
  } catch (error) {
    console.error('Erreur statistiques dashboard:', error);
    return { data: {} };
  }
};

export const getDashboardChart = async (params) => {
  try {
    const response = await api.get('/dashboard/chart/', { params });
    return response;
  } catch (error) {
    console.error('Erreur données graphique:', error);
    return { data: [] };
  }
};

export const getTopDocuments = async (params) => {
  try {
    const response = await api.get('/dashboard/top-documents/', { params });
    return response;
  } catch (error) {
    console.error('Erreur top documents:', error);
    return { data: [] };
  }
};

export const getRecentActivity = async (params) => {
  try {
    const response = await api.get('/dashboard/activity/', { params });
    return response;
  } catch (error) {
    console.error('Erreur activité récente:', error);
    return { data: [] };
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── NOTIFICATIONS ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications/');
    return response;
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return { data: { results: [] } };
  }
};

export const getNotification = async (id) => {
  try {
    const response = await getNotifications();
    const notifs = response.data?.results || response.data || [];
    const found = notifs.find(n => String(n.id) === String(id));
    return { data: found };
  } catch (error) {
    console.error('Erreur récupération notification:', error);
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await api.post(`/notifications/${id}/read/`);
    return response;
  } catch (error) {
    console.error('Erreur marquage notification lue:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.post('/notifications/read-all/');
    return response;
  } catch (error) {
    console.error('Erreur marquage toutes notifications lues:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count/');
    return response;
  } catch (error) {
    console.error('Erreur compteur notifications non lues:', error);
    return { data: { count: 0 } };
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── ADMINISTRATION ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const listUsers = async (params) => {
  try {
    const response = await api.get('/accounts/users/', { params });
    return response;
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    return { data: { results: [] } };
  }
};

export const createUser = async (data) => {
  try {
    const response = await api.post('/accounts/users/', data);
    return response;
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await api.patch(`/accounts/users/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/accounts/users/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── CONFIGURATION ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export const getConfig = async () => {
  try {
    const response = await api.get('/config/');
    return response;
  } catch (error) {
    console.error('Erreur récupération configuration:', error);
    return { data: [] };
  }
};

export const saveConfig = async (data) => {
  try {
    const response = await api.post('/config/', data);
    return response;
  } catch (error) {
    console.error('Erreur sauvegarde configuration:', error);
    throw error;
  }
};

export const updateConfig = async (id, data) => {
  try {
    const response = await api.patch(`/config/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Erreur mise à jour configuration:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// ─── EXPORT PAR DÉFAUT ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default {
  // Auth
  login, refresh, getMe, register, checkAvailability,

  // ✅ Profile Self-Service
  updateProfile, updateFullProfile, changePassword, updatePreferences,
  updateUserProfile,

  // Aide-Bibliothécaire
  getAideBiblioDashboard, redirectToPMB, getAideBiblioStats,

  // Catalogue
  searchCatalog, getNotice, getSearchSuggestions, getFacetedSearch,

  // Compte utilisateur PMB
  getUserAccount,

  // Avis
  addReview, getReviews,

  // Suggestion d'achat
  suggestPurchase,

  // Prêts et réservations
  getMyLoans, renewLoan, getMyReservations, cancelReservation,

  // Favoris
  getFavorites, addFavorite, removeFavorite,

  // Mémoires
  getMyMemoires, getMemoireDetail, submitMemoire, updateMemoire, uploadMemoireFiles,
  updateMemoireStatus, downloadQuitus, confirmPhysicalSignature,
  uploadScannedDocument, verifyMemoire, searchMemoireByMatricule,
  signQuitus, confirmQuitusRetire, listMemoires, getMemoireStats,

  // Documents
  getDocuments, getDocument, downloadDoc,

  // Articles (PUBLIC)
  getArticles, getArticle, createArticle, updateArticle, deleteArticle, updateArticleStatus,

  // Contact
  sendContact, getContactMessages, getContactMessage, markMessageAsRead,

  // Dashboard
  getDashboardStats, getDashboardChart, getTopDocuments, getRecentActivity,

  // Notifications
  getNotifications, getNotification, markAsRead, markAllAsRead, getUnreadCount,

  // Admin
  listUsers, createUser, updateUser, deleteUser,

  // Config
  getConfig, saveConfig, updateConfig
};
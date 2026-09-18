// src/config/features.js
// ═══════════════════════════════════════════════════════════════════
// ─── CONFIGURATION DES FONCTIONNALITÉS ──────────────────────────
// ═══════════════════════════════════════════════════════════════════
//
// ⚠️ POUR DÉBLOQUER LE DÉPÔT APRÈS ACCORD DU RECTEUR :
//    Passer DEPOT_ENABLED à true ci-dessous. C'est tout !
//
// ═══════════════════════════════════════════════════════════════════

export const FEATURES = {
  // 🔒 Dépôt de mémoires/thèses (bloqué tant que le recteur n'a pas validé)
  DEPOT_ENABLED: false,

  // Message affiché aux étudiants quand le dépôt est bloqué
  DEPOT_DISABLED_MESSAGE:
    "Le dépôt de mémoires et de thèses en ligne n'est pas encore disponible. " +
    "Cette fonctionnalité sera activée dès que le Rectorat de l'Université de Yaoundé I " +
    "aura donné son accord officiel. Nous vous remercions de votre compréhension.",

  // Titre du message d'information
  DEPOT_DISABLED_TITLE: "Dépôt en cours de finalisation",

  // Date ou période indicative (optionnel)
  DEPOT_DISABLED_ETA: "Prochainement — après validation du Rectorat",

  // Contact pour plus d'informations
  DEPOT_DISABLED_CONTACT: "biblio.Bibliotheque@uy1.uninet.cm",
};

export default FEATURES;
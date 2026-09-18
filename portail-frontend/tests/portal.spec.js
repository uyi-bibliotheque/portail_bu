import { test, expect } from '@playwright/test';

// Bloquer les ressources externes lourdes pour accélérer les tests en mode headless
test.beforeEach(async ({ page }) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,avif,svg}', route => {
    const url = route.request().url();
    // Autoriser les assets locaux (localhost), bloquer les CDNs externes
    if (url.includes('unsplash.com') || url.includes('images.') ) {
      route.abort();
    } else {
      route.continue();
    }
  });
});

const routes = [
  { path: '/', title: 'Accueil' },
  { path: '/catalogue', title: 'Catalogue' },
  { path: '/actualites', title: 'Actualités' },
  { path: '/contact', title: 'Contact' },
  { path: '/archives', title: 'Archives' },
  { path: '/bibliotheque/presentation', title: 'Présentation' },
  { path: '/connexion', title: 'Connexion' },
  { path: '/inscription', title: 'Inscription' },
];

test.describe('Portail frontend – Page d\'accueil', () => {

  test('affiche le hero et les éléments principaux de la page d\'accueil', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.hero', { timeout: 15000 });

    // Titre du document
    await expect(page).toHaveTitle(/Portail|Biblioth[eè]que|BCU|UYI/i);

    // H1 du hero – doit être visible dans la page
    const heroHeading = page.locator('.hero h1');
    await expect(heroHeading).toBeVisible({ timeout: 10000 });

    // Barre de recherche présente
    const searchInput = page.locator('input[placeholder*="Titre"], input[placeholder*="Rechercher"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Lien Catalogue OPAC dans les accès rapides
    await expect(page.getByRole('link', { name: /Catalogue OPAC/i }).first()).toBeVisible({ timeout: 10000 });

    // Flash info / marquee présent dans le DOM
    await expect(page.locator('.marquee-wrap')).toBeAttached();
  });

  test('affiche la section Vitrine – Collections à la une', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Titre de la section FeaturedBooksSection
    const heading = page.getByRole('heading', { name: /à la une cette semaine/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Les onglets de filtrage sont affichés
    await expect(page.getByRole('button', { name: /tout à la une/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /acquisitions 2025/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /thèses.*mémoires/i })).toBeVisible({ timeout: 10000 });
  });

  test('les onglets de la vitrine sont cliquables', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const tabAcq = page.getByRole('button', { name: /acquisitions 2025/i });
    await expect(tabAcq).toBeVisible({ timeout: 15000 });
    await tabAcq.click();
    // Après clic, l'onglet actif doit changer de couleur de fond (style inline)
    await expect(tabAcq).toHaveAttribute('style', /background/);
  });

  test('affiche la section Guide du Lecteur (4 étapes)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { name: /comment profiter des services/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Les 4 titres d'étapes
    await expect(page.getByText(/Recherchez une notice/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Consultez ou Réservez/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Déposez votre mémoire/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Obtenez votre Quitus/i)).toBeVisible({ timeout: 10000 });
  });

  test('affiche la section Agenda et événements à venir', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { name: /prochains ateliers/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Bouton vers l'agenda
    const agendaLink = page.getByRole('link', { name: /voir tout l.agenda/i });
    await expect(agendaLink).toBeVisible({ timeout: 10000 });
    await expect(agendaLink).toHaveAttribute('href', '/actualites');
  });

  test('affiche la section Services', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { name: /à votre disposition/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Au moins 3 services listés
    await expect(page.getByRole('link', { name: /consultation/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /wifi/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /médiation/i })).toBeVisible({ timeout: 10000 });
  });

  test('affiche la section Statistiques', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Titre de section stats
    const heading = page.getByRole('heading', { name: /BCUYI en quelques données/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Labels des statistiques
    await expect(page.getByText(/ouvrages catalogués/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Thèses.*mémoires/i)).toBeVisible({ timeout: 10000 });
  });

  test('affiche la section CTA Dépôt institutionnel', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { name: /déposez vos travaux de recherche/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    await expect(page.getByRole('link', { name: /déposer mon mémoire/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /parcourir le répertoire/i })).toBeVisible({ timeout: 10000 });
  });

});

test.describe('Portail frontend – Navigation & Routes publiques', () => {

  test('charge toutes les pages publiques sans erreur HTTP', async ({ page }) => {
    for (const route of routes) {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response?.ok(), `La page ${route.path} doit répondre 200`).toBeTruthy();
      await expect(page.locator('body')).toBeAttached();
    }
  });

  test('navigue vers Catalogue OPAC depuis les accès rapides', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /Catalogue OPAC/i }).first().click();
    await expect(page).toHaveURL(/\/catalogue/);
  });

  test('navigue vers le dépôt depuis le CTA ou les accès rapides', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /déposer.*mémoire/i }).first().click();
    await expect(page).toHaveURL(/\/depot\/soumettre/);
  });

  test('la page Archives se charge et affiche du contenu', async ({ page }) => {
    await page.goto('/archives', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeAttached();
    // Vérifier qu'un en-tête quelconque est présent
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('la page Connexion affiche un formulaire de saisie', async ({ page }) => {
    await page.goto('/connexion', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });

  test('le lien Thèses des accès rapides fonctionne', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.getByRole('link', { name: /Thèses.*Mémoires/i }).first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await expect(page).toHaveURL(/\/theses/);
  });

});

test.describe('Portail frontend – Formulaire Contact', () => {

  test('la page Contact s\'affiche avec les infos de la BU', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /nous contacter/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Université de Yaoundé I/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('soumet le formulaire de contact en mode démo', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });

    await page.getByLabel(/nom/i).fill('Test utilisateur');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/sujet/i).selectOption({ label: /renseignements généraux/i });
    await page.getByLabel(/message/i).fill('Bonjour, ceci est un test automatique de formulaire pour le portail.');
    await page.getByRole('button', { name: /envoyer/i }).click();

    await expect(page.getByText(/message envoyé/i)).toBeVisible({ timeout: 15000 });
  });

});

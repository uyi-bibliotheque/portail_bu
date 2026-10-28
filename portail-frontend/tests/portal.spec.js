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

  test('filtre et compte les mémoires et thèses par établissement et année', async ({ page }) => {
    const archiveDocuments = [
      {
        id: 'memoire-fs-2023', title: 'Mémoire sciences 2023', type_document: 'MEMOIRE',
        is_archived: true, document_name: 'FS_MEM_2023.pdf', archived_at: '2023-06-01T00:00:00Z',
        archive_info: { faculty: 'FS', year: 2023, document_name: 'FS_MEM_2023.pdf' },
      },
      {
        id: 'these-fs-2022', title: 'Thèse sciences 2022', type_document: 'THESE',
        is_archived: true, document_name: 'FS_THESE_2022.pdf', archived_at: '2022-06-01T00:00:00Z',
        archive_info: { faculty: 'FS', year: 2022, document_name: 'FS_THESE_2022.pdf' },
      },
    ];

    await page.route('**/api/archives/public/?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: archiveDocuments }),
    }));
    await page.route('**/api/archives/public/direct/', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    }));

    await page.goto('/archives', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/1 mémoire/).first()).toBeVisible();
    await expect(page.getByText(/1 thèse/).first()).toBeVisible();

    await page.locator('#archive-year').selectOption('2022');
    await expect(page.locator('h3').filter({ hasText: 'Thèse sciences 2022' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Mémoire sciences 2023' })).toHaveCount(0);

    await page.locator('#archive-sort').selectOption('faculty_asc');
    await page.locator('#archive-faculty').selectOption('FS');
    await expect(page.getByText(/1 résultat.*0 mémoire, 1 thèse/)).toBeVisible();
  });

  test('affiche les archives par pages avec accès direct au début et à la fin', async ({ page }) => {
    const archiveDocuments = Array.from({ length: 25 }, (_, index) => ({
      id: `memoire-${index + 1}`,
      title: `Archive paginée ${index + 1}`,
      type_document: 'MEMOIRE',
      is_archived: true,
      archived_at: new Date(Date.UTC(2024, 0, index + 1)).toISOString(),
      archive_info: { faculty: 'FS', year: 2024 },
    }));

    await page.route('**/api/archives/public/?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: archiveDocuments }),
    }));
    await page.route('**/api/archives/public/direct/', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    }));

    await page.goto('/archives', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 25' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 13' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Page 2' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 13' })).toBeVisible();
    await page.getByRole('button', { name: 'Page suivante' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 1' })).toBeVisible();

    await page.getByRole('button', { name: 'Page précédente' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 13' })).toBeVisible();
    await page.getByRole('button', { name: 'Aller à la première page' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 25' })).toBeVisible();
    await page.getByRole('button', { name: 'Aller à la dernière page' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive paginée 1' })).toBeVisible();
  });

  test('charge aussi les pages suivantes de l’API des archives', async ({ page }) => {
    const firstPage = Array.from({ length: 12 }, (_, index) => ({
      id: `archive-api-${index + 1}`,
      title: `Archive API ${index + 1}`,
      type_document: 'THESE',
      is_archived: true,
      archived_at: new Date(Date.UTC(2023, 0, index + 1)).toISOString(),
      archive_info: { faculty: 'FS', year: 2023 },
    }));
    const secondPage = [{
      id: 'archive-api-13',
      title: 'Archive API page suivante',
      type_document: 'THESE',
      is_archived: true,
      archived_at: '2022-01-01T00:00:00Z',
      archive_info: { faculty: 'FS', year: 2023 },
    }];

    await page.route('**/api/archives/public/**', route => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/direct/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ results: [] }),
        });
      }

      const isSecondPage = requestUrl.searchParams.get('page') === '2';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: isSecondPage ? secondPage : firstPage,
          next: isSecondPage ? null : `${requestUrl.origin}/api/archives/public/?page=2`,
        }),
      });
    });

    await page.goto('/archives', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/13 résultat/).first()).toBeVisible();
    await page.getByRole('button', { name: 'Page 2' }).click();
    await expect(page.locator('h3').filter({ hasText: 'Archive API page suivante' })).toBeVisible();
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

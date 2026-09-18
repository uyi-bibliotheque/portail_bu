# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Portail frontend – Page d'accueil >> affiche la section Vitrine – Collections à la une
- Location: tests/portal.spec.js:51:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /à la une cette semaine/i })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: /à la une cette semaine/i })

```

```yaml
- link "Aller au contenu":
  - /url: "#main"
- banner:
  - link "BCUYI BCUYI BIBLIOTHÈQUE CENTRALE":
    - /url: /
    - img "BCUYI"
    - text: BCUYI BIBLIOTHÈQUE CENTRALE
  - navigation:
    - list:
      - listitem:
        - link "Accueil":
          - /url: /
      - listitem:
        - button "Bibliothèque"
      - listitem:
        - button "Services"
      - listitem:
        - button "Ressources"
      - listitem:
        - button "Dépôt"
      - listitem:
        - link "Actualités":
          - /url: /actualites
      - listitem:
        - link "Contact":
          - /url: /contact
  - button "Rechercher"
  - link "Connexion":
    - /url: /connexion
- main:
  - text: INFO 📢 test du temps d'expiration 📢 test du temps d'expiration UNIVERSITÉ DE YAOUNDÉ I — DEPUIS 1962
  - heading "Bibliothèque Centrale Université de Yaoundé I" [level=1]
  - paragraph: "Votre porte d'entrée vers le savoir : catalogue, thèses, ressources numériques et dépôt institutionnel au service de la communauté scientifique."
  - textbox "Rechercher dans le catalogue":
    - /placeholder: Titre, auteur, ISBN, sujet, mot-clé…
  - button "Rechercher"
  - button "Afficher la recherche avancée"
  - link "OPAC":
    - /url: /catalogue
  - link "Thèses":
    - /url: /theses
  - link "Research4Life":
    - /url: /ressources/electroniques
  - text: 📰 Actualités 1 articles
  - link "Voir tout":
    - /url: /actualites
  - img "test du temps d'expiration"
  - text: ℹ️ Informations 4 août 2026
  - heading "test du temps d'expiration" [level=4]
  - paragraph: ghv yu vy fbhjuvuhv uy…
  - link "Lire la suite":
    - /url: /actualites/5343f573-a7ea-4e06-96e9-b10bd8471934
  - button
  - button "Aller à l'actualité 1"
  - button
  - text: Horaires d'ouverture 📖 Lundi – Vendredi 07h30 – 18h30 📚 Samedi 08h00 – 13h00 🔒 Dimanche Fermé 📍 Campus de l'Université de Yaoundé I Découvrir
  - link "Catalogue OPAC Rechercher dans 85 000+ notices Accéder":
    - /url: /catalogue
  - link "Thèses & Mémoires 12 400+ travaux de recherche Accéder":
    - /url: /theses
  - link "Research4Life Accès aux revues scientifiques Accéder":
    - /url: /ressources/electroniques
  - link "Déposer un mémoire Dépôt institutionnel DSpace Accéder":
    - /url: /depot/soumettre
  - text: Nos services
  - heading "À votre disposition" [level=2]
  - link "Voir tous":
    - /url: /services/consultation
  - link "Consultation Accès aux collections":
    - /url: /services/consultation
  - link "WiFi 200 Mbps Connexion haut débit":
    - /url: /services/wifi
  - link "Reliure Service de reliure":
    - /url: /services/reliure
  - link "Médiation Aide à la recherche":
    - /url: /services/mediation
  - link "Formation Formation documentaire":
    - /url: /services/formation
  - text: En chiffres
  - heading "La BCUYI en quelques données" [level=2]
  - text: 0+ Ouvrages catalogués 0+ Thèses & mémoires 0 Mbps WiFi campus 0 Facultés desservies DÉPÔT INSTITUTIONNEL
  - heading "Déposez vos travaux de recherche" [level=2]
  - paragraph: Valorisez votre mémoire ou thèse en le déposant dans le répertoire institutionnel de l'Université de Yaoundé I.
  - link "Déposer mon mémoire":
    - /url: /depot/soumettre
  - link "Parcourir le répertoire":
    - /url: /depot/repertoire
  - heading "Horaires d'ouverture" [level=3]
  - paragraph: "Lundi – Vendredi : 07h30 – 18h30 Samedi : 08h00 – 13h00 Dimanche : Fermé"
  - heading "Ressources en ligne" [level=3]
  - paragraph: Accès 24h/24 au catalogue PMB Research4Life, DOAJ, OpenEdition
  - heading "Communauté" [level=3]
  - paragraph: Étudiants, enseignants et chercheurs Partenaires institutionnels
- contentinfo:
  - img "Logo BCUYI"
  - paragraph: La Bibliothèque Centrale de l'Université de Yaoundé I est au service de la communauté universitaire depuis 1962.
  - link "Facebook":
    - /url: "#"
    - img
  - link "YouTube":
    - /url: "#"
    - img
  - heading "Liens Rapides" [level=4]
  - list:
    - listitem:
      - link "Catalogue OPAC":
        - /url: /catalogue
    - listitem:
      - link "Thèses & Mémoires":
        - /url: /theses
    - listitem:
      - link "Déposer un mémoire":
        - /url: /depot/soumettre
    - listitem:
      - link "E-Ressources":
        - /url: /ressources/electroniques
    - listitem:
      - link "Actualités":
        - /url: /actualites
    - listitem:
      - link "Contact":
        - /url: /contact
  - heading "Ressources Externes" [level=4]
  - list:
    - listitem:
      - link "Research4Life":
        - /url: https://www.research4life.org
    - listitem:
      - link "OpenDOAR":
        - /url: https://v2.sherpa.ac.uk/opendoar/
    - listitem:
      - link "DOAJ":
        - /url: https://doaj.org
    - listitem:
      - link "BNF Gallica":
        - /url: https://gallica.bnf.fr
    - listitem:
      - link "OpenEdition":
        - /url: https://www.openedition.org
  - heading "Contact" [level=4]
  - list:
    - listitem: Université de Yaoundé I Yaoundé, Cameroun
    - listitem: + 237 242 06 47 28
    - listitem: biblio.Bibliotheque@uy1.uninet.cm
  - text: "Horaires d'ouverture Lun – Ven : 07h30 – 16h30 Samedi ,Dimanche : Fermé © 2026 Bibliothèque Centrale Universitaire – Université de Yaoundé I. Tous droits réservés."
  - link "Mentions légales":
    - /url: /mentions-legales
  - link "Confidentialité":
    - /url: /confidentialite
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Bloquer les ressources externes lourdes pour accélérer les tests en mode headless
  4   | test.beforeEach(async ({ page }) => {
  5   |   await page.route('**/*.{png,jpg,jpeg,webp,gif,avif,svg}', route => {
  6   |     const url = route.request().url();
  7   |     // Autoriser les assets locaux (localhost), bloquer les CDNs externes
  8   |     if (url.includes('unsplash.com') || url.includes('images.') ) {
  9   |       route.abort();
  10  |     } else {
  11  |       route.continue();
  12  |     }
  13  |   });
  14  | });
  15  | 
  16  | const routes = [
  17  |   { path: '/', title: 'Accueil' },
  18  |   { path: '/catalogue', title: 'Catalogue' },
  19  |   { path: '/actualites', title: 'Actualités' },
  20  |   { path: '/contact', title: 'Contact' },
  21  |   { path: '/archives', title: 'Archives' },
  22  |   { path: '/bibliotheque/presentation', title: 'Présentation' },
  23  |   { path: '/connexion', title: 'Connexion' },
  24  |   { path: '/inscription', title: 'Inscription' },
  25  | ];
  26  | 
  27  | test.describe('Portail frontend – Page d\'accueil', () => {
  28  | 
  29  |   test('affiche le hero et les éléments principaux de la page d\'accueil', async ({ page }) => {
  30  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  31  |     await page.waitForSelector('.hero', { timeout: 15000 });
  32  | 
  33  |     // Titre du document
  34  |     await expect(page).toHaveTitle(/Portail|Biblioth[eè]que|BCU|UYI/i);
  35  | 
  36  |     // H1 du hero – doit être visible dans la page
  37  |     const heroHeading = page.locator('.hero h1');
  38  |     await expect(heroHeading).toBeVisible({ timeout: 10000 });
  39  | 
  40  |     // Barre de recherche présente
  41  |     const searchInput = page.locator('input[placeholder*="Titre"], input[placeholder*="Rechercher"]');
  42  |     await expect(searchInput).toBeVisible({ timeout: 10000 });
  43  | 
  44  |     // Lien Catalogue OPAC dans les accès rapides
  45  |     await expect(page.getByRole('link', { name: /Catalogue OPAC/i }).first()).toBeVisible({ timeout: 10000 });
  46  | 
  47  |     // Flash info / marquee présent dans le DOM
  48  |     await expect(page.locator('.marquee-wrap')).toBeAttached();
  49  |   });
  50  | 
  51  |   test('affiche la section Vitrine – Collections à la une', async ({ page }) => {
  52  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  53  | 
  54  |     // Titre de la section FeaturedBooksSection
  55  |     const heading = page.getByRole('heading', { name: /à la une cette semaine/i });
> 56  |     await expect(heading).toBeVisible({ timeout: 20000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  57  | 
  58  |     // Les onglets de filtrage sont affichés
  59  |     await expect(page.getByRole('button', { name: /tout à la une/i })).toBeVisible({ timeout: 10000 });
  60  |     await expect(page.getByRole('button', { name: /acquisitions 2025/i })).toBeVisible({ timeout: 10000 });
  61  |     await expect(page.getByRole('button', { name: /thèses.*mémoires/i })).toBeVisible({ timeout: 10000 });
  62  |   });
  63  | 
  64  |   test('les onglets de la vitrine sont cliquables', async ({ page }) => {
  65  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  66  | 
  67  |     const tabAcq = page.getByRole('button', { name: /acquisitions 2025/i });
  68  |     await expect(tabAcq).toBeVisible({ timeout: 15000 });
  69  |     await tabAcq.click();
  70  |     // Après clic, l'onglet actif doit changer de couleur de fond (style inline)
  71  |     await expect(tabAcq).toHaveAttribute('style', /background/);
  72  |   });
  73  | 
  74  |   test('affiche la section Guide du Lecteur (4 étapes)', async ({ page }) => {
  75  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  76  | 
  77  |     const heading = page.getByRole('heading', { name: /comment profiter des services/i });
  78  |     await expect(heading).toBeVisible({ timeout: 20000 });
  79  | 
  80  |     // Les 4 titres d'étapes
  81  |     await expect(page.getByText(/Recherchez une notice/i)).toBeVisible({ timeout: 10000 });
  82  |     await expect(page.getByText(/Consultez ou Réservez/i)).toBeVisible({ timeout: 10000 });
  83  |     await expect(page.getByText(/Déposez votre mémoire/i).first()).toBeVisible({ timeout: 10000 });
  84  |     await expect(page.getByText(/Obtenez votre Quitus/i)).toBeVisible({ timeout: 10000 });
  85  |   });
  86  | 
  87  |   test('affiche la section Agenda et événements à venir', async ({ page }) => {
  88  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  89  | 
  90  |     const heading = page.getByRole('heading', { name: /prochains ateliers/i });
  91  |     await expect(heading).toBeVisible({ timeout: 20000 });
  92  | 
  93  |     // Bouton vers l'agenda
  94  |     const agendaLink = page.getByRole('link', { name: /voir tout l.agenda/i });
  95  |     await expect(agendaLink).toBeVisible({ timeout: 10000 });
  96  |     await expect(agendaLink).toHaveAttribute('href', '/actualites');
  97  |   });
  98  | 
  99  |   test('affiche la section Services', async ({ page }) => {
  100 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  101 | 
  102 |     const heading = page.getByRole('heading', { name: /à votre disposition/i });
  103 |     await expect(heading).toBeVisible({ timeout: 20000 });
  104 | 
  105 |     // Au moins 3 services listés
  106 |     await expect(page.getByRole('link', { name: /consultation/i }).first()).toBeVisible({ timeout: 10000 });
  107 |     await expect(page.getByRole('link', { name: /wifi/i })).toBeVisible({ timeout: 10000 });
  108 |     await expect(page.getByRole('link', { name: /médiation/i })).toBeVisible({ timeout: 10000 });
  109 |   });
  110 | 
  111 |   test('affiche la section Statistiques', async ({ page }) => {
  112 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  113 | 
  114 |     // Titre de section stats
  115 |     const heading = page.getByRole('heading', { name: /BCUYI en quelques données/i });
  116 |     await expect(heading).toBeVisible({ timeout: 20000 });
  117 | 
  118 |     // Labels des statistiques
  119 |     await expect(page.getByText(/ouvrages catalogués/i)).toBeVisible({ timeout: 10000 });
  120 |     await expect(page.getByText(/Thèses.*mémoires/i)).toBeVisible({ timeout: 10000 });
  121 |   });
  122 | 
  123 |   test('affiche la section CTA Dépôt institutionnel', async ({ page }) => {
  124 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  125 | 
  126 |     const heading = page.getByRole('heading', { name: /déposez vos travaux de recherche/i });
  127 |     await expect(heading).toBeVisible({ timeout: 20000 });
  128 | 
  129 |     await expect(page.getByRole('link', { name: /déposer mon mémoire/i })).toBeVisible({ timeout: 10000 });
  130 |     await expect(page.getByRole('link', { name: /parcourir le répertoire/i })).toBeVisible({ timeout: 10000 });
  131 |   });
  132 | 
  133 | });
  134 | 
  135 | test.describe('Portail frontend – Navigation & Routes publiques', () => {
  136 | 
  137 |   test('charge toutes les pages publiques sans erreur HTTP', async ({ page }) => {
  138 |     for (const route of routes) {
  139 |       const response = await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  140 |       expect(response?.ok(), `La page ${route.path} doit répondre 200`).toBeTruthy();
  141 |       await expect(page.locator('body')).toBeAttached();
  142 |     }
  143 |   });
  144 | 
  145 |   test('navigue vers Catalogue OPAC depuis les accès rapides', async ({ page }) => {
  146 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  147 |     await page.getByRole('link', { name: /Catalogue OPAC/i }).first().click();
  148 |     await expect(page).toHaveURL(/\/catalogue/);
  149 |   });
  150 | 
  151 |   test('navigue vers le dépôt depuis le CTA ou les accès rapides', async ({ page }) => {
  152 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  153 |     await page.getByRole('link', { name: /déposer.*mémoire/i }).first().click();
  154 |     await expect(page).toHaveURL(/\/depot\/soumettre/);
  155 |   });
  156 | 
```
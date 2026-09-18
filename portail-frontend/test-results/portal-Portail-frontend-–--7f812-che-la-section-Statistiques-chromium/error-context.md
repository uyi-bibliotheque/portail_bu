# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Portail frontend – Page d'accueil >> affiche la section Statistiques
- Location: tests/portal.spec.js:111:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Thèses.*mémoires/i)
Expected: visible
Error: strict mode violation: getByText(/Thèses.*mémoires/i) resolved to 4 elements:
    1) <span>Thèses & Mémoires</span> aka getByRole('navigation').getByText('Thèses & Mémoires')
    2) <div>Thèses & Mémoires</div> aka getByRole('link', { name: 'Thèses & Mémoires 12 400+' })
    3) <div>Thèses & mémoires</div> aka getByText('Thèses & mémoires', { exact: true })
    4) <a href="/theses" data-discover="true">…</a> aka getByRole('link', { name: 'Thèses & Mémoires', exact: true })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/Thèses.*mémoires/i)

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Aller au contenu" [ref=e4] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "BCUYI BCUYI BIBLIOTHÈQUE CENTRALE" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "BCUYI" [ref=e8]
        - generic [ref=e9]:
          - generic [ref=e10]: BCUYI
          - generic [ref=e11]: BIBLIOTHÈQUE CENTRALE
      - navigation [ref=e12]:
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "Accueil" [ref=e15] [cursor=pointer]:
              - /url: /
          - listitem [ref=e19]:
            - button "Bibliothèque" [ref=e20] [cursor=pointer]
          - listitem [ref=e25]:
            - button "Services" [ref=e26] [cursor=pointer]
          - listitem [ref=e31]:
            - button "Ressources" [ref=e32] [cursor=pointer]
          - listitem [ref=e38]:
            - button "Dépôt" [ref=e39] [cursor=pointer]
          - listitem [ref=e45]:
            - link "Actualités" [ref=e46] [cursor=pointer]:
              - /url: /actualites
          - listitem [ref=e50]:
            - link "Contact" [ref=e51] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e55]:
        - button "Rechercher" [ref=e56] [cursor=pointer]
        - link "Connexion" [ref=e60] [cursor=pointer]:
          - /url: /connexion
  - main [ref=e64]:
    - generic [ref=e65]:
      - generic [ref=e66]:
        - generic [ref=e67]: INFO
        - generic [ref=e68]:
          - generic [ref=e69]: 📢 test du temps d'expiration
          - generic [ref=e70]: 📢 test du temps d'expiration
      - generic [ref=e71]:
        - generic [ref=e74]:
          - generic [ref=e76]:
            - generic [ref=e77]: UNIVERSITÉ DE YAOUNDÉ I — DEPUIS 1962
            - heading [level=1] [ref=e82]:
              - text: Bibliothèque Centrale
              - generic [ref=e83]: Université de Yaoundé I
            - paragraph [ref=e85]: "Votre porte d'entrée vers le savoir : catalogue, thèses, ressources numériques et dépôt institutionnel au service de la communauté scientifique."
            - generic [ref=e87]:
              - textbox "Rechercher dans le catalogue" [ref=e92]:
                - /placeholder: Titre, auteur, ISBN, sujet, mot-clé…
              - button "Rechercher" [ref=e93] [cursor=pointer]
            - generic [ref=e97]:
              - button "Afficher la recherche avancée" [ref=e98] [cursor=pointer]
              - generic [ref=e100]:
                - link "OPAC" [ref=e101] [cursor=pointer]:
                  - /url: /catalogue
                - link "Thèses" [ref=e102] [cursor=pointer]:
                  - /url: /theses
                - link "Research4Life" [ref=e103] [cursor=pointer]:
                  - /url: /ressources/electroniques
          - generic [ref=e104]:
            - generic [ref=e106]:
              - generic [ref=e107]:
                - generic [ref=e108]:
                  - generic [ref=e109]: 📰
                  - generic [ref=e110]:
                    - text: Actualités
                    - generic [ref=e111]: 1 articles
                - link "Voir tout" [ref=e112] [cursor=pointer]:
                  - /url: /actualites
              - img "test du temps d'expiration" [ref=e116]
              - generic [ref=e117]:
                - generic [ref=e118]:
                  - generic [ref=e119]: ℹ️ Informations
                  - generic [ref=e120]: 4 août 2026
                - heading "test du temps d'expiration" [level=4] [ref=e124]
                - paragraph [ref=e125]: ghv yu vy fbhjuvuhv uy…
                - link "Lire la suite" [ref=e126] [cursor=pointer]:
                  - /url: /actualites/5343f573-a7ea-4e06-96e9-b10bd8471934
              - generic [ref=e129]:
                - button [ref=e130] [cursor=pointer]
                - button "Aller à l'actualité 1" [ref=e133] [cursor=pointer]
                - button [ref=e134] [cursor=pointer]
            - generic [ref=e138]:
              - generic [ref=e139]: Horaires d'ouverture
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - generic [ref=e147]:
                    - generic [ref=e148]: 📖
                    - text: Lundi – Vendredi
                  - generic [ref=e149]: 07h30 – 18h30
                - generic [ref=e150]:
                  - generic [ref=e151]:
                    - generic [ref=e152]: 📚
                    - text: Samedi
                  - generic [ref=e153]: 08h00 – 13h00
                - generic [ref=e154]:
                  - generic [ref=e155]:
                    - generic [ref=e156]: 🔒
                    - text: Dimanche
                  - generic [ref=e157]: Fermé
              - generic [ref=e158]: 📍 Campus de l'Université de Yaoundé I
        - generic [ref=e159]: Découvrir
      - generic [ref=e166]:
        - link "Catalogue OPAC Rechercher dans 85 000+ notices Accéder" [ref=e167] [cursor=pointer]:
          - /url: /catalogue
          - generic [ref=e171]: Catalogue OPAC
          - generic [ref=e172]: Rechercher dans 85 000+ notices
          - generic [ref=e173]: Accéder
        - link "Thèses & Mémoires 12 400+ travaux de recherche Accéder" [ref=e176] [cursor=pointer]:
          - /url: /theses
          - generic [ref=e181]: Thèses & Mémoires
          - generic [ref=e182]: 12 400+ travaux de recherche
          - generic [ref=e183]: Accéder
        - link "Research4Life Accès aux revues scientifiques Accéder" [ref=e186] [cursor=pointer]:
          - /url: /ressources/electroniques
          - generic [ref=e191]: Research4Life
          - generic [ref=e192]: Accès aux revues scientifiques
          - generic [ref=e193]: Accéder
        - link "Déposer un mémoire Dépôt institutionnel DSpace Accéder" [ref=e196] [cursor=pointer]:
          - /url: /depot/soumettre
          - generic [ref=e201]: Déposer un mémoire
          - generic [ref=e202]: Dépôt institutionnel DSpace
          - generic [ref=e203]: Accéder
      - generic [ref=e207]:
        - generic [ref=e208]:
          - generic [ref=e209]:
            - generic [ref=e210]: Nos services
            - heading "À votre disposition" [level=2] [ref=e211]
          - link "Voir tous" [ref=e212] [cursor=pointer]:
            - /url: /services/consultation
        - generic [ref=e216]:
          - link "Consultation Accès aux collections" [ref=e217] [cursor=pointer]:
            - /url: /services/consultation
            - generic [ref=e222]: Consultation
            - generic [ref=e223]: Accès aux collections
          - link "WiFi 200 Mbps Connexion haut débit" [ref=e224] [cursor=pointer]:
            - /url: /services/wifi
            - generic [ref=e230]: WiFi 200 Mbps
            - generic [ref=e231]: Connexion haut débit
          - link "Reliure Service de reliure" [ref=e232] [cursor=pointer]:
            - /url: /services/reliure
            - generic [ref=e237]: Reliure
            - generic [ref=e238]: Service de reliure
          - link "Médiation Aide à la recherche" [ref=e239] [cursor=pointer]:
            - /url: /services/mediation
            - generic [ref=e246]: Médiation
            - generic [ref=e247]: Aide à la recherche
          - link "Formation Formation documentaire" [ref=e248] [cursor=pointer]:
            - /url: /services/formation
            - generic [ref=e253]: Formation
            - generic [ref=e254]: Formation documentaire
      - generic [ref=e256]:
        - generic [ref=e257]:
          - generic [ref=e258]: En chiffres
          - heading "La BCUYI en quelques données" [level=2] [ref=e259]
        - generic [ref=e261]:
          - generic [ref=e262]:
            - generic [ref=e266]: 0+
            - generic [ref=e267]: Ouvrages catalogués
          - generic [ref=e268]:
            - generic [ref=e273]: 0+
            - generic [ref=e274]: Thèses & mémoires
          - generic [ref=e275]:
            - generic [ref=e281]: "0"
            - generic [ref=e282]: Mbps WiFi campus
          - generic [ref=e283]:
            - generic [ref=e287]: "0"
            - generic [ref=e288]: Facultés desservies
      - generic [ref=e290]:
        - generic [ref=e291]: DÉPÔT INSTITUTIONNEL
        - heading "Déposez vos travaux de recherche" [level=2] [ref=e295]
        - paragraph [ref=e296]: Valorisez votre mémoire ou thèse en le déposant dans le répertoire institutionnel de l'Université de Yaoundé I.
        - generic [ref=e297]:
          - link "Déposer mon mémoire" [ref=e298] [cursor=pointer]:
            - /url: /depot/soumettre
          - link "Parcourir le répertoire" [ref=e302] [cursor=pointer]:
            - /url: /depot/repertoire
      - generic [ref=e308]:
        - generic [ref=e314]:
          - heading "Horaires d'ouverture" [level=3] [ref=e315]
          - paragraph [ref=e316]: "Lundi – Vendredi : 07h30 – 18h30Samedi : 08h00 – 13h00Dimanche : Fermé"
        - generic [ref=e322]:
          - heading "Ressources en ligne" [level=3] [ref=e323]
          - paragraph [ref=e324]: Accès 24h/24 au catalogue PMBResearch4Life, DOAJ, OpenEdition
        - generic [ref=e332]:
          - heading "Communauté" [level=3] [ref=e333]
          - paragraph [ref=e334]: Étudiants, enseignants et chercheursPartenaires institutionnels
  - contentinfo [ref=e335]:
    - generic [ref=e336]:
      - generic [ref=e337]:
        - generic [ref=e338]:
          - img "Logo BCUYI" [ref=e340]
          - paragraph [ref=e341]: La Bibliothèque Centrale de l'Université de Yaoundé I est au service de la communauté universitaire depuis 1962.
          - generic [ref=e342]:
            - link "Facebook" [ref=e343] [cursor=pointer]:
              - /url: "#"
            - link "YouTube" [ref=e346] [cursor=pointer]:
              - /url: "#"
        - generic [ref=e349]:
          - heading "Liens Rapides" [level=4] [ref=e350]
          - list [ref=e351]:
            - listitem [ref=e352]:
              - link "Catalogue OPAC" [ref=e353] [cursor=pointer]:
                - /url: /catalogue
            - listitem [ref=e356]:
              - link "Thèses & Mémoires" [ref=e357] [cursor=pointer]:
                - /url: /theses
            - listitem [ref=e360]:
              - link "Déposer un mémoire" [ref=e361] [cursor=pointer]:
                - /url: /depot/soumettre
            - listitem [ref=e364]:
              - link "E-Ressources" [ref=e365] [cursor=pointer]:
                - /url: /ressources/electroniques
            - listitem [ref=e368]:
              - link "Actualités" [ref=e369] [cursor=pointer]:
                - /url: /actualites
            - listitem [ref=e372]:
              - link "Contact" [ref=e373] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e376]:
          - heading "Ressources Externes" [level=4] [ref=e377]
          - list [ref=e378]:
            - listitem [ref=e379]:
              - link "Research4Life" [ref=e380] [cursor=pointer]:
                - /url: https://www.research4life.org
            - listitem [ref=e385]:
              - link "OpenDOAR" [ref=e386] [cursor=pointer]:
                - /url: https://v2.sherpa.ac.uk/opendoar/
            - listitem [ref=e391]:
              - link "DOAJ" [ref=e392] [cursor=pointer]:
                - /url: https://doaj.org
            - listitem [ref=e397]:
              - link "BNF Gallica" [ref=e398] [cursor=pointer]:
                - /url: https://gallica.bnf.fr
            - listitem [ref=e403]:
              - link "OpenEdition" [ref=e404] [cursor=pointer]:
                - /url: https://www.openedition.org
        - generic [ref=e409]:
          - heading "Contact" [level=4] [ref=e410]
          - list [ref=e411]:
            - listitem [ref=e412]:
              - generic [ref=e416]: Université de Yaoundé I Yaoundé, Cameroun
            - listitem [ref=e417]:
              - generic [ref=e420]: + 237 242 06 47 28
            - listitem [ref=e421]:
              - generic [ref=e425]: biblio.Bibliotheque@uy1.uninet.cm
          - generic [ref=e426]:
            - generic [ref=e427]: Horaires d'ouverture
            - generic [ref=e428]: "Lun – Ven : 07h30 – 16h30Samedi ,Dimanche : Fermé"
      - generic [ref=e429]:
        - generic [ref=e430]: © 2026 Bibliothèque Centrale Universitaire – Université de Yaoundé I. Tous droits réservés.
        - generic [ref=e431]:
          - link "Mentions légales" [ref=e432] [cursor=pointer]:
            - /url: /mentions-legales
          - link "Confidentialité" [ref=e433] [cursor=pointer]:
            - /url: /confidentialite
```

# Test source

```ts
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
  56  |     await expect(heading).toBeVisible({ timeout: 20000 });
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
> 120 |     await expect(page.getByText(/Thèses.*mémoires/i)).toBeVisible({ timeout: 10000 });
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  157 |   test('la page Archives se charge et affiche du contenu', async ({ page }) => {
  158 |     await page.goto('/archives', { waitUntil: 'domcontentloaded' });
  159 |     await expect(page.locator('body')).toBeAttached();
  160 |     // Vérifier qu'un en-tête quelconque est présent
  161 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  162 |   });
  163 | 
  164 |   test('la page Connexion affiche un formulaire de saisie', async ({ page }) => {
  165 |     await page.goto('/connexion', { waitUntil: 'domcontentloaded' });
  166 |     await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  167 |   });
  168 | 
  169 |   test('le lien Thèses des accès rapides fonctionne', async ({ page }) => {
  170 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  171 |     const link = page.getByRole('link', { name: /Thèses.*Mémoires/i }).first();
  172 |     await expect(link).toBeVisible({ timeout: 15000 });
  173 |     await link.click();
  174 |     await expect(page).toHaveURL(/\/theses/);
  175 |   });
  176 | 
  177 | });
  178 | 
  179 | test.describe('Portail frontend – Formulaire Contact', () => {
  180 | 
  181 |   test('la page Contact s\'affiche avec les infos de la BU', async ({ page }) => {
  182 |     await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  183 |     await expect(page.getByRole('heading', { name: /nous contacter/i })).toBeVisible({ timeout: 10000 });
  184 |     await expect(page.getByText(/Université de Yaoundé I/i).first()).toBeVisible({ timeout: 10000 });
  185 |   });
  186 | 
  187 |   test('soumet le formulaire de contact en mode démo', async ({ page }) => {
  188 |     await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  189 | 
  190 |     await page.getByLabel(/nom/i).fill('Test utilisateur');
  191 |     await page.getByLabel(/email/i).fill('test@example.com');
  192 |     await page.getByLabel(/sujet/i).selectOption({ label: /renseignements généraux/i });
  193 |     await page.getByLabel(/message/i).fill('Bonjour, ceci est un test automatique de formulaire pour le portail.');
  194 |     await page.getByRole('button', { name: /envoyer/i }).click();
  195 | 
  196 |     await expect(page.getByText(/message envoyé/i)).toBeVisible({ timeout: 15000 });
  197 |   });
  198 | 
  199 | });
  200 | 
```
# Portail Frontend

Repository
----------
https://github.com/Site-BCUY1/portail-frontend

Description
-----------
Frontend pour le projet "Portail". Application web construite avec Vite (probablement React/Vue) — gère l'interface utilisateur, pages publiques, et interactions avec l'API backend.

Arborescence clé
----------------
- `package.json` — dépendances et scripts.
- `vite.config.js` — configuration Vite.
- `src/` — code source de l'application.
- `public/` — fichiers statiques publics.
- `Dockerfile`, `.dockerignore` — conteneurisation.

Prérequis
---------
- Node.js 16+ (ou version compatible définie dans `package.json`).
- npm ou yarn.
- Git, Docker (optionnel).

Installation locale (développement)
----------------------------------
1. Cloner le repo et se placer dans le dossier frontend :

```bash
git clone https://github.com/Site-BCUY1/portail-frontend.git
cd portail-frontend
```

2. Installer les dépendances :

```bash
npm install
# ou
yarn
```

3. Démarrer le serveur de développement :

```bash
npm run dev
# ou
yarn dev
```

Build et déploiement
--------------------
Pour construire l'application :

```bash
npm run build
# ou
yarn build
```

Le dossier `dist/` contient la version construite. Servez-le via Nginx ou un hébergeur statique.

Configuration de l'API
----------------------
- Vérifiez dans le code (probablement `src/config` ou fichiers d'environnement) l'URL du backend. Utilisez les variables d'environnement `VITE_API_*` ou similaires selon le code.

Tests
-----
- Le repo contient un dossier `tests/` et `playwright` : lancez les tests via la commande définie dans `package.json` (par ex. `npm test` ou `npm run test:e2e`).

Linting et qualité
------------------
- Utilisez `eslint`, `prettier`, et les scripts définis dans `package.json`.

Docker
------
Exemple minimal :

```bash
docker build -t portail-frontend:latest .
docker run --rm -p 80:80 portail-frontend:latest
```

Commandes utiles
---------------
- `npm install` — installer dépendances
- `npm run dev` — démarrer en dev
- `npm run build` — build de production
- `npm run test` — lancer tests

Dépannage
---------
- Erreurs de dépendances : supprimez `node_modules/` et relancez `npm install`.
- Problèmes de CORS : vérifiez la configuration du backend et les entêtes dans les requêtes.

Contribuer
----------
- Forkez, branchez, PR. Respectez les scripts de build et tests.

Références
----------
- Voir `src/` pour la structure et `package.json` pour scripts détaillés.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

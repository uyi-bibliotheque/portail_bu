# Portail Backend

Repository
----------
https://github.com/Site-BCUY1/portail-backend-/

Description
-----------
Backend Django du projet "Portail" — API, administration, gestion des documents, prêts et mémoires.

Arborescence clé
----------------
- `manage.py` — utilitaire Django.
- `requirements.txt` — dépendances Python.
- `Dockerfile`, `.dockerignore`, `entrypoint.sh` — pour déploiement en conteneur.
- `apps/` — applications Django (accounts, catalog, memoires, etc.).
- `config/` — configuration Django (`settings.py`, `wsgi.py`, `asgi.py`).
- `media/`, `static/` — fichiers uploadés et fichiers statiques.

Prérequis
---------
- Python 3.10+ (adapter selon `requirements.txt`).
- pip ou un gestionnaire d'environnements (venv, virtualenv, poetry).
- PostgreSQL (recommandé) ou SQLite pour tests rapides.
- Git, Docker (optionnel pour conteneurisation).

Installation locale (développement)
----------------------------------
1. Cloner le repo et se placer dans le dossier backend :

```bash
git clone https://github.com/Site-BCUY1/portail-backend-.git
cd portail-backend
```

2. Créer et activer un environnement virtuel :

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Copier le fichier d'exemple d'environnement et définir les variables :

```bash
cp .env.example .env
# Éditez .env pour configurer la DB, clés secrètes, etc.
```

4. Appliquer les migrations et créer un superutilisateur :

```bash
python manage.py migrate
python manage.py createsuperuser
```

5. Lancer le serveur de développement :

```bash
python manage.py runserver
```

Variables d'environnement importantes
------------------------------------
- `DJANGO_SECRET_KEY` — clé secrète Django.
- `DATABASE_URL` — URL de connexion à la base de données (ex: `postgres://user:pass@host:5432/dbname`).
- `DEBUG` — 0/1 en production.
- `ALLOWED_HOSTS` — hôtes autorisés.
- Clés API tierces (mail, stockage cloud, etc.).

Base de données
---------------
- En développement, SQLite peut être utilisé (fichier `db.sqlite3` présent). En production, utilisez PostgreSQL ou autre SGBD.
- Si vous migrez depuis SQLite vers Postgres, exportez et réimportez les données ou recréez via fixtures.

Fichiers statiques et médias
----------------------------
- En dev, Django sert les fichiers statiques. En production, collectez les fichiers statiques :

```bash
python manage.py collectstatic --noinput
```

- Configurez un stockage externe (S3, etc.) pour `MEDIA`/`STATIC` si nécessaire.

Tests
-----
Lancer les tests unitaires :

```bash
python manage.py test
```

Linting et qualité
------------------
- Utilisez `flake8`, `isort`, `black` ou autres outils définis dans le repo (installer via `requirements-dev.txt` si existant).

Docker (développement / production)
----------------------------------
Le repo contient un `Dockerfile` et `.dockerignore`. Exemple minimal pour lancer en local :

```bash
# build
docker build -t portail-backend:dev .

# run (avec .env monté ou variables passées)
docker run --rm -p 8000:8000 --env-file .env portail-backend:dev
```

Si vous utilisez `docker-compose` (racine du workspace), vérifiez `docker-compose.yml` et adaptez les volumes/env.

Sécurité et secrets
-------------------
- Ne commitez jamais `.env` ni les secrets. Assurez-vous que `portail-backend/.gitignore` inclut `.env`.
- Si des secrets ont été commis précédemment, purgez l'historique (voir la documentation durepo ou utilisez `git filter-repo` / BFG) et révoquez les clés exposées.

Déploiement
-----------
- Étapes générales : installer dépendances, configurer variables d'environnement, exécuter migrations, collectstatic, démarrer via Gunicorn/ASGI + reverse proxy (nginx).
- Exemple système de production :

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

Commandes utiles
---------------
- `python manage.py migrate` — appliquer migrations
- `python manage.py makemigrations` — générer migrations
- `python manage.py createsuperuser` — créer admin
- `python manage.py collectstatic` — collecter fichiers statiques

Dépannage
---------
- Erreur de migration : supprimer les fichiers temporaires ou recréer la DB (en dev).
- Problèmes de permissions sur `media/` : assurez-vous que l'utilisateur du processus web peut écrire dans ce dossier.

Contribuer
----------
- Forkez le repo, créez une branche nommée `feature/...` ou `fix/...`, faites une PR.
- Respectez les tests et la qualité existante.

Références
----------
- Voir le code dans `apps/` et la configuration dans `config/settings.py` pour plus de détails.

Documentation API (OpenAPI / Swagger)
------------------------------------
Le projet expose une documentation OpenAPI générée par `drf-spectacular`.

- Endpoints disponibles (après démarrage du serveur local) :

```text
GET /api/schema/                 -> OpenAPI JSON
GET /api/schema/swagger-ui/      -> Swagger UI interactif
GET /api/schema/redoc/           -> Redoc UI
```

Pour activer la documentation en local :

```bash
# installer la dépendance puis démarrer le serveur
pip install -r requirements.txt
python manage.py runserver
```

Notes:
- `drf-spectacular` est déjà ajouté à `requirements.txt` et activé dans `config/settings.py`.
- Si vous préférez `drf-yasg`, remplacez la configuration dans `config/urls.py` et `requirements.txt`.

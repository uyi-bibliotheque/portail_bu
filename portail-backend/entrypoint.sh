#!/bin/sh
set -e

echo "=== DÉMARRAGE CONTAINER BACKEND DJANGO ==="

# ═══════════════════════════════════════════════════════════════════
# CHARGEMENT DU .env
# ═══════════════════════════════════════════════════════════════════

if [ -f /app/.env ]; then
    echo "✅ Chargement du fichier .env"

    # Exporter automatiquement toutes les variables du .env
    set -a
    . /app/.env
    set +a

    echo "DEBUG = ${DEBUG:-Non défini}"
else
    echo "⚠️ Fichier .env non trouvé"
fi


# ═══════════════════════════════════════════════════════════════════
# ATTENTE POSTGRESQL
# ═══════════════════════════════════════════════════════════════════

if [ "$USE_POSTGRES" = "True" ] || [ "$DB_HOST" = "db" ]; then
    echo "⏳ Attente de la base de données PostgreSQL (${DB_HOST:-db}:${DB_PORT:-5432})..."

    while ! nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
        sleep 1
    done

    echo "✅ PostgreSQL est prêt !"
fi


# ═══════════════════════════════════════════════════════════════════
# MIGRATIONS DJANGO
# ═══════════════════════════════════════════════════════════════════

echo "📦 Application des migrations..."

python manage.py migrate --noinput

echo "✅ Migrations terminées"


# ═══════════════════════════════════════════════════════════════════
# CRÉATION / VÉRIFICATION ADMINISTRATEUR
# ═══════════════════════════════════════════════════════════════════

echo "👤 Vérification de l'administrateur par défaut..."

if [ -f /app/create_admin.py ]; then
    python /app/create_admin.py
    echo "✅ Vérification de l'administrateur terminée"
else
    echo "⚠️ /app/create_admin.py introuvable"
fi


# ═══════════════════════════════════════════════════════════════════
# FICHIERS STATIQUES
# ═══════════════════════════════════════════════════════════════════

echo "📦 Collecte des fichiers statiques..."

python manage.py collectstatic --noinput --clear || true

echo "✅ Fichiers statiques traités"


# ═══════════════════════════════════════════════════════════════════
# STRUCTURE D'ARCHIVAGE
# ═══════════════════════════════════════════════════════════════════

echo "📁 Initialisation de la structure des dossiers d'archivage..."

python -c "
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from config.settings import create_archive_structure

create_archive_structure()
"

echo "✅ Structure d'archivage initialisée"


# ═══════════════════════════════════════════════════════════════════
# DÉMARRAGE GUNICORN
# ═══════════════════════════════════════════════════════════════════

echo "🚀 Démarrage du serveur Django / Gunicorn..."

exec "$@"


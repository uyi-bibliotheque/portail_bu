#!/bin/sh
set -e

echo "=== DÉMARRAGE CONTAINER BACKEND DJANGO ==="

# CHARGER LE .env CORRECTEMENT
if [ -f /app/.env ]; then
    echo "✅ Chargement du fichier .env"
    # Utiliser set -a pour exporter toutes les variables automatiquement
    set -a
    . /app/.env
    set +a
    echo "DEBUG = ${DEBUG:-Non défini}"
else
    echo "⚠️  Fichier .env non trouvé"
fi

if [ "$USE_POSTGRES" = "True" ] || [ "$DB_HOST" = "db" ]; then
    echo "Attente de la base de données PostgreSQL (${DB_HOST:-db}:${DB_PORT:-5432})..."
    while ! nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
      sleep 1
    done
    echo "PostgreSQL est prêt !"
fi

echo "Application des migrations..."
python manage.py migrate --noinput

echo "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --clear || true

echo "Initialisation de la structure des dossiers d'archivage..."
python -c "
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from config.settings import create_archive_structure
create_archive_structure()
" || true

echo "Démarrage du serveur Django / Gunicorn..."
exec "$@"
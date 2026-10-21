#!/bin/bash
set -e
cd ~/apps/portail_bu

echo "🛑 Arrêt du frontend..."
docker compose down frontend
docker rm -f portail_frontend 2>/dev/null || true

echo "🔨 Rebuild avec cache bust..."
CACHEBUST=$(date +%s) docker compose build frontend

echo "🚀 Redémarrage..."
docker compose up -d --force-recreate frontend

echo ""
echo "✅ Frontend rebuild avec succès !"
echo "🌐 Teste avec Ctrl+Shift+N sur http://bcuy1/ressources/electroniques"

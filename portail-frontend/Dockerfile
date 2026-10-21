# ============================================================
# Étape 1 : Construction de l'application React Vite
# ============================================================
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# ✅ Configuration de npm pour éviter les erreurs réseau (ECONNRESET)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set audit false && \
    npm config set fund false

# ✅ Installation des dépendances avec retry automatique
RUN i=0; until npm ci --prefer-offline --no-audit --no-fund; do \
      i=$((i+1)); \
      if [ "$i" -ge 5 ]; then echo "❌ npm ci a échoué après $i tentatives"; exit 1; fi; \
      echo "⚠️  npm ci a échoué (tentative $i); nouvelle tentative dans 15s"; \
      sleep 15; \
    done

# ✅ CACHE BUSTER : cet ARG force Docker à invalider le cache de toutes les
# couches suivantes dès que sa valeur change. Doit être passé par
# docker-compose via build.args ou par --build-arg CACHEBUST=$(date +%s).
ARG CACHEBUST=0
RUN echo "🔨 Cache bust value : ${CACHEBUST}"

# Copie du code source
COPY . .

# ✅ Suppression des caches Vite locaux et du dist précédent
# (au cas où ils auraient été copiés par erreur via COPY . .)
RUN rm -rf node_modules/.vite node_modules/.cache dist .vite

# ✅ VÉRIFICATION CRITIQUE : le fichier StaticPages.jsx doit contenir DatabaseLogo.
# Si ce n'est pas le cas, le build échoue immédiatement (fail fast).
RUN test -f src/pages/StaticPages.jsx \
    && grep -q "DatabaseLogo" src/pages/StaticPages.jsx \
    && echo "✅ StaticPages.jsx avec DatabaseLogo détecté" \
    || (echo "❌ ÉCHEC : StaticPages.jsx manquant ou sans DatabaseLogo" && exit 1)

# ✅ VÉRIFICATION : les 7 logos doivent être présents
RUN test -f src/assets/images/logo/R4L25-coloured-logo-transparent-background.png \
    && test -f src/assets/images/logo/OpenDOAR-logo.png \
    && test -f src/assets/images/logo/doaj.png \
    && test -f src/assets/images/logo/openedition_72dpi.png \
    && test -f src/assets/images/logo/elsevier-ar21.svg \
    && test -f src/assets/images/logo/gallica_25_fr.png \
    && test -f src/assets/images/logo/hal_25_fr.png \
    && echo "✅ Les 7 logos sont présents" \
    || (echo "❌ ÉCHEC : un ou plusieurs logos sont manquants" && exit 1)

# ✅ Touch de tous les fichiers sources pour forcer Vite à les recompiler
# (Vite utilise parfois les timestamps pour décider quoi recompiler)
RUN find src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" \) -exec touch {} \;

# Argument & Variable d'environnement de build (chemin relatif par défaut pour passer par Nginx)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

# ✅ Build du bundle de production avec plus de mémoire allouée
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ✅ VÉRIFICATION : on cherche un mot qui survit à la minification
RUN grep -rl "R4L25-coloured-logo\|Research4Life\|OpenDOAR" dist/assets/*.js \
    && echo "✅ Contenu des logos bien présent dans le bundle final" \
    || (echo "❌ ÉCHEC : Logos absents du bundle compilé" && exit 1)

# ============================================================
# Étape 2 : Serveur Nginx léger pour servir la SPA
# ============================================================
FROM nginx:alpine AS production-stage

# ✅ Installation de curl pour le healthcheck
RUN apk add --no-cache curl

# Copie des assets compilés depuis le stage de build
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx sur-mesure
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Healthcheck pour vérifier que Nginx fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
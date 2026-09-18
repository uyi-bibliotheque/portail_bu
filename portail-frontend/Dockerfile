# Étape 1 : Construction de l'application React Vite
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

# Copie du code source
COPY . .

# Argument & Variable d'environnement de build (chemin relatif par défaut pour passer par Nginx)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

# ✅ Build du bundle de production avec plus de mémoire allouée
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Étape 2 : Serveur Nginx léger pour servir la SPA et gérer le reverse proxy
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
# ============================================================
# Dockerfile Backend — Version optimisée
# ============================================================
FROM python:3.11-slim-bookworm

# Empêcher Python d'écrire des fichiers .pyc et forcer la sortie stdout/stderr non tamponnée
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# ------------------------------------------------------------
# 1) Dépendances système en UNE seule couche (optimisé)
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    python3-dev \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ------------------------------------------------------------
# 2) Dépendances Python — avec cache pip monté (BuildKit)
# ------------------------------------------------------------
COPY requirements.txt /app/

# Utilisation du cache pip pour accélérer les rebuilds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# ------------------------------------------------------------
# 3) Copie du code applicatif
# ------------------------------------------------------------
COPY . /app/

# Rendre le script entrypoint exécutable
RUN chmod +x /app/entrypoint.sh

# ------------------------------------------------------------
# 4) Point d'entrée
# ------------------------------------------------------------
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", \
    "--bind", "0.0.0.0:8000", \
    "--workers", "3", \
    "--timeout", "120", \
    "--access-logfile", "-", \
    "--error-logfile", "-"]
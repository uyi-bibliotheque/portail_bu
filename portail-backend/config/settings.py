# config/settings.py - VERSION COMPLÈTE OPTIMISÉE

import os
import sys
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
from django.utils import timezone

# ═══════════════════════════════════════════════════════════════════
# ─── BASE ET CHARGEMENT DES VARIABLES ─────────────────────────────
# ═══════════════════════════════════════════════════════════════════

BASE_DIR = Path(__file__).resolve().parent.parent

# Charger les variables du fichier .env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Indiquer à Python de chercher directement dans le dossier "apps"
sys.path.insert(0, str(BASE_DIR / 'apps'))

# ═══════════════════════════════════════════════════════════════════
# ─── VARIABLES D'ENVIRONNEMENT ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-secret-key-pour-le-dev')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ═══════════════════════════════════════════════════════════════════
# ─── APPLICATIONS DJANGO ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    #'snowpenguin.django.recaptcha3',
]

PROJECT_APPS = [
    'apps.core',
    'apps.pmb_gateway',
    'apps.accounts',
    'apps.catalog',
    'apps.memoires',
    'apps.doc_manager',
    'apps.loans_manager',
    'apps.user_favorites',
    'apps.site_content',
    'apps.stats_dashboard',
    'apps.admin_config',
    'apps.notifications',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + PROJECT_APPS

# ═══════════════════════════════════════════════════════════════════
# ─── MIDDLEWARE ────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# ═══════════════════════════════════════════════════════════════════
# ─── TEMPLATES ─────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ═══════════════════════════════════════════════════════════════════
# ─── BASE DE DONNÉES ───────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

USE_POSTGRES = os.getenv('USE_POSTGRES', 'False') == 'True'

if USE_POSTGRES:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'portail_bu'),
            'USER': os.getenv('DB_USER', 'portail_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'bcu_secure_pass_2026'),
            'HOST': os.getenv('DB_HOST', '127.0.0.1'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 60,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'accounts.PortalUser'

# ═══════════════════════════════════════════════════════════════════
# ─── INTERNATIONALISATION ──────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

# ═══════════════════════════════════════════════════════════════════
# ─── FICHIERS STATIQUES ET MÉDIAS ─────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = []

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

media_dirs = [
    'memoires_pdf', 'memoires_word', 'memoires_scanned',
    'quitus_files', 'news_images',
]
for dir_name in media_dirs:
    dir_path = os.path.join(MEDIA_ROOT, dir_name)
    os.makedirs(dir_path, mode=0o755, exist_ok=True)

FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# ═══════════════════════════════════════════════════════════════════
# ─── CONFIGURATION EMAIL ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

# ✅ Adresse principale qui reçoit les messages du formulaire de contact
CONTACT_RECIPIENT = 'biblio.Bibliotheque@uy1.uninet.cm'
CONTACT_RECIPIENTS = ['biblio.Bibliotheque@uy1.uninet.cm']

# Expéditeur (utilisé par le SMTP Offilive)
CONTACT_EMAIL = os.getenv('CONTACT_EMAIL', 'bcuy1-portail@offilive.com')
NOTIFICATIONS_EMAIL = os.getenv('NOTIFICATIONS_EMAIL', 'bcuy1-portail@offilive.com')

# Configuration SMTP
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.offilive.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'bcuy1-portail@offilive.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', f"BCU UYI <{CONTACT_EMAIL}>")

ADMINS = [('Admin BCU', 'bcuy1-portail@offilive.com')]
MANAGERS = ADMINS

if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("⚠️  EMAIL: Utilisation du backend console (aucun email réel envoyé)")
else:
    print(f"✅ EMAIL: Configuré - Envoi vers {CONTACT_RECIPIENT}")
# ═══════════════════════════════════════════════════════════════════
# ─── REST FRAMEWORK ────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '300/minute',
        'login': '10/minute',
        'contact': '5/minute',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Portail BCU API',
    'DESCRIPTION': 'OpenAPI schema pour le backend Portail (BCU UYI).',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# ═══════════════════════════════════════════════════════════════════
# ─── SÉCURITÉ - GESTION INTELLIGENTE DEV/PROD ────────────────────
# ═══════════════════════════════════════════════════════════════════

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bcu-uyi.cm",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bcu-uyi.cm",
]

# ═══════════════════════════════════════════════════════════════════
# ─── CONFIGURATION SSL ADAPTATIVE ─────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

X_FRAME_OPTIONS = 'DENY'
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Configuration SSL selon l'environnement
if DEBUG:
    # ═══ MODE DÉVELOPPEMENT ═══
    print("🔧 MODE DÉVELOPPEMENT - HTTPS désactivé")
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # ═══ MODE PRODUCTION ═══
    print("🔒 MODE PRODUCTION - HTTPS activé")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 an
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    CORS_ALLOW_ALL_ORIGINS = False

# ═══════════════════════════════════════════════════════════════════
# ─── LOGGING ──────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if DEBUG else 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'apps.memoires': {'handlers': ['console', 'file'], 'level': 'DEBUG', 'propagate': True},
        'apps.accounts': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': True},
        'apps.notifications': {'handlers': ['console', 'file'], 'level': 'DEBUG', 'propagate': True},
        'apps.site_content': {'handlers': ['console', 'file'], 'level': 'DEBUG', 'propagate': True},
        'django.request': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
    },
}

# ═══════════════════════════════════════════════════════════════════
# ─── CONFIGURATION DES MÉMOIRES ET THÈSES ─────────────────────────
# ═══════════════════════════════════════════════════════════════════

MEMOIRES = {
    'MAX_FILE_SIZE': 50 * 1024 * 1024,
    'ALLOWED_EXTENSIONS': ['.pdf', '.doc', '.docx'],
}

DOCUMENTS_ROOT = os.path.join(BASE_DIR.parent, 'Documents')
THESES_ROOT = os.path.join(DOCUMENTS_ROOT, 'THESES')
MEMOIRES_ROOT = os.path.join(DOCUMENTS_ROOT, 'MEMOIRES')

for folder in [DOCUMENTS_ROOT, THESES_ROOT, MEMOIRES_ROOT]:
    os.makedirs(folder, mode=0o755, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
# ─── MAPPING DES ÉTABLISSEMENTS ───────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

FACULTY_ABBREVIATIONS = {
    'FS': 'FS', 'FALSH': 'FALSH', 'FSE': 'FSE', 'FMSB': 'FMSB',
    'ENS': 'ENS', 'ENSPY': 'ENSPY', 'IUT_BOIS': 'IUT_BOIS',
    'IUT-BOIS': 'IUT_BOIS', 'IUTB': 'IUT_BOIS', 'UITB': 'IUT_BOIS',
    'POLYTECH': 'ENSPY',
    'Faculté des Sciences': 'FS', 'Sciences': 'FS',
    "Faculté des Sciences de l'Éducation": 'FSE',
    "Faculté des Sciences de l'Education": 'FSE',
    "Sciences de l'Éducation": 'FSE',
    "Faculté des Sciences Économiques": 'FSE',
    'Faculté de Médecine et des Sciences Biomédicales': 'FMSB',
    'Faculté de Médecine et Sciences Biomédicales': 'FMSB',
    'École Normale Supérieure de Yaoundé': 'ENS',
    'École Normale Supérieure': 'ENS',
    'École Nationale Supérieure Polytechnique de Yaoundé': 'ENSPY',
    'Polytech': 'ENSPY',
    'Faculté de Génie / Polytech': 'ENSPY',
    'Institut Universitaire de Technologie du Bois': 'IUT_BOIS',
    'IUT-Bois': 'IUT_BOIS',
    'UIT-Bois': 'IUT_BOIS',
    "Université d'Ingénierie / UIT-Bois": 'IUT_BOIS',
}

FACULTY_FULL_NAMES = {
    'FS': 'Faculté des Sciences',
    'FALSH': 'Faculté des Arts, Lettres et Sciences Humaines',
    'FSE': "Faculté des Sciences de l'Éducation",
    'FMSB': 'Faculté de Médecine et des Sciences Biomédicales',
    'ENS': 'École Normale Supérieure de Yaoundé',
    'ENSPY': 'École Nationale Supérieure Polytechnique de Yaoundé',
    'IUT_BOIS': 'Institut Universitaire de Technologie du Bois',
    'POLYTECH': 'École Nationale Supérieure Polytechnique de Yaoundé',
    'UITB': 'Institut Universitaire de Technologie du Bois',
    'AUTRE': 'Autre établissement',
}

DOCUMENT_TYPE_CODES = {'MEMOIRE': 'MEM', 'THESE': 'THESE'}
DOCUMENT_TYPE_FULL = {'MEM': 'Mémoire de Master', 'THESE': 'Thèse de Doctorat'}
SEQUENCE_PADDING = 4

# ═══════════════════════════════════════════════════════════════════
# ─── STRUCTURE D'ARCHIVAGE ─────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

def create_archive_structure():
    try:
        current_year = timezone.now().year
        for root_dir in [THESES_ROOT, MEMOIRES_ROOT]:
            for faculty_abbr in FACULTY_FULL_NAMES.keys():
                faculty_path = os.path.join(root_dir, faculty_abbr)
                os.makedirs(faculty_path, mode=0o755, exist_ok=True)
                for year in range(2020, 2031):
                    os.makedirs(os.path.join(faculty_path, str(year)), mode=0o755, exist_ok=True)
        print("✅ Structure d'archivage créée avec succès")
    except Exception as e:
        print(f"⚠️ Erreur création structure d'archivage: {e}")

try:
    create_archive_structure()
except Exception:
    pass

print(f"✅ Configuration chargée - EMAIL: {EMAIL_HOST_USER if EMAIL_HOST_USER else 'NON CONFIGURE'}")
print(f"🔍 DEBUG = {DEBUG} - {'🔧 DÉVELOPPEMENT' if DEBUG else '🔒 PRODUCTION'}")


# ═══════════════════════════════════════════════════════════════════
# ─── RECAPTCHA V3 (Google) ────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

RECAPTCHA_PUBLIC_KEY = os.getenv('RECAPTCHA_PUBLIC_KEY', '')
RECAPTCHA_PRIVATE_KEY = os.getenv('RECAPTCHA_PRIVATE_KEY', '')
RECAPTCHA_DEFAULT_ACTION = 'generic'
RECAPTCHA_SCORE_THRESHOLD = float(os.getenv('RECAPTCHA_SCORE_THRESHOLD', '0.5'))
RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

# Désactiver reCAPTCHA en dev si les clés ne sont pas définies
RECAPTCHA_ENABLED = bool(RECAPTCHA_PUBLIC_KEY and RECAPTCHA_PRIVATE_KEY)

if RECAPTCHA_ENABLED:
    print(f"✅ RECAPTCHA: Activé (seuil: {RECAPTCHA_SCORE_THRESHOLD})")
else:
    print("⚠️  RECAPTCHA: Désactivé (clés non configurées)")
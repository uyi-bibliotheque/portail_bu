# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# OpenAPI / Swagger
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# ✅ Import de la vue de contact
from apps.core.views.contact import ContactView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI schema and documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ✅ Route du formulaire de contact (envoie à biblio.Bibliotheque@uy1.uninet.cm)
    path('api/contact/', ContactView.as_view(), name='contact'),

    # Routes existantes
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.doc_manager.urls')),
    path('api/', include('apps.loans_manager.urls')),
    path('api/', include('apps.user_favorites.urls')),
    path('api/', include('apps.site_content.urls')),
    path('api/', include('apps.stats_dashboard.urls')),
    path('api/', include('apps.admin_config.urls')),
    path('api/', include('apps.memoires.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

# ═══════════════════════════════════════════════════════════════════
# ─── SERVIRE LES FICHIERS MÉDIA EN DÉVELOPPEMENT ─────────────────
# ═══════════════════════════════════════════════════════════════════

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# ═══════════════════════════════════════════════════════════════════
# ─── SERVIRE LES FICHIERS MÉDIA EN PRODUCTION ────────────────────
# ═══════════════════════════════════════════════════════════════════
# Note: En production, utilisez un serveur comme Nginx pour servir
# les fichiers média. Cette configuration est pour le développement.
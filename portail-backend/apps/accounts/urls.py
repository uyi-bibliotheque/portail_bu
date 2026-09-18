# apps/accounts/urls.py - VERSION COMPLÈTE AVEC MISE À JOUR PROFIL

from django.urls import path
from apps.accounts.views import (
    LoginView, UserProfileView,
    PasswordChangeView, PreferencesUpdateView,
    AdminUserListCreateView, AdminUserDetailView,
    StaffOnlyView,
    StudentRegistrationView,
    CheckAvailabilityView,
    AideBiblioDashboardView,
    AideBiblioCatalogRedirectView,
    AideBiblioStatsView,
)

urlpatterns = [
    # ─── AUTHENTIFICATION ──────────────────────────────────────────
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),

    # ─── MISE À JOUR DU PROFIL (self-service) ─────────────────────
    path('auth/change-password/', PasswordChangeView.as_view(), name='auth_change_password'),
    path('auth/preferences/', PreferencesUpdateView.as_view(), name='auth_preferences'),

    # ─── INSCRIPTION ──────────────────────────────────────────────
    path('auth/register/', StudentRegistrationView.as_view(), name='auth_register'),
    path('auth/check-availability/', CheckAvailabilityView.as_view(), name='auth_check_availability'),

    # ─── ADMINISTRATION ────────────────────────────────────────────
    path('accounts/users/', AdminUserListCreateView.as_view(), name='admin_users_list_create'),
    path('accounts/users/<uuid:id>/', AdminUserDetailView.as_view(), name='admin_users_detail'),
    path('staff/check/', StaffOnlyView.as_view(), name='staff_check'),

    # ─── AIDE-BIBLIOTHÉCAIRE ──────────────────────────────────────
    path('auth/aide-dashboard/', AideBiblioDashboardView.as_view(), name='aide_biblio_dashboard'),
    path('auth/aide-catalog/', AideBiblioCatalogRedirectView.as_view(), name='aide_biblio_catalog'),
    path('auth/aide-stats/', AideBiblioStatsView.as_view(), name='aide_biblio_stats'),
]
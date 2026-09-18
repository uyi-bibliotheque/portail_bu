# apps/memoires/urls.py - VERSION AVEC ROUTE DE TEST

from django.urls import path
from django.http import JsonResponse
from django.utils import timezone
from .views import (
    MemoireListCreateView,
    MemoireDetailView,
    MemoireFileUploadView,
    MemoireSearchView,
    MemoireVerifyView,
    MemoireScannedDocumentUploadView,
    MemoireQuitusSignView,
    MemoireQuitusRetrieveView,
    MemoireQuitusRetireView,
    MemoireStatsView,
    DepotCreateView,
    confirm_physical_signature,
    MemoireStatusUpdateView,
    MemoireFileDownloadView,
    ArchivedDocumentView,
    TestArchiveView,
    PublicArchivesListView,
    PublicArchiveDetailView,
)

# ─── ROUTE DE TEST ──────────────────────────────────────────────────
def test_public_route(request):
    return JsonResponse({
        "status": "ok",
        "message": "Route publique de test fonctionne!",
        "timestamp": str(timezone.now()),
        "url": request.build_absolute_uri()
    })

urlpatterns = [
    # ═══════════════════════════════════════════════════════════════
    # ─── ROUTE DE TEST (EN PREMIER) ──────────────────────────────
    # ═══════════════════════════════════════════════════════════════
    path('test/', test_public_route, name='test_public_route'),
    
    # ═══════════════════════════════════════════════════════════════
    # ─── ROUTES PUBLIQUES (SANS AUTHENTIFICATION) ─────────────────
    # ═══════════════════════════════════════════════════════════════
    
    # Liste publique des archives
    path('archives/public/', PublicArchivesListView.as_view(), name='public_archives_list'),
    
    # Détail public d'une archive
    path('archives/public/<uuid:id>/', PublicArchiveDetailView.as_view(), name='public_archive_detail'),
    
    # Document archivé (public)
    path('documents/archive/<path:file_path>/', 
         ArchivedDocumentView.as_view(), 
         name='archived_document'),
    
    # ═══════════════════════════════════════════════════════════════
    # ─── ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE) ──────────────
    # ═══════════════════════════════════════════════════════════════
    
    # Dépôt (étudiant)
    path('memoires/depot/', DepotCreateView.as_view(), name='memoire_depot'),
    
    # Liste et création (protégé)
    path('memoires/', MemoireListCreateView.as_view(), name='memoire_list_create'),
    path('memoires/<uuid:pk>/', MemoireDetailView.as_view(), name='memoire_detail'),
    
    # Upload de fichiers
    path('memoires/<uuid:pk>/upload/', MemoireFileUploadView.as_view(), name='memoire_file_upload'),
    
    # Téléchargement des fichiers
    path('memoires/<uuid:pk>/download/<str:file_type>/', 
         MemoireFileDownloadView.as_view(), 
         name='memoire_file_download'),
    
    # Mise à jour du statut (staff)
    path('memoires/<uuid:pk>/status/', MemoireStatusUpdateView.as_view(), name='memoire_status_update'),
    
    # Recherche (staff)
    path('memoires/recherche/', MemoireSearchView.as_view(), name='memoire_search'),
    
    # Vérification physique (staff)
    path('memoires/<uuid:pk>/verify/', MemoireVerifyView.as_view(), name='memoire_verify'),
    
    # Upload document scanné (staff)
    path('memoires/<uuid:pk>/scanned/', MemoireScannedDocumentUploadView.as_view(), name='memoire_scanned_upload'),
    
    # Signature du quitus (staff)
    path('memoires/<uuid:pk>/quitus-sign/', MemoireQuitusSignView.as_view(), name='memoire_quitus_sign'),
    
    # Récupération du quitus (staff)
    path('memoires/<uuid:pk>/quitus-retrieve/', MemoireQuitusRetrieveView.as_view(), name='memoire_quitus_retrieve'),
    
    # Confirmation du retrait (staff)
    path('memoires/<uuid:pk>/quitus-retire/', MemoireQuitusRetireView.as_view(), name='memoire_quitus_retire'),
    
    # Confirmation signature physique (staff)
    path('memoires/<uuid:pk>/physical-sign/', confirm_physical_signature, name='confirm_physical_signature'),
    
    # Statistiques (staff)
    path('memoires/stats/', MemoireStatsView.as_view(), name='memoire_stats'),
    
    # Test d'archivage (staff)
    path('memoires/<uuid:pk>/test-archive/', 
         TestArchiveView.as_view(), 
         name='test_archive'),
]
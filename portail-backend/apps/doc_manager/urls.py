from django.urls import path
from .views import DigitalDocumentListView, SecureDownloadView

urlpatterns = [
    # GET /api/documents/ -> Liste des documents numériques
    path('documents/', DigitalDocumentListView.as_view(), name='doc_manager_list'),
    
    # GET /api/documents/<uuid:pk>/download/ -> Téléchargement sécurisé
    path('documents/<uuid:pk>/download/', SecureDownloadView.as_view(), name='doc_manager_download'),
]
# catalog/urls.py
from django.urls import path
from catalog.views import (
    SearchCatalogView, NoticeDetailView, SuggestView,
    UserAccountView, AddReviewView, SuggestPurchaseView
)

urlpatterns = [
    # Recherche
    path('catalog/search/', SearchCatalogView.as_view(), name='catalog_search'),
    path('catalog/notice/<str:notice_id>/', NoticeDetailView.as_view(), name='notice_detail'),
    path('catalog/suggest/', SuggestView.as_view(), name='catalog_suggest'),
    
    # ─── NOUVEAUX ENDPOINTS ─────────────────────────────────────
    
    # Compte utilisateur
    path('catalog/account/', UserAccountView.as_view(), name='user_account'),
    
    # Avis sur les documents
    path('catalog/notice/<str:notice_id>/review/', AddReviewView.as_view(), name='add_review'),
    
    # Suggestion d'achat
    path('catalog/suggest-purchase/', SuggestPurchaseView.as_view(), name='suggest_purchase'),
]